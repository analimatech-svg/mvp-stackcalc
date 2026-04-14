"""Initial schema

Revision ID: 001
Revises:
Create Date: 2026-04-14
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "tenants",
        sa.Column("id", UUID(as_uuid=False), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(100), unique=True, nullable=False),
        sa.Column("plan", sa.String(50), nullable=False),
        sa.Column("llm_config", JSONB, server_default="{}"),
        sa.Column("white_label", JSONB, server_default="{}"),
        sa.Column("seat_limit", sa.Integer, nullable=True),
        sa.Column("active", sa.Boolean, server_default="true", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=False), primary_key=True),
        sa.Column("tenant_id", UUID(as_uuid=False), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("role", sa.String(50), server_default="member"),
        sa.Column("supabase_uid", sa.String(255), unique=True, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_users_tenant_id", "users", ["tenant_id"])

    op.create_table(
        "demand_sessions",
        sa.Column("id", UUID(as_uuid=False), primary_key=True),
        sa.Column("tenant_id", UUID(as_uuid=False), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=False), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("phase", sa.String(50), server_default="qualify", nullable=False),
        sa.Column("title", sa.Text, nullable=True),
        sa.Column("scope_data", JSONB, server_default="{}"),
        sa.Column("estimate_data", JSONB, server_default="{}"),
        sa.Column("defend_data", JSONB, server_default="{}"),
        sa.Column("validate_data", JSONB, server_default="{}"),
        sa.Column("complexity_pct", sa.Numeric(5, 2), nullable=True),
        sa.Column("complexity_lvl", sa.String(20), nullable=True),
        sa.Column("messages", JSONB, server_default="[]"),
        sa.Column("artifacts", JSONB, server_default="[]"),
        sa.Column("status", sa.String(50), server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_sessions_tenant_id", "demand_sessions", ["tenant_id"])
    op.create_index("ix_sessions_user_id", "demand_sessions", ["user_id"])

    op.create_table(
        "artifacts",
        sa.Column("id", UUID(as_uuid=False), primary_key=True),
        sa.Column("tenant_id", UUID(as_uuid=False), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("session_id", UUID(as_uuid=False), sa.ForeignKey("demand_sessions.id"), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("content", JSONB, nullable=False),
        sa.Column("file_url", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_artifacts_session_id", "artifacts", ["session_id"])

    op.create_table(
        "llm_usage",
        sa.Column("id", UUID(as_uuid=False), primary_key=True),
        sa.Column("tenant_id", UUID(as_uuid=False), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("session_id", UUID(as_uuid=False), sa.ForeignKey("demand_sessions.id"), nullable=True),
        sa.Column("provider", sa.String(100), nullable=False),
        sa.Column("model", sa.String(100), nullable=False),
        sa.Column("input_tokens", sa.Numeric, nullable=False),
        sa.Column("output_tokens", sa.Numeric, nullable=False),
        sa.Column("cost_usd", sa.Numeric(10, 6), nullable=True),
        sa.Column("latency_ms", sa.Numeric, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    # RLS: Row Level Security for tenant isolation
    op.execute("ALTER TABLE demand_sessions ENABLE ROW LEVEL SECURITY;")
    op.execute("""
        CREATE POLICY tenant_isolation ON demand_sessions
        USING (tenant_id = current_setting('app.tenant_id', true)::UUID);
    """)
    op.execute("ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;")
    op.execute("""
        CREATE POLICY tenant_isolation ON artifacts
        USING (tenant_id = current_setting('app.tenant_id', true)::UUID);
    """)


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS tenant_isolation ON artifacts;")
    op.execute("DROP POLICY IF EXISTS tenant_isolation ON demand_sessions;")
    op.drop_table("llm_usage")
    op.drop_table("artifacts")
    op.drop_table("demand_sessions")
    op.drop_table("users")
    op.drop_table("tenants")
