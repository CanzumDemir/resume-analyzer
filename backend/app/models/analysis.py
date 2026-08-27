import uuid
from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


class Analysis(SQLModel, table=True):
    __tablename__ = "analyses"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(nullable=False, foreign_key="users.id")
    resume_text: str = Field(nullable=False)
    job_description: str = Field(nullable=False)
    ai_model: str = Field(nullable=False, max_length=20)
    status: str = Field(nullable=False, max_length=20, default="processing")
    error_code: str | None = Field(default=None)
    error_message: str | None = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
