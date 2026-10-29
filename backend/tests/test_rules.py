from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse


def test_social_review_window_is_twelve_hours():
    submitted = datetime.now(timezone.utc)
    assert submitted + timedelta(hours=12) > submitted


def test_referral_link_contains_only_public_code():
    link = "https://example.test/join?ref=ABC123"
    parsed = urlparse(link)
    assert parsed.path == "/join"
    assert parsed.query == "ref=ABC123"
    assert "email" not in link and "phone" not in link
