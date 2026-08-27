import uuid
from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


class GeneratedOutput(SQLModel, table=True):
    __tablename__ = "generated_outputs"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    analysis_id: uuid.UUID = Field(nullable=False, foreign_key="analyses.id")
    output_type: str = Field(nullable=False, max_length=50)
    content: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
