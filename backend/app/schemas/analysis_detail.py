import uuid
from datetime import datetime

from sqlmodel import SQLModel

from app.schemas.analysis_result import AnalysisResultRead
from app.schemas.analysis_status import AnalysisStatus


class AnalysisDetailRead(SQLModel):
    id: uuid.UUID
    status: AnalysisStatus
    created_at: datetime

    result: AnalysisResultRead | None = None
