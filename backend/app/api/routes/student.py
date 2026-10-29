import json
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, select

from app.api.deps import CurrentUser, SessionDep
from app.core.config import get_settings
from app.models import IdentityResult, ProjectSubmission, QuizAttempt, QuestCompletion, ReferralCode, ReferralRelationship, SocialSubmission, StudentProfile, User, Workshop, WorkshopAttendance, XPTransaction
from app.schemas.api import IdentityRequest, IdentityResponse, ProjectSubmissionRequest, QuizAttemptRequest, QuestCompletionRequest, ReferralResponse, SocialSubmissionRequest, SocialSubmissionResponse, WorkshopResponse, XPResponse
from app.services.campaign_service import AI_ARENA_ANSWER_KEY, as_utc, schedule_payload, utc_now
from app.services.identity_service import save_identity
from app.services.xp_service import award_xp

router = APIRouter(prefix="/student", tags=["student"])


@router.put("/identity", response_model=IdentityResponse)
async def put_identity(payload: IdentityRequest, user: CurrentUser, session: SessionDep) -> dict:
    result = await save_identity(session, user.id, payload)
    await session.commit()
    return {"id": result.id, "identity": result.identity, "rank": result.rank, "level": result.level, "avatar_choice": result.avatar_choice, "answers": payload.answers, "created_at": result.created_at}


@router.get("/identity", response_model=IdentityResponse | None)
async def get_identity(user: CurrentUser, session: SessionDep) -> dict | None:
    result = await session.scalar(select(IdentityResult).where(IdentityResult.user_id == user.id))
    if not result:
        return None
    return {"id": result.id, "identity": result.identity, "rank": result.rank, "level": result.level, "avatar_choice": result.avatar_choice, "answers": json.loads(result.answer_payload), "created_at": result.created_at}


