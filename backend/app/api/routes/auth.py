import hashlib
import secrets
from datetime import timedelta

from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from starlette.concurrency import run_in_threadpool
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.api.deps import CurrentUser, SessionDep
from app.core.config import get_settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models import EmailToken, ReferralCode, ReferralRelationship, StudentProfile, User
from app.schemas.api import LoginOtpRequest, LoginRequest, PasswordResetConfirmRequest, PasswordResetRequest, ProfileResponse, RegisterRequest, ResendVerificationRequest, TokenResponse, VerifyEmailRequest
from app.services.campaign_service import is_expired, utc_now
from app.services.notification_service import send_email

router = APIRouter(prefix="/auth", tags=["authentication"])


async def new_referral_code(session: SessionDep) -> str:
    for _ in range(5):
        code = secrets.token_urlsafe(7).replace("-", "").replace("_", "").upper()[:10]
        if not await session.scalar(select(ReferralCode).where(ReferralCode.code == code)):
            return code
    raise HTTPException(status_code=503, detail="Could not allocate a referral code")


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, session: SessionDep, background_tasks: BackgroundTasks) -> TokenResponse:
    email = payload.email.lower()
    if await session.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    referrer = None
    if payload.referral_code:
        referrer = await session.scalar(select(ReferralCode).where(ReferralCode.code == payload.referral_code.upper()))
        if not referrer:
            raise HTTPException(status_code=422, detail="Referral code is not valid")
    user = User(email=email, password_hash=hash_password(payload.password))
    profile = StudentProfile(user=user, full_name=payload.full_name, phone=payload.phone, college=payload.college, degree=payload.degree, branch=payload.branch, graduation_year=payload.graduation_year, consent_marketing=payload.consent_marketing)
    session.add(user)
    session.add(profile)
    await session.flush()
    session.add(ReferralCode(user_id=user.id, code=await new_referral_code(session)))
    verification_token = f"{secrets.randbelow(1_000_000):06d}"
    session.add(EmailToken(user_id=user.id, token_hash=hashlib.sha256(verification_token.encode()).hexdigest(), purpose="verify_email", expires_at=utc_now() + timedelta(hours=24)))
    if referrer and referrer.user_id != user.id:
        session.add(ReferralRelationship(referrer_id=referrer.user_id, referred_id=user.id))
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="Registration could not be completed")
    settings = get_settings()
    background_tasks.add_task(send_email, email, "Your AI Quest verification code", f"Your AI Quest verification code is {verification_token}. It expires in 24 hours. If you did not create this account, ignore this email.")
    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.post("/verify-email")
async def verify_email(payload: VerifyEmailRequest, session: SessionDep) -> dict:
    token_hash = hashlib.sha256(payload.token.encode()).hexdigest()
    token = await session.scalar(select(EmailToken).where(EmailToken.token_hash == token_hash, EmailToken.purpose == "verify_email", EmailToken.used_at.is_(None)))
    if not token or is_expired(token.expires_at):
        raise HTTPException(status_code=400, detail="Verification token is invalid or expired")
    user = await session.get(User, token.user_id)
    token.used_at = utc_now()
    user.email_verified_at = utc_now()
    await session.commit()
    return {"status": "verified"}


@router.post("/verify-email/resend")
async def resend_verification(payload: ResendVerificationRequest, session: SessionDep, background_tasks: BackgroundTasks) -> dict:
    user = await session.scalar(select(User).where(User.email == payload.email.lower()))
    if user and not user.email_verified_at:
        verification_token = f"{secrets.randbelow(1_000_000):06d}"
        session.add(EmailToken(user_id=user.id, token_hash=hashlib.sha256(verification_token.encode()).hexdigest(), purpose="verify_email", expires_at=utc_now() + timedelta(hours=24)))
        await session.commit()
        background_tasks.add_task(send_email, user.email, "Your AI Quest verification code", f"Your AI Quest verification code is {verification_token}. It expires in 24 hours.")
    return {"status": "If the account exists, a verification code will be sent."}


