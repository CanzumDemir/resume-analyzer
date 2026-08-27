from datetime import datetime

from sqlmodel import SQLModel

from app.schemas.section_scores import SectionScores


class AnalysisResultRead(SQLModel):
    title: str
    overall_score: int
    ats_score: int

    section_scores: SectionScores
    summary: str

    strengths: list[str]
    room_for_improvement: list[str]
    missing_keywords: list[str]
    recommendations_for_action: list[str]

    created_at: datetime
    updated_at: datetime
