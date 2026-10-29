from datetime import datetime
from typing import Literal

from pydantic import AnyHttpUrl, BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=30)
    college: str = Field(min_length=2, max_length=180)
    degree: str = Field(min_length=2, max_length=120)
    branch: str = Field(min_length=2, max_length=160)
    graduation_year: int = Field(ge=2024, le=2035)
    password: str = Field(min_length=8, max_length=128)
    referral_code: str | None = Field(default=None, max_length=32)
    consent_terms: bool
    consent_marketing: bool = False

    @field_validator("consent_terms")
    @classmethod
    def terms_required(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Terms and privacy consent is required")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    otp: str = Field(min_length=6, max_length=6)

    @field_validator("otp")
    @classmethod
    def otp_must_be_numeric(cls, value: str) -> str:
        if not value.isdigit():
            raise ValueError("OTP must contain six digits")
        return value


class LoginOtpRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"


class ProfileResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str | None
    college: str
    degree: str
    branch: str
    graduation_year: int


class IdentityRequest(BaseModel):
    identity: Literal["AI Problem Solver", "Automation Architect", "Creative AI Builder", "Data Detective"]
    rank: str = Field(min_length=2, max_length=80)
    level: int = Field(ge=1, le=100)
    avatar_choice: Literal["Male", "Female", "Later"] | None = None
    answers: list[str] = Field(min_length=5, max_length=5)


class IdentityResponse(BaseModel):
    id: int
    identity: str
    rank: str
    level: int
    avatar_choice: str | None
    answers: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class SocialSubmissionRequest(BaseModel):
    platform: Literal["Instagram", "LinkedIn", "X", "Other"]
    post_url: AnyHttpUrl
    evidence_ref: str | None = Field(default=None, max_length=1024)


class SocialSubmissionResponse(BaseModel):
    id: int
    platform: str
    post_url: str
    status: str
    submitted_at: datetime
    eligible_at: datetime

    model_config = {"from_attributes": True}


class ReferralResponse(BaseModel):
    code: str
    link: str
    pending: int
    verified: int


class WorkshopResponse(BaseModel):
    title: str
    description: str
    starts_at: datetime | None
    timezone: str | None
    meeting_url: str | None
    status: str


class AdminWorkshopRequest(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10, max_length=4000)
    starts_at: datetime | None = None
    timezone: str | None = Field(default=None, max_length=80)
    meeting_url: AnyHttpUrl | None = None


class CollegeOutreachRequest(BaseModel):
    college_name: str = Field(min_length=2, max_length=180)
    coordinator_email: EmailStr
    distance_km: float = Field(ge=0, le=1000)
    workshop_url: AnyHttpUrl | None = None


class XPResponse(BaseModel):
    total: int
    transactions: list[dict]


class QuestCompletionRequest(BaseModel):
    day_number: int = Field(ge=1, le=7)
    evidence_ref: str | None = Field(default=None, max_length=1024)


class ProjectSubmissionRequest(BaseModel):
    title: str = Field(min_length=3, max_length=180)
    problem_statement: str = Field(min_length=20, max_length=4000)
    repository_url: AnyHttpUrl | None = None
    demo_url: AnyHttpUrl | None = None
    explanation: str = Field(min_length=30, max_length=6000)


class QuizAttemptRequest(BaseModel):
    quiz_key: Literal["ai-arena"]
    answers: list[int] = Field(min_length=5, max_length=5)


class PasswordResetRequest(BaseModel):
    email: EmailStr


class VerifyEmailRequest(BaseModel):
    token: str = Field(min_length=6, max_length=200)


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirmRequest(BaseModel):
    token: str = Field(min_length=20, max_length=200)
    new_password: str = Field(min_length=8, max_length=128)
