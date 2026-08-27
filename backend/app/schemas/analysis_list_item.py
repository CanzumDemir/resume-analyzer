import uuid
from datetime import datetime

from sqlmodel import SQLModel

from app.schemas.analysis_status import AnalysisStatus


class AnalysisListItemRead(SQLModel):
    id: uuid.UUID
    title: str
    status: AnalysisStatus
    created_at: datetime
