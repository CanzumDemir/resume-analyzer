import re

from fastapi import UploadFile
from tika import parser


async def extract_text_from_pdf(pdf_file: UploadFile) -> str:
    """Extracts text from a PDF file using Apache Tika."""
    try:
        file_bytes = await pdf_file.read()

        raw_text = parser.from_buffer(file_bytes)

        text = raw_text.get("content", "") or ""

        if not text.strip():
            raise Exception("No text could be extracted from PDF")

        return clean_text(text)

    except Exception as e:
        raise Exception(f"PDF extraction failed: {e!s}")


def clean_text(text: str) -> str:
    """Cleans the extracted text by normalizing whitespace and removing unnecessary newlines."""
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = text.strip()

    return text