@router.post("/social-submissions", response_model=SocialSubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_social(payload: SocialSubmissionRequest, user: CurrentUser, session: SessionDep) -> SocialSubmission:
    current = await session.scalar(select(SocialSubmission).where(SocialSubmission.user_id == user.id))
    if current:
        raise HTTPException(status_code=409, detail="A social submission already exists for this campaign")
    submitted = datetime.now(timezone.utc)
    submission = SocialSubmission(user_id=user.id, platform=payload.platform, post_url=str(payload.post_url), evidence_ref=payload.evidence_ref, submitted_at=submitted, eligible_at=submitted + timedelta(hours=12), status="pending")
    session.add(submission)
    await session.commit()
    await session.refresh(submission)
    return submission


@router.get("/social-submissions/me", response_model=SocialSubmissionResponse | None)
async def get_social_submission(user: CurrentUser, session: SessionDep) -> SocialSubmission | None:
    submission = await session.scalar(select(SocialSubmission).where(SocialSubmission.user_id == user.id))
    if submission and submission.status == "pending" and as_utc(submission.eligible_at) <= utc_now():
        submission.status = "eligible_for_review"
        await session.commit()
    return submission


@router.get("/referrals", response_model=ReferralResponse)
async def referrals(user: CurrentUser, session: SessionDep) -> ReferralResponse:
    code = await session.scalar(select(ReferralCode).where(ReferralCode.user_id == user.id))
    if not code:
        raise HTTPException(status_code=404, detail="Referral code is unavailable")
    pending = await session.scalar(select(func.count()).select_from(ReferralRelationship).where(ReferralRelationship.referrer_id == user.id, ReferralRelationship.status == "pending")) or 0
    verified = await session.scalar(select(func.count()).select_from(ReferralRelationship).where(ReferralRelationship.referrer_id == user.id, ReferralRelationship.status == "verified")) or 0
    return ReferralResponse(code=code.code, link=f"{get_settings().public_app_url}/join?ref={code.code}", pending=pending, verified=verified)


@router.get("/referrals/details")
async def referral_details(user: CurrentUser, session: SessionDep) -> list[dict]:
    rows = await session.execute(select(ReferralRelationship.id, ReferralRelationship.status, ReferralRelationship.created_at).where(ReferralRelationship.referrer_id == user.id).order_by(ReferralRelationship.created_at.desc()))
    return [{"id": row.id, "status": row.status, "created_at": row.created_at} for row in rows]


@router.get("/quests")
async def quests(user: CurrentUser, session: SessionDep) -> list[dict]:
    completed = {item.day_number: item.status for item in (await session.scalars(select(QuestCompletion).where(QuestCompletion.user_id == user.id))).all()}
    return [{**item, "status": completed.get(item["day"], "open")} for item in schedule_payload()]


@router.post("/quests/complete", status_code=status.HTTP_201_CREATED)
async def complete_quest(payload: QuestCompletionRequest, user: CurrentUser, session: SessionDep) -> dict:
    existing = await session.scalar(select(QuestCompletion).where(QuestCompletion.user_id == user.id, QuestCompletion.day_number == payload.day_number))
    if existing:
        reward = await session.scalar(select(XPTransaction).where(XPTransaction.user_id == user.id, XPTransaction.idempotency_key == f"quest:{user.id}:day:{payload.day_number}"))
        return {"id": existing.id, "status": existing.status, "duplicate": True, "xp_awarded": reward.amount if reward else 0}
    completion = QuestCompletion(user_id=user.id, day_number=payload.day_number, activity_type=f"day_{payload.day_number}", evidence_ref=payload.evidence_ref, status="submitted")
    session.add(completion)
    await session.flush()
    reward = await award_xp(session, user_id=user.id, activity_type="quest_completion", amount=get_settings().quest_completion_xp, idempotency_key=f"quest:{user.id}:day:{payload.day_number}", reference_id=str(completion.id))
    await session.commit()
    return {"id": completion.id, "status": completion.status, "duplicate": False, "xp_awarded": reward.amount}


@router.put("/project", status_code=status.HTTP_201_CREATED)
async def submit_project(payload: ProjectSubmissionRequest, user: CurrentUser, session: SessionDep) -> dict:
    existing = await session.scalar(select(ProjectSubmission).where(ProjectSubmission.user_id == user.id))
    if existing:
        existing.title = payload.title
        existing.problem_statement = payload.problem_statement
        existing.repository_url = str(payload.repository_url) if payload.repository_url else None
        existing.demo_url = str(payload.demo_url) if payload.demo_url else None
        existing.explanation = payload.explanation
        existing.status = "resubmitted"
        await session.commit()
        return {"id": existing.id, "status": existing.status, "xp_awarded": 0}
    project = ProjectSubmission(user_id=user.id, title=payload.title, problem_statement=payload.problem_statement, repository_url=str(payload.repository_url) if payload.repository_url else None, demo_url=str(payload.demo_url) if payload.demo_url else None, explanation=payload.explanation)
    session.add(project)
    await session.flush()
    reward = await award_xp(session, user_id=user.id, activity_type="project_submission", amount=get_settings().project_submission_xp, idempotency_key=f"project:{user.id}", reference_id=str(project.id))
    await session.commit()
    return {"id": project.id, "status": project.status, "xp_awarded": reward.amount}


@router.get("/project")
async def get_project(user: CurrentUser, session: SessionDep) -> dict | None:
    project = await session.scalar(select(ProjectSubmission).where(ProjectSubmission.user_id == user.id))
    if not project:
        return None
    return {"id": project.id, "title": project.title, "problem_statement": project.problem_statement, "repository_url": project.repository_url, "demo_url": project.demo_url, "explanation": project.explanation, "status": project.status, "feedback": project.feedback, "submitted_at": project.submitted_at}


@router.post("/quiz-attempts", status_code=status.HTTP_201_CREATED)
async def submit_quiz(payload: QuizAttemptRequest, user: CurrentUser, session: SessionDep) -> dict:
    existing = await session.scalar(select(QuizAttempt).where(QuizAttempt.user_id == user.id, QuizAttempt.quiz_key == payload.quiz_key))
    if existing:
        return {"id": existing.id, "score": existing.score, "total": existing.total, "duplicate": True}
    score = sum(answer == expected for answer, expected in zip(payload.answers, AI_ARENA_ANSWER_KEY))
    attempt = QuizAttempt(user_id=user.id, quiz_key=payload.quiz_key, answer_payload=json.dumps(payload.answers), score=score, total=len(AI_ARENA_ANSWER_KEY), status="verified")
    session.add(attempt)
    await session.flush()
    await award_xp(session, user_id=user.id, activity_type="ai_arena_quiz", amount=get_settings().quiz_completion_xp, idempotency_key=f"quiz:{user.id}:{payload.quiz_key}", reference_id=str(attempt.id))
    await session.commit()
    return {"id": attempt.id, "score": score, "total": len(AI_ARENA_ANSWER_KEY), "duplicate": False}


@router.get("/quiz-attempts")
async def quiz_results(user: CurrentUser, session: SessionDep) -> list[dict]:
    attempts = (await session.scalars(select(QuizAttempt).where(QuizAttempt.user_id == user.id).order_by(QuizAttempt.created_at.desc()))).all()
    return [{"quiz_key": item.quiz_key, "score": item.score, "total": item.total, "status": item.status, "created_at": item.created_at} for item in attempts]


@router.post("/workshops/{workshop_id}/check-in")
async def check_in(workshop_id: int, check_in_code: str, user: CurrentUser, session: SessionDep) -> dict:
    secret = get_settings().workshop_check_in_secret
    if not secret:
        raise HTTPException(status_code=503, detail="Workshop check-in is not configured")
    if check_in_code != secret:
        raise HTTPException(status_code=400, detail="Check-in code is invalid")
    attendance = await session.scalar(select(WorkshopAttendance).where(WorkshopAttendance.workshop_id == workshop_id, WorkshopAttendance.user_id == user.id))
    if attendance:
        return {"status": attendance.status, "duplicate": True}
    attendance = WorkshopAttendance(workshop_id=workshop_id, user_id=user.id, status="verified", verified_at=utc_now())
    session.add(attendance)
    await award_xp(session, user_id=user.id, activity_type="workshop_attendance", amount=get_settings().workshop_attendance_xp, idempotency_key=f"attendance:{workshop_id}:{user.id}", reference_id=str(workshop_id))
    await session.commit()
    return {"status": "verified", "duplicate": False}


@router.get("/workshop", response_model=WorkshopResponse)
async def workshop(session: SessionDep) -> WorkshopResponse:
    settings = get_settings()
    record = await session.scalar(select(Workshop).where(Workshop.is_published.is_(True)).order_by(Workshop.starts_at.asc()))
    if not record:
        return WorkshopResponse(title=settings.workshop_title, description="The workshop schedule will be announced by the organiser.", starts_at=None, timezone=None, meeting_url=settings.workshop_meeting_url, status="not_configured")
    status_value = "scheduled" if record.starts_at else "published"
    return WorkshopResponse(title=record.title, description=record.description, starts_at=record.starts_at, timezone=record.timezone, meeting_url=record.meeting_url, status=status_value)


@router.get("/xp", response_model=XPResponse)
async def xp_history(user: CurrentUser, session: SessionDep) -> XPResponse:
    transactions = (await session.scalars(select(XPTransaction).where(XPTransaction.user_id == user.id).order_by(XPTransaction.awarded_at.desc()))).all()
    return XPResponse(total=sum(item.amount for item in transactions), transactions=[{"activity_type": item.activity_type, "amount": item.amount, "status": item.verification_status, "awarded_at": item.awarded_at, "reference_id": item.reference_id} for item in transactions])


@router.get("/performance")
async def performance(user: CurrentUser, session: SessionDep) -> dict:
    """Returns verified data only; empty metrics are intentional before activity exists."""
    xp = await session.scalar(select(func.coalesce(func.sum(XPTransaction.amount), 0)).where(XPTransaction.user_id == user.id))
    return {"xp": xp or 0, "daily_history": [], "quiz_accuracy": None, "project_milestones": [], "strengths": [], "improvement_areas": [], "next_recommendation": "Complete Day 1 to begin your verified growth report."}


@router.get("/leaderboard")
async def leaderboard(session: SessionDep, limit: int = 50, offset: int = 0, college: str | None = None) -> list[dict]:
    safe_limit = min(max(limit, 1), 100)
    query = select(StudentProfile.full_name, StudentProfile.college, func.coalesce(func.sum(XPTransaction.amount), 0).label("xp")).join(XPTransaction, XPTransaction.user_id == StudentProfile.user_id, isouter=True).group_by(StudentProfile.id).order_by(func.coalesce(func.sum(XPTransaction.amount), 0).desc(), StudentProfile.id.asc())
    if college:
        query = query.where(StudentProfile.college == college)
    rows = await session.execute(query.offset(max(offset, 0)).limit(safe_limit))
    return [{"rank": offset + index + 1, "display_name": name, "college": college, "xp": xp} for index, (name, college, xp) in enumerate(rows.all())]


@router.get("/leaderboard/colleges")
async def college_leaderboard(session: SessionDep, limit: int = 50, offset: int = 0) -> list[dict]:
    rows = await session.execute(select(StudentProfile.college, func.count(StudentProfile.id).label("students"), func.coalesce(func.sum(XPTransaction.amount), 0).label("xp")).join(XPTransaction, XPTransaction.user_id == StudentProfile.user_id, isouter=True).group_by(StudentProfile.college).order_by(func.coalesce(func.sum(XPTransaction.amount), 0).desc(), StudentProfile.college.asc()).offset(max(offset, 0)).limit(min(max(limit, 1), 100)))
    return [{"rank": offset + index + 1, "college": college, "students": students, "xp": xp} for index, (college, students, xp) in enumerate(rows.all())]
