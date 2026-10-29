from datetime import datetime, timezone

QUEST_SCHEDULE = [
    (1, "Explore the AI Universe", "Complete an AI tools exploration activity."),
    (2, "Build an App in 60 Minutes", "Complete the guided build and demonstrate the result."),
    (3, "Project Builder Challenge", "Submit a project idea and demonstrate meaningful progress."),
    (4, "The AI Arena", "Complete the official quiz within its time limit."),
    (5, "Submit, Polish and Learn", "Submit the completed project before the deadline."),
    (6, "Bonus XP Festival", "Earn bonus points within published limits."),
    (7, "The Grand Finale", "Finalize the eligible leaderboard under the published rules."),
]

# Must match the option order rendered by frontend/src/pages/StudentPages.jsx.
AI_ARENA_ANSWER_KEY = [1, 2, 1, 0, 0]


def schedule_payload() -> list[dict]:
    return [{"day": day, "title": title, "quest": quest} for day, title, quest in QUEST_SCHEDULE]


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def as_utc(value: datetime) -> datetime:
    """Normalize database timestamps from timezone-aware Postgres or naive SQLite."""
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def is_expired(value: datetime) -> bool:
    return as_utc(value) < utc_now()
