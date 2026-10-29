from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    email_verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    profile: Mapped["StudentProfile"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    full_name: Mapped[str] = mapped_column(String(160))
    phone: Mapped[Optional[str]] = mapped_column(String(30))
    college: Mapped[str] = mapped_column(String(180))
    degree: Mapped[str] = mapped_column(String(120))
    branch: Mapped[str] = mapped_column(String(160))
    graduation_year: Mapped[int] = mapped_column(Integer)
    consent_marketing: Mapped[bool] = mapped_column(Boolean, default=False)
    user: Mapped[User] = relationship(back_populates="profile")


class IdentityResult(Base):
    __tablename__ = "identity_results"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    identity: Mapped[str] = mapped_column(String(80))
    rank: Mapped[str] = mapped_column(String(80))
    level: Mapped[int] = mapped_column(Integer)
    avatar_choice: Mapped[Optional[str]] = mapped_column(String(30))
    answer_payload: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class ReferralCode(Base):
    __tablename__ = "referral_codes"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    code: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class ReferralRelationship(Base):
    __tablename__ = "referral_relationships"
    id: Mapped[int] = mapped_column(primary_key=True)
    referrer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    referred_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    status: Mapped[str] = mapped_column(String(32), default="pending", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class SocialSubmission(Base):
    __tablename__ = "social_submissions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    platform: Mapped[str] = mapped_column(String(40))
    post_url: Mapped[str] = mapped_column(String(2048))
    evidence_ref: Mapped[Optional[str]] = mapped_column(String(1024))
    status: Mapped[str] = mapped_column(String(32), default="pending", index=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    eligible_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    __table_args__ = (UniqueConstraint("user_id", name="uq_social_submission_user_campaign"),)


class Workshop(Base):
    __tablename__ = "workshops"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    starts_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    timezone: Mapped[Optional[str]] = mapped_column(String(80))
    meeting_url: Mapped[Optional[str]] = mapped_column(String(2048))
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)


class WorkshopAttendance(Base):
    __tablename__ = "workshop_attendance"
    id: Mapped[int] = mapped_column(primary_key=True)
    workshop_id: Mapped[int] = mapped_column(ForeignKey("workshops.id", ondelete="CASCADE"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    status: Mapped[str] = mapped_column(String(32), default="unverified")
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    __table_args__ = (UniqueConstraint("workshop_id", "user_id", name="uq_workshop_attendance_student"),)


class XPTransaction(Base):
    __tablename__ = "xp_transactions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    activity_type: Mapped[str] = mapped_column(String(80))
    reference_id: Mapped[Optional[str]] = mapped_column(String(120))
    amount: Mapped[int] = mapped_column(Integer)
    verification_status: Mapped[str] = mapped_column(String(32), default="verified")
    idempotency_key: Mapped[str] = mapped_column(String(180), unique=True)
    awarded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    __table_args__ = (Index("ix_xp_user_awarded", "user_id", "awarded_at"),)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    actor_user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    action: Mapped[str] = mapped_column(String(120))
    target_type: Mapped[str] = mapped_column(String(80))
    target_id: Mapped[Optional[str]] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class QuestCompletion(Base):
    __tablename__ = "quest_completions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    day_number: Mapped[int] = mapped_column(Integer)
    activity_type: Mapped[str] = mapped_column(String(80))
    status: Mapped[str] = mapped_column(String(32), default="submitted")
    evidence_ref: Mapped[Optional[str]] = mapped_column(String(1024))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    __table_args__ = (UniqueConstraint("user_id", "day_number", name="uq_quest_completion_student_day"),)


class ProjectSubmission(Base):
    __tablename__ = "project_submissions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    title: Mapped[str] = mapped_column(String(180))
    problem_statement: Mapped[str] = mapped_column(Text)
    repository_url: Mapped[Optional[str]] = mapped_column(String(2048))
    demo_url: Mapped[Optional[str]] = mapped_column(String(2048))
    explanation: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(32), default="submitted", index=True)
    feedback: Mapped[Optional[str]] = mapped_column(Text)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    quiz_key: Mapped[str] = mapped_column(String(80))
    answer_payload: Mapped[str] = mapped_column(Text)
    score: Mapped[int] = mapped_column(Integer)
    total: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(32), default="submitted")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    __table_args__ = (UniqueConstraint("user_id", "quiz_key", name="uq_quiz_attempt_student_quiz"),)


class EmailToken(Base):
    __tablename__ = "email_tokens"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(128), unique=True)
    purpose: Mapped[str] = mapped_column(String(32))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class CollegeOutreach(Base):
    __tablename__ = "college_outreach"
    id: Mapped[int] = mapped_column(primary_key=True)
    college_name: Mapped[str] = mapped_column(String(180))
    coordinator_email: Mapped[str] = mapped_column(String(320))
    distance_km: Mapped[float] = mapped_column()
    option_key: Mapped[str] = mapped_column(String(40))
    workshop_url: Mapped[str] = mapped_column(String(2048))
    status: Mapped[str] = mapped_column(String(32), default="sent")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
