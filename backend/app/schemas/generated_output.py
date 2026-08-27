import uuid
from datetime import datetime

from sqlmodel import SQLModel

from app.schemas.generated_output_type import GeneratedOutputType


class GeneratedOutputRead(SQLModel):
    id: uuid.UUID
    analysis_id: uuid.UUID
    output_type: GeneratedOutputType
    content: str
    created_at: datetime
    updated_at: datetime
