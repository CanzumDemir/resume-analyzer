from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class UserAuth(SQLModel, table=True):
    __tablename__ = "users_auths"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(nullable=False, foreign_key="users.id")
    provider: str = Field(nullable=False, max_length=20)
    provider_user_id: str = Field(nullable=True, max_length=255)
    password_hash: str = Field(nullable=True, max_length=255)
    last_login: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
