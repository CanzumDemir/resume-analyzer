# AI assistance (2026-08-30): OpenAI Codex helped create these SSE and prompt
# regression tests.

import json

from app.models.users import User
from app.routes import analyze
from app.services.ai_prompts import RESUME_ANALYSIS_INSTRUCTIONS, USER_INPUT_PROMPT
from app.tests.helpers import signup_user


def parse_sse_data(response_text: str) -> list[dict]:
    events = []

    for block in response_text.strip().split("\n\n"):
        data_lines = [
            line.removeprefix("data: ")
            for line in block.splitlines()
            if line.startswith("data: ")
        ]

        if data_lines:
            events.append(json.loads("\n".join(data_lines)))

    return events


def test_encode_sse_preserves_unicode_and_terminates_event():
    encoded = analyze.encode_sse({"type": "title", "value": "Entwickler – Köln"})

    assert encoded.endswith("\n\n")
    assert parse_sse_data(encoded) == [
        {"type": "title", "value": "Entwickler – Köln"}
    ]


def test_stream_endpoint_emits_created_partial_and_done_events(client, monkeypatch):
    assert signup_user(client, "streamer", "stream@example.com").status_code == 200

    async def fake_extract_text_from_pdf(resume):
        return "Resume text"

    async def fake_analysis_stream(session, analysis):
        yield {"type": "title", "value": "Backend Developer"}
        yield {"type": "overall_score", "value": 80}
        yield {"type": "done", "value": True}

    monkeypatch.setattr(analyze, "extract_text_from_pdf", fake_extract_text_from_pdf)
    monkeypatch.setattr(analyze, "stream_run_resume_analysis", fake_analysis_stream)

    response = client.post(
        "/stream_analyze_resume",
        data={
            "job_description": "Python developer",
            "ai_model": "gpt-5.6-luna",
        },
        files={"resume": ("resume.pdf", b"%PDF-1.7", "application/pdf")},
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    assert response.headers["cache-control"] == "no-cache"

    events = parse_sse_data(response.text)
    assert [event["type"] for event in events] == [
        "analysis_created",
        "title",
        "overall_score",
        "done",
    ]
    assert events[1]["value"] == "Backend Developer"


def test_routes_reject_models_not_offered_by_the_ui(client, monkeypatch):
    assert signup_user(client, "modeluser", "model@example.com").status_code == 200

    async def should_not_extract(resume):
        raise AssertionError("PDF extraction must not run for an invalid model")

    monkeypatch.setattr(analyze, "extract_text_from_pdf", should_not_extract)

    response = client.post(
        "/stream_analyze_resume",
        data={
            "job_description": "Python developer",
            "ai_model": "arbitrary-expensive-model",
        },
        files={"resume": ("resume.pdf", b"%PDF-1.7", "application/pdf")},
    )

    assert response.status_code == 422


def test_language_prompt_contains_no_unresolved_placeholder():
    assert "{output_language}" not in USER_INPUT_PROMPT
    assert "primary language of the job description" in RESUME_ANALYSIS_INSTRUCTIONS
