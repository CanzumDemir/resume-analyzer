from sqlmodel import Field, SQLModel


class SectionScores(SQLModel):
    experience_match: int = Field(ge=0, le=100)
    hard_skills_match: int = Field(ge=0, le=100)
    education_and_certifications: int = Field(ge=0, le=100)
    achievements_and_impact: int = Field(ge=0, le=100)
    resume_quality: int = Field(ge=0, le=100)
