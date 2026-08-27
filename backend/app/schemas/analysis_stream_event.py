from typing import Any, Literal

from sqlmodel import SQLModel


class AnalysisStreamEvent(SQLModel):
    type: Literal[
        "analysis_started",
        "result_patch",
        "completed",
        "error",
    ]

    data: dict[str, Any]
