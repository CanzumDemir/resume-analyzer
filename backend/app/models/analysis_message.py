from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class AnalysisMessage(SQLModel, table=True):
    __tablename__ = "analysis_messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    analysis_id: UUID = Field(foreign_key="analyses.id")
    role: str = Field(nullable=False, max_length=20)
    message: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
