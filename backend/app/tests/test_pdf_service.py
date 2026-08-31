# AI assistance (2026-08-30): OpenAI Codex helped create these PDF validation
# and safe-error regression tests.

from app.services import pdf_service
from app.tests.helpers import signup_user


def test_rejects_non_pdf_content_type_before_analysis(client):
    assert signup_user(client, "pdfuser", "pdf@example.com").status_code == 200

    response = client.post(
        "/analyze_resume",
        data={
            "job_description": "Python developer",
            "ai_model": "gpt-5.6-luna",
        },
        files={"resume": ("resume.txt", b"plain text", "text/plain")},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "The uploaded file must be a PDF"}


def test_rejects_spoofed_pdf_content(client):
    assert signup_user(client, "spoofuser", "spoof@example.com").status_code == 200

    response = client.post(
        "/analyze_resume",
        data={
            "job_description": "Python developer",
            "ai_model": "gpt-5.6-luna",
        },
        files={"resume": ("resume.pdf", b"not really a pdf", "application/pdf")},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "The uploaded file is not a valid PDF"}


def test_rejects_pdf_larger_than_configured_limit(client, monkeypatch):
    assert signup_user(client, "largepdf", "large@example.com").status_code == 200
    monkeypatch.setattr(pdf_service, "MAX_PDF_SIZE_BYTES", 8)
    monkeypatch.setattr(pdf_service, "MAX_PDF_SIZE_MB", 1)

    response = client.post(
        "/analyze_resume",
        data={
            "job_description": "Python developer",
            "ai_model": "gpt-5.6-luna",
        },
        files={"resume": ("resume.pdf", b"%PDF-1234", "application/pdf")},
    )

    assert response.status_code == 413
    assert response.json() == {"detail": "PDF files must not exceed 1 MB"}


def test_pdf_parser_errors_do_not_expose_internal_details(client, monkeypatch):
    assert signup_user(client, "parseruser", "parser@example.com").status_code == 200

    def fail_to_parse(*args, **kwargs):
        raise RuntimeError("private parser path and internal details")

    monkeypatch.setattr(pdf_service.parser, "from_buffer", fail_to_parse)

    response = client.post(
        "/analyze_resume",
        data={
            "job_description": "Python developer",
            "ai_model": "gpt-5.6-luna",
        },
        files={"resume": ("resume.pdf", b"%PDF-1.7", "application/pdf")},
    )

    assert response.status_code == 422
    assert response.json() == {"detail": "The PDF could not be processed"}
    assert "internal details" not in response.text
