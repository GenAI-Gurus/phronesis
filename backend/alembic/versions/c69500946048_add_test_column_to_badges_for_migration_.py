"""Add test_column to badges for migration workflow test

Revision ID: c69500946048
Revises: 54193ec04383
Create Date: 2025-04-20 21:03:31.792449

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c69500946048"
down_revision: Union[str, None] = "54193ec04383"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "badges", sa.Column("test_column", sa.String(length=50), nullable=True)
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("badges", "test_column")
