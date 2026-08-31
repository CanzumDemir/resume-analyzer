# AI assistance (2026-08-30): OpenAI Codex helped add bounded input fields and
# explicit public authentication response schemas.

from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserSignup(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    first_name: str
    last_name: str
    username: str
    email: EmailStr


class MessageResponse(BaseModel):
    message: str


class SignupResponse(MessageResponse):
    user: UserRead


class UserAuth(BaseModel):
    user_id: UUID
    provider: str
    password_hash: str
