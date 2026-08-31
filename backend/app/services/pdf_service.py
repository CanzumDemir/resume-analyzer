# AI assistance (2026-08-30): OpenAI Codex helped add bounded reads, PDF
# validation, safe errors, and non-blocking parser execution.

import logging
import re

from fastapi import HTTPException, UploadFile, status
from starlette.concurrency import run_in_threadpool
from tika import parser

from app.core.config import MAX_PDF_SIZE_BYTES, MAX_PDF_SIZE_MB

logger = logging.getLogger(__name__)

PDF_CONTENT_TYPES = {"application/pdf", "application/x-pdf"}


async def extract_text_from_pdf(pdf_file: UploadFile) -> str:
    """Extracts text from a PDF file using Apache Tika."""
    if pdf_file.content_type not in PDF_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file must be a PDF",
        )

    file_bytes = await pdf_file.read(MAX_PDF_SIZE_BYTES + 1)

    if len(file_bytes) > MAX_PDF_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"PDF files must not exceed {MAX_PDF_SIZE_MB} MB",
        )

    if not file_bytes.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is not a valid PDF",
        )

    try:
        raw_text = await run_in_threadpool(parser.from_buffer, file_bytes)

        text = raw_text.get("content", "") or ""

        if not text.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="No text could be extracted from the PDF",
            )

        return clean_text(text)

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("PDF extraction failed")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="The PDF could not be processed",
        ) from exc


def clean_text(text: str) -> str:
    """Cleans the extracted text by normalizing whitespace and removing unnecessary newlines."""
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = text.strip()

    return text
