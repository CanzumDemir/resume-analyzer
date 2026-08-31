# AI assistance (2026-08-30): OpenAI Codex helped create these user-isolation
# and ownership regression tests.

from sqlmodel import Session

from app.core.security import create_access_token
from app.models.analysis import Analysis
from app.models.generated_output import GeneratedOutput
from app.models.users import User


def create_user(session: Session, username: str) -> User:
    user = User(
        username=username,
        email=f"{username}@example.com",
        first_name="Test",
        last_name="User",
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def authenticate(client, user: User) -> None:
    client.cookies.set(
        "access_token",
        create_access_token({"sub": str(user.id)}),
    )


def test_analysis_detail_and_list_are_isolated_by_user(client, session):
    owner = create_user(session, "owner")
    other_user = create_user(session, "other")
    analysis = Analysis(
        user_id=owner.id,
        resume_text="Resume",
        job_description="Job",
        ai_model="gpt-5.6-luna",
        status="processing",
    )
    session.add(analysis)
    session.commit()
    session.refresh(analysis)

    authenticate(client, other_user)

    assert client.get(f"/analyses/{analysis.id}").status_code == 404
    assert client.get("/analyses").json() == []

    authenticate(client, owner)

    assert client.get(f"/analyses/{analysis.id}").status_code == 200
    assert [item["id"] for item in client.get("/analyses").json()] == [
        str(analysis.id)
    ]


def test_generated_outputs_require_analysis_ownership(client, session):
    owner = create_user(session, "output-owner")
    other_user = create_user(session, "output-other")
    analysis = Analysis(
        user_id=owner.id,
        resume_text="Resume",
        job_description="Job",
        ai_model="gpt-5.6-luna",
        status="completed",
    )
    session.add(analysis)
    session.commit()
    session.refresh(analysis)

    output = GeneratedOutput(
        analysis_id=analysis.id,
        output_type="improved_resume",
        content="Private generated resume",
    )
    session.add(output)
    session.commit()

    authenticate(client, other_user)
    denied = client.get(f"/analyses/{analysis.id}/generated-outputs")

    assert denied.status_code == 404
    assert "Private generated resume" not in denied.text

    authenticate(client, owner)
    allowed = client.get(f"/analyses/{analysis.id}/generated-outputs")

    assert allowed.status_code == 200
    assert allowed.json()[0]["content"] == "Private generated resume"
