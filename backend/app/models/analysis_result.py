import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


class AnalysisResult(SQLModel, table=True):
    __tablename__ = "analysis_results"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    analysis_id: uuid.UUID = Field(nullable=False, foreign_key="analyses.id")
    title: str = Field(nullable=False, max_length=100)
    overall_score: int = Field(nullable=False, le=100)
    ats_score: int = Field(nullable=False, le=100)
    section_scores: dict[str, int] = Field(
        default_factory=dict, sa_column=Column(JSON, nullable=False)
    )
    summary: str = Field(nullable=False)
    strengths: list[str] = Field(
        default_factory=list, sa_column=Column(JSON, nullable=False)
    )
    room_for_improvement: list[str] = Field(
        default_factory=list, sa_column=Column(JSON, nullable=False)
    )
    missing_keywords: list[str] = Field(
        default_factory=list, sa_column=Column(JSON, nullable=False)
    )
    recommendations_for_action: list[str] = Field(
        default_factory=list, sa_column=Column(JSON, nullable=False)
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
