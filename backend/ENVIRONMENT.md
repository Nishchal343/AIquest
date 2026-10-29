# Environment setup

Create `backend/.env` from `.env.example`.

## Required

```env
APP_ENV=development
DATABASE_URL=postgresql+asyncpg://aiquest:aiquest@localhost:5432/aiquest
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters-long
ALLOWED_ORIGINS=http://localhost:5173
PUBLIC_APP_URL=http://localhost:5173
```

`JWT_SECRET` must be unique and secret in production. `DATABASE_URL` must point to the deployed PostgreSQL database.

## Workshop and scoring

```env
WORKSHOP_TITLE=Build Your First AI Project in 60 Minutes
WORKSHOP_MEETING_URL=
WORKSHOP_CHECK_IN_SECRET=
WORKSHOP_ATTENDANCE_XP=100
QUIZ_COMPLETION_XP=75
PROJECT_SUBMISSION_XP=100
SOCIAL_REWARD_XP=50
REFERRAL_REWARD_XP=100
```

Leave `WORKSHOP_MEETING_URL` blank until a legitimate meeting link is configured. Leave `WORKSHOP_CHECK_IN_SECRET` blank until an authorized organizer check-in mechanism is ready. A join click never verifies attendance.

## Email verification and password reset

The app does not claim to send email unless SMTP is configured:

```env
EMAIL_PROVIDER=smtp
EMAIL_FROM=no-reply@your-domain.example
SMTP_HOST=smtp.your-provider.example
SMTP_PORT=587
SMTP_USERNAME=your-smtp-user
SMTP_PASSWORD=your-smtp-password
EMAIL_VERIFICATION_URL=https://your-frontend-domain.example/verify-email
PASSWORD_RESET_URL=https://your-frontend-domain.example/reset-password
ADMIN_API_KEY=replace-with-a-private-admin-key
```

The prototype admin dashboard is available at `/admin`. Run `alembic upgrade head` after pulling backend changes so the college outreach table exists. Configure SMTP before using the automated college email sender.

For local development, keep `EMAIL_PROVIDER=none`. Registration still creates pending verification state, but no message is sent.

## Frontend

Create `frontend/.env` when the API is deployed or running locally:

```env
VITE_API_BASE_URL=http://localhost:8000
```

If it is blank, the frontend uses temporary local browser persistence for previewing the journey; that mode is not authoritative and must not be used for a campaign launch.

For a local prototype without Docker/PostgreSQL, run `./start-local.ps1` from the `backend` folder. It uses `aiquest-local.db` and still serves the API on `http://127.0.0.1:8000`.

## Render deployment

The repository includes `render.yaml`. Create a Render Blueprint from the repository; it defines the frontend static site, Docker backend, and PostgreSQL database. The backend runs `alembic upgrade head` before each deploy, and the frontend receives the deployed backend URL during its build. Fill in the `sync: false` SMTP, admin, workshop, and other secret values in Render before the first deploy.
