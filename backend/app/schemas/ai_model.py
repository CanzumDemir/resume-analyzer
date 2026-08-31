# AI assistance (2026-08-30): OpenAI Codex helped add the shared model allowlist
# during the CS50 submission-hardening pass.

from typing import Literal


AIModel = Literal[
    "gpt-5.6-luna",
    "gpt-5.6-terra",
    "gpt-5.6-sol",
]