@router.post("/password-reset/request")
async def request_password_reset(payload: PasswordResetRequest, session: SessionDep, background_tasks: BackgroundTasks) -> dict:
    # Always return the same response to avoid revealing whether an email is registered.
    user = await session.scalar(select(User).where(User.email == payload.email.lower()))
    if user:
        raw_token = secrets.token_urlsafe(36)
        session.add(EmailToken(user_id=user.id, token_hash=hashlib.sha256(raw_token.encode()).hexdigest(), purpose="password_reset", expires_at=utc_now() + timedelta(hours=1)))
        await session.commit()
        settings = get_settings()
        background_tasks.add_task(send_email, user.email, "Reset your AI Quest password", f"Reset your password here: {settings.reset_url}?token={raw_token}")
    return {"status": "If the account exists, a reset link will be sent."}


@router.post("/password-reset/confirm")
async def confirm_password_reset(payload: PasswordResetConfirmRequest, session: SessionDep) -> dict:
    token_hash = hashlib.sha256(payload.token.encode()).hexdigest()
    token = await session.scalar(select(EmailToken).where(EmailToken.token_hash == token_hash, EmailToken.purpose == "password_reset", EmailToken.used_at.is_(None)))
    if not token or is_expired(token.expires_at):
        raise HTTPException(status_code=400, detail="Reset token is invalid or expired")
    user = await session.get(User, token.user_id)
    user.password_hash = hash_password(payload.new_password)
    token.used_at = utc_now()
    await session.commit()
    return {"status": "password_updated"}


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, session: SessionDep) -> TokenResponse:
    user = await session.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email or password is incorrect")
    otp_hash = hashlib.sha256(payload.otp.encode()).hexdigest()
    token = await session.scalar(select(EmailToken).where(EmailToken.user_id == user.id, EmailToken.token_hash == otp_hash, EmailToken.purpose == "login_otp", EmailToken.used_at.is_(None)))
    if not token or is_expired(token.expires_at):
        raise HTTPException(status_code=401, detail="The login code is invalid or expired")
    token.used_at = utc_now()
    if not user.email_verified_at:
        user.email_verified_at = utc_now()
    await session.commit()
    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.post("/login/request-otp")
async def request_login_otp(payload: LoginOtpRequest, session: SessionDep) -> dict:
    user = await session.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email or password is incorrect")

    previous_tokens = await session.scalars(select(EmailToken).where(EmailToken.user_id == user.id, EmailToken.purpose == "login_otp", EmailToken.used_at.is_(None)))
    issued_at = utc_now()
    for previous_token in previous_tokens:
        previous_token.used_at = issued_at
    login_token = f"{secrets.randbelow(1_000_000):06d}"
    session.add(EmailToken(user_id=user.id, token_hash=hashlib.sha256(login_token.encode()).hexdigest(), purpose="login_otp", expires_at=issued_at + timedelta(minutes=10)))
    await session.commit()
    delivered = await run_in_threadpool(send_email, user.email, "Your AI Quest login code", f"Your AI Quest login code is {login_token}. It expires in 10 minutes. If you did not try to sign in, reset your password.")
    if not delivered:
        raise HTTPException(status_code=503, detail="Login code could not be sent. Check the email service configuration and try again.")
    return {"status": "A login code has been sent if the credentials are valid."}


@router.get("/me", response_model=ProfileResponse)
async def me(user: CurrentUser, session: SessionDep) -> ProfileResponse:
    profile = await session.scalar(select(StudentProfile).where(StudentProfile.user_id == user.id))
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile is unavailable")
    return ProfileResponse(id=user.id, full_name=profile.full_name, email=user.email, phone=profile.phone, college=profile.college, degree=profile.degree, branch=profile.branch, graduation_year=profile.graduation_year)
