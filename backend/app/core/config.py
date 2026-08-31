# AI assistance (2026-08-30): OpenAI Codex helped implement the CS50
# submission-hardening configuration changes in this file.

import os
from typing import Literal, cast

from dotenv import load_dotenv

load_dotenv()


def _read_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)

    if value is None:
        return default

    normalized = value.strip().lower()

    if normalized in {"1", "true", "yes", "on"}:
        return True

    if normalized in {"0", "false", "no", "off"}:
        return False

    raise ValueError(f"{name} must be true or false")


def _read_positive_int(name: str, default: int) -> int:
    value = int(os.getenv(name, str(default)))

    if value <= 0:
        raise ValueError(f"{name} must be greater than zero")

    return value


CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

if not CORS_ORIGINS or "*" in CORS_ORIGINS:
    raise ValueError("CORS_ORIGINS must contain explicit origins, not '*'")

COOKIE_SECURE = _read_bool("COOKIE_SECURE", default=False)

cookie_samesite = os.getenv("COOKIE_SAMESITE", "lax").strip().lower()

if cookie_samesite not in {"lax", "strict", "none"}:
    raise ValueError("COOKIE_SAMESITE must be lax, strict, or none")

COOKIE_SAMESITE = cast(Literal["lax", "strict", "none"], cookie_samesite)

if COOKIE_SAMESITE == "none" and not COOKIE_SECURE:
    raise ValueError("COOKIE_SECURE must be true when COOKIE_SAMESITE is none")

MAX_PDF_SIZE_MB = _read_positive_int("MAX_PDF_SIZE_MB", default=5)
MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024
