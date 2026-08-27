import uuid
from datetime import datetime

from sqlmodel import SQLModel


class AnalysisMessageCreate(SQLModel):
    analysis_id: uuid.UUID
    message: str


class AnalysisMessageRead(SQLModel):
    id: uuid.UUID
    analysis_id: uuid.UUID
    role: str
    message: str
    created_at: datetime


class AnalysisMessageUpdate(SQLModel):
    message: str | None = None
