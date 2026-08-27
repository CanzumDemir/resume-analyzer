from sqlmodel import Field, SQLModel

from app.schemas.section_scores import SectionScores


class AIAnalysisOutput(SQLModel):
    title: str

    overall_score: int = Field(ge=0, le=100)
    ats_score: int = Field(ge=0, le=100)

    section_scores: SectionScores

    summary: str

    strengths: list[str]
    room_for_improvement: list[str]
    missing_keywords: list[str]
    recommendations_for_action: list[str]
