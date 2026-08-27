import uuid
from datetime import datetime

from sqlmodel import SQLModel


class AnalysisRead(SQLModel):
    id: uuid.UUID
    title: str
    status: str
    created_at: datetime
    updated_at: datetime


class AnalysisCreate(SQLModel):
    resume_text: str
    job_description: str
    ai_model: str


class AnalysisUpdate(SQLModel):
    title: str | None = None
    resume_text: str | None = None
    job_description: str | None = None
    ai_model: str | None = None
    status: str | None = None
