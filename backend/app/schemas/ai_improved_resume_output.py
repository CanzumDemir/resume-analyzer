from sqlmodel import SQLModel


class AIImprovedResumeOutput(SQLModel):
    content: str
