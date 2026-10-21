"""Initial schema users child_profiles assessments metrics

Revision ID: c594a069c6c0
Revises: 
Create Date: 2026-10-21 21:35:09.020210

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c594a069c6c0'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('hashed_password', sa.String(), nullable=True),
        sa.Column('role', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # 2. child_profiles table
    op.create_table(
        'child_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('grade', sa.String(), nullable=True),
        sa.Column('language', sa.String(), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_child_profiles_id'), 'child_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_child_profiles_name'), 'child_profiles', ['name'], unique=False)

    # 3. assessments table
    op.create_table(
        'assessments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('profile_id', sa.Integer(), nullable=True),
        sa.Column('date', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['profile_id'], ['child_profiles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_assessments_id'), 'assessments', ['id'], unique=False)

    # 4. metrics table
    op.create_table(
        'metrics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('assessment_id', sa.Integer(), nullable=True),
        sa.Column('reading_speed_wpm', sa.Float(), nullable=True),
        sa.Column('reading_hesitations', sa.Float(), nullable=True),
        sa.Column('speech_accuracy', sa.Float(), nullable=True),
        sa.Column('gaze_regressions', sa.Integer(), nullable=True),
        sa.Column('cognitive_score', sa.Float(), nullable=True),
        sa.Column('risk_score', sa.Float(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('screening_level', sa.String(), nullable=True),
        sa.Column('shap_json', sa.String(), nullable=True),
        sa.Column('learning_plan_json', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_metrics_id'), 'metrics', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_metrics_id'), table_name='metrics')
    op.drop_table('metrics')
    op.drop_index(op.f('ix_assessments_id'), table_name='assessments')
    op.drop_table('assessments')
    op.drop_index(op.f('ix_child_profiles_name'), table_name='child_profiles')
    op.drop_index(op.f('ix_child_profiles_id'), table_name='child_profiles')
    op.drop_table('child_profiles')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')
