"""Add quest, project, quiz, and account-token tables."""
from alembic import op

from app.db.base import Base
from app.models import *  # noqa: F401,F403

revision = "0002_student_activity"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    Base.metadata.create_all(op.get_bind())


def downgrade() -> None:
    for table_name in ("email_tokens", "quiz_attempts", "project_submissions", "quest_completions"):
        op.drop_table(table_name)
