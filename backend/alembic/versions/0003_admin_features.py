"""Add college outreach records for the prototype admin dashboard."""
from alembic import op
import sqlalchemy as sa

revision = "0003_admin_features"
down_revision = "0002_student_activity"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if "college_outreach" not in sa.inspect(bind).get_table_names():
        op.create_table(
            "college_outreach",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("college_name", sa.String(length=180), nullable=False),
            sa.Column("coordinator_email", sa.String(length=320), nullable=False),
            sa.Column("distance_km", sa.Float(), nullable=False),
            sa.Column("option_key", sa.String(length=40), nullable=False),
            sa.Column("workshop_url", sa.String(length=2048), nullable=False),
            sa.Column("status", sa.String(length=32), nullable=False, server_default="sent"),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        )


def downgrade() -> None:
    op.drop_table("college_outreach")
