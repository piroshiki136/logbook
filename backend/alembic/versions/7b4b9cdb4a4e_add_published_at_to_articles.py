"""add published_at to articles

Revision ID: 7b4b9cdb4a4e
Revises: e1f2f726ab4a
Create Date: 2025-03-01 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "7b4b9cdb4a4e"
down_revision: Union[str, Sequence[str], None] = "e1f2f726ab4a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "articles",
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("articles", "published_at")
