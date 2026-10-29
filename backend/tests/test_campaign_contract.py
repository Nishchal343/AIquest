from datetime import datetime, timedelta, timezone

from app.api.routes.admin import admin_option
from app.services.campaign_service import AI_ARENA_ANSWER_KEY, is_expired


def test_sqlite_style_naive_expiry_is_normalized_as_utc():
    future = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=5)
    assert not is_expired(future)


def test_arena_answer_key_matches_the_visible_quiz_options():
    assert AI_ARENA_ANSWER_KEY == [1, 2, 1, 0, 0]


def test_college_outreach_boundary_uses_campus_visit_at_ten_km():
    assert admin_option(10)[0] == "campus_visit"
    assert admin_option(10.01)[0] == "college_groups"
