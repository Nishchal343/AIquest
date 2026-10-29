# AI Quest student API contract

All application endpoints are versioned under `/api/v1`. Protected routes use `Authorization: Bearer <access_token>`.

## Public endpoints

- `GET /health` — liveness check.
- `POST /api/v1/auth/register` — creates a student account and returns a token. Terms consent is required. Referral codes are validated server-side.
- `POST /api/v1/auth/login/request-otp` — validates a student's password and sends a short-lived login code.
- `POST /api/v1/auth/login` — authenticates a student with the password and six-digit login code.
- `GET /api/v1/student/workshop` — returns the published workshop or the explicit `not_configured` state.
- `GET /api/v1/student/leaderboard?limit=50&offset=0` — returns only display name, college, XP, and rank.

## Authenticated student endpoints

- `GET /api/v1/auth/me` — current student profile only.
- `PUT /api/v1/student/identity` and `GET /api/v1/student/identity` — persist and retrieve the current student's identity result.
- `POST /api/v1/student/social-submissions` — creates one pending submission per campaign. It becomes review-eligible after 12 hours but is never auto-approved.
- `GET /api/v1/student/social-submissions/me` — current student's submission only.
- `GET /api/v1/student/referrals` — current student's code and aggregate referral status.
- `GET /api/v1/student/xp` — append-only XP ledger for the current student.
- `GET /api/v1/student/performance` — verified metrics for the current student; empty metrics are returned before activity exists.
- `GET /api/v1/student/quests` and `POST /api/v1/student/quests/complete` — seven-day schedule and submitted activity records.
- `GET /api/v1/student/project` and `PUT /api/v1/student/project` — current student's project submission.
- `GET /api/v1/student/quiz-attempts` and `POST /api/v1/student/quiz-attempts` — one server-scored AI Arena attempt.
- `POST /api/v1/student/workshops/{workshop_id}/check-in` — verifies attendance only when an organizer check-in secret is configured.
- `POST /api/v1/auth/verify-email` — consumes a one-time email verification token.
- `POST /api/v1/auth/password-reset/request` and `/api/v1/auth/password-reset/confirm` — privacy-safe password reset flow.

Prototype admin endpoints use the `X-Admin-Key` header matching `ADMIN_API_KEY`.

- `GET /api/v1/admin/overview` — learner, activity, referral, and outreach dashboard data.
- `PUT /api/v1/admin/workshop` — publishes the workshop title, schedule, and webinar link used by the student site.
- `POST /api/v1/admin/college-outreach` — sends the distance-based college coordinator email and records the result.
