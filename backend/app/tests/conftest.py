# AI assistance (2026-08-30): OpenAI Codex helped create this isolated test
# setup for the CS50 submission-hardening work.

import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("SECRET_KEY", "test-only-secret-key-not-for-production")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:3000")
os.environ.setdefault("COOKIE_SECURE", "false")
os.environ.setdefault("COOKIE_SAMESITE", "lax")

from app.core.database import get_session  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture
def test_engine():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    yield engine

    SQLModel.metadata.drop_all(engine)


@pytest.fixture
def client(test_engine) -> Generator[TestClient, None, None]:
    def get_test_session():
        with Session(test_engine) as session:
            yield session

    app.dependency_overrides[get_session] = get_test_session

    test_client = TestClient(app, raise_server_exceptions=False)

    yield test_client

    test_client.close()
    app.dependency_overrides.clear()


@pytest.fixture
def session(test_engine) -> Generator[Session, None, None]:
    with Session(test_engine) as database_session:
        yield database_session
