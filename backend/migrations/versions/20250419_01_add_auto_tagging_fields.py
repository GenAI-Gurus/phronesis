"""
Add auto-tagging fields to DecisionJournalEntry (domain_tags, sentiment_tag, keywords)
"""

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.add_column(
        "decision_journal_entries", sa.Column("domain_tags", sa.JSON(), nullable=True)
    )
    op.add_column(
        "decision_journal_entries",
        sa.Column("sentiment_tag", sa.String(), nullable=True),
    )
    op.add_column(
        "decision_journal_entries", sa.Column("keywords", sa.JSON(), nullable=True)
    )


def downgrade():
    op.drop_column("decision_journal_entries", "keywords")
    op.drop_column("decision_journal_entries", "sentiment_tag")
    op.drop_column("decision_journal_entries", "domain_tags")
