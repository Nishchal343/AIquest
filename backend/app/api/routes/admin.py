import hmac

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import func, select
from starlette.concurrency import run_in_threadpool

from app.api.deps import SessionDep
from app.core.config import get_settings
from app.models import CollegeOutreach, IdentityResult, ProjectSubmission, QuizAttempt, QuestCompletion, ReferralCode, ReferralRelationship, SocialSubmission, StudentProfile, User, Workshop, XPTransaction
from app.schemas.api import AdminWorkshopRequest, CollegeOutreachRequest
from app.services.notification_service import send_email

router = APIRouter(prefix="/admin", tags=["admin"])


async def require_admin(x_admin_key: str | None = Header(default=None)) -> None:
    if not x_admin_key or not hmac.compare_digest(x_admin_key, get_settings().admin_api_key):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin access key is invalid")


def admin_option(distance_km: float) -> tuple[str, str]:
    if distance_km <= 10:
        return "campus_visit", "Our team can come to your college and explain the workshop directly to students."
    return "college_groups", "Please forward the workshop link to your college WhatsApp, email, and student groups."


@router.get("/overview")
async def overview(session: SessionDep, _: None = Depends(require_admin)) -> dict:
    total_learners = await session.scalar(select(func.count()).select_from(User)) or 0
    verified_learners = await session.scalar(select(func.count()).select_from(User).where(User.email_verified_at.is_not(None))) or 0
    activity_users = select(XPTransaction.user_id).union(select(QuestCompletion.user_id), select(ProjectSubmission.user_id), select(QuizAttempt.user_id), select(SocialSubmission.user_id)).subquery()
    active_learners = await session.scalar(select(func.count()).select_from(activity_users)) or 0
    total_activities = 0
    for model in (XPTransaction, QuestCompletion, ProjectSubmission, QuizAttempt, SocialSubmission, IdentityResult):
        total_activities += await session.scalar(select(func.count()).select_from(model)) or 0
    referral_total = await session.scalar(select(func.count()).select_from(ReferralRelationship)) or 0
    referral_verified = await session.scalar(select(func.count()).select_from(ReferralRelationship).where(ReferralRelationship.status == "verified")) or 0

    student_rows = await session.execute(select(User, StudentProfile, ReferralCode).join(StudentProfile, StudentProfile.user_id == User.id).outerjoin(ReferralCode, ReferralCode.user_id == User.id).order_by(User.created_at.desc()))
    students = []
    for user, profile, code in student_rows.all():
        pending = await session.scalar(select(func.count()).select_from(ReferralRelationship).where(ReferralRelationship.referrer_id == user.id, ReferralRelationship.status == "pending")) or 0
        verified = await session.scalar(select(func.count()).select_from(ReferralRelationship).where(ReferralRelationship.referrer_id == user.id, ReferralRelationship.status == "verified")) or 0
        referral_rows = await session.execute(select(ReferralRelationship.status, User.email, StudentProfile.full_name).join(User, ReferralRelationship.referred_id == User.id).join(StudentProfile, StudentProfile.user_id == User.id).where(ReferralRelationship.referrer_id == user.id).order_by(ReferralRelationship.created_at.desc()))
        referrals = [{"full_name": name, "email": email, "status": referral_status} for referral_status, email, name in referral_rows.all()]
        students.append({"id": user.id, "full_name": profile.full_name, "email": user.email, "college": profile.college, "referral_code": code.code if code else None, "pending_referrals": pending, "verified_referrals": verified, "referrals": referrals, "created_at": user.created_at, "email_verified": bool(user.email_verified_at)})

    outreach_rows = await session.scalars(select(CollegeOutreach).order_by(CollegeOutreach.created_at.desc()).limit(50))
    outreach = [{"id": item.id, "college_name": item.college_name, "coordinator_email": item.coordinator_email, "distance_km": item.distance_km, "option_key": item.option_key, "workshop_url": item.workshop_url, "status": item.status, "created_at": item.created_at} for item in outreach_rows.all()]
    return {"summary": {"total_learners": total_learners, "verified_learners": verified_learners, "active_learners": active_learners, "total_activities": total_activities, "total_referrals": referral_total, "verified_referrals": referral_verified}, "students": students, "outreach": outreach}


@router.put("/workshop")
async def update_workshop(payload: AdminWorkshopRequest, session: SessionDep, _: None = Depends(require_admin)) -> dict:
    workshop = await session.scalar(select(Workshop).where(Workshop.is_published.is_(True)).order_by(Workshop.id.asc()))
    if not workshop:
        workshop = Workshop(is_published=True)
        session.add(workshop)
    workshop.title = payload.title
    workshop.description = payload.description
    workshop.starts_at = payload.starts_at
    workshop.timezone = payload.timezone
    workshop.meeting_url = str(payload.meeting_url) if payload.meeting_url else None
    await session.commit()
    return {"title": workshop.title, "description": workshop.description, "starts_at": workshop.starts_at, "timezone": workshop.timezone, "meeting_url": workshop.meeting_url, "status": "scheduled" if workshop.starts_at else "published"}


@router.post("/college-outreach")
async def send_college_outreach(payload: CollegeOutreachRequest, session: SessionDep, _: None = Depends(require_admin)) -> dict:
    workshop_url = str(payload.workshop_url) if payload.workshop_url else None
    if not workshop_url:
        workshop = await session.scalar(select(Workshop).where(Workshop.is_published.is_(True)).order_by(Workshop.id.asc()))
        workshop_url = workshop.meeting_url if workshop else get_settings().workshop_meeting_url
    if not workshop_url:
        raise HTTPException(status_code=400, detail="Save a webinar link before sending college outreach")
    option_key, option_text = admin_option(payload.distance_km)
    body = f"""Hello {payload.college_name} coordinator,\n\nWe are inviting your students to the AI Quest workshop.\n\nWorkshop link: {workshop_url}\n\n{option_text}\n\nPlease reply to this email with your preference or share the link with your student groups.\n\nRegards,\nAI Quest by NIAT"""
    delivered = await run_in_threadpool(send_email, str(payload.coordinator_email), f"AI Quest workshop invitation for {payload.college_name}", body)
    outreach = CollegeOutreach(college_name=payload.college_name, coordinator_email=str(payload.coordinator_email), distance_km=payload.distance_km, option_key=option_key, workshop_url=workshop_url, status="sent" if delivered else "failed")
    session.add(outreach)
    await session.commit()
    if not delivered:
        raise HTTPException(status_code=503, detail="The outreach email could not be sent. Check SMTP configuration and backend logs.")
    return {"status": "sent", "option": option_key, "message": option_text, "workshop_url": workshop_url}
