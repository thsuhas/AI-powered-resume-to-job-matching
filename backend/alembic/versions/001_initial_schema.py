"""Initial schema for CareerLens

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-10-15 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. job_applications table
    op.create_table(
        'job_applications',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('company_name', sa.String(length=255), nullable=False),
        sa.Column('job_title', sa.String(length=255), nullable=False),
        sa.Column('job_description', sa.Text(), nullable=False),
        sa.Column('job_url', sa.String(length=1024), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('employment_type', sa.String(length=100), nullable=True),
        sa.Column('salary_min', sa.Float(), nullable=True),
        sa.Column('salary_max', sa.Float(), nullable=True),
        sa.Column('application_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('follow_up_date', sa.Date(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_job_applications_id'), 'job_applications', ['id'], unique=False)
    op.create_index(op.f('ix_job_applications_company_name'), 'job_applications', ['company_name'], unique=False)
    op.create_index(op.f('ix_job_applications_job_title'), 'job_applications', ['job_title'], unique=False)
    op.create_index(op.f('ix_job_applications_status'), 'job_applications', ['status'], unique=False)
    op.create_index(op.f('ix_job_applications_follow_up_date'), 'job_applications', ['follow_up_date'], unique=False)

    # 2. resume_analyses table
    op.create_table(
        'resume_analyses',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('job_application_id', sa.Integer(), nullable=True),
        sa.Column('resume_filename', sa.String(length=255), nullable=False),
        sa.Column('resume_text', sa.Text(), nullable=False),
        sa.Column('job_description', sa.Text(), nullable=False),
        sa.Column('job_title', sa.String(length=255), nullable=True),
        sa.Column('company_name', sa.String(length=255), nullable=True),
        sa.Column('similarity_score', sa.Float(), nullable=False),
        sa.Column('skill_coverage_score', sa.Float(), nullable=True),
        sa.Column('matched_skills', sa.JSON(), nullable=False),
        sa.Column('missing_skills', sa.JSON(), nullable=False),
        sa.Column('additional_skills', sa.JSON(), nullable=False),
        sa.Column('extraction_warnings', sa.JSON(), nullable=False),
        sa.Column('suggested_improvements', sa.JSON(), nullable=False),
        sa.Column('analysis_version', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.ForeignKeyConstraint(['job_application_id'], ['job_applications.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resume_analyses_id'), 'resume_analyses', ['id'], unique=False)
    op.create_index(op.f('ix_resume_analyses_job_application_id'), 'resume_analyses', ['job_application_id'], unique=False)

    # 3. analysis_evidence table
    op.create_table(
        'analysis_evidence',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('analysis_id', sa.Integer(), nullable=False),
        sa.Column('skill', sa.String(length=100), nullable=False),
        sa.Column('match_status', sa.String(length=50), nullable=False),
        sa.Column('resume_evidence', sa.Text(), nullable=True),
        sa.Column('job_requirement_evidence', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['analysis_id'], ['resume_analyses.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_analysis_evidence_id'), 'analysis_evidence', ['id'], unique=False)
    op.create_index(op.f('ix_analysis_evidence_analysis_id'), 'analysis_evidence', ['analysis_id'], unique=False)
    op.create_index(op.f('ix_analysis_evidence_skill'), 'analysis_evidence', ['skill'], unique=False)


def downgrade() -> None:
    op.drop_table('analysis_evidence')
    op.drop_table('resume_analyses')
    op.drop_table('job_applications')
