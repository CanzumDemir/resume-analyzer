from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserSignup(BaseModel):
    first_name: str
    last_name: str
    username: str
    email: EmailStr
    password: str


class UserAuth(BaseModel):
    user_id: UUID
    provider: str
    password_hash: str
