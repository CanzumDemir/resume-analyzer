# backend/app/routes/analyze.py

import json
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from fastapi.responses import StreamingResponse
from sqlmodel import Session

from app.core.database import (
    create_analysis,
    get_all_analyses,
    get_analysis_by_id_for_user,
    get_analysis_result_by_analysis_id,
    get_session,
)
from app.core.security import get_current_user
from app.models.analysis import Analysis
from app.models.users import User
from app.schemas.analysis_detail import AnalysisDetailRead
from app.schemas.analysis_list_item import AnalysisListItemRead
from app.schemas.analysis_result import AnalysisResultRead
from app.services.analyze_service import (
    run_resume_analysis,
    stream_run_resume_analysis,
)
from app.services.pdf_service import extract_text_from_pdf


router = APIRouter()


def encode_sse(
    event: dict,
) -> str:
    """
    Encode one Python dictionary as an SSE event.
    """

    return (
        "data: "
        + json.dumps(
            event,
            ensure_ascii=False,
            default=str,
        )
        + "\n\n"
    )


@router.get(
    "/analyses",
    response_model=list[AnalysisListItemRead],
    tags=["Analyze"],
)
def get_analyses(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return get_all_analyses(
        session=session,
        user_id=current_user.id,
    )


@router.get(
    "/analyses/{analysis_id}",
    response_model=AnalysisDetailRead,
    tags=["Analyze"],
)
def read_analysis(
    analysis_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    analysis = get_analysis_by_id_for_user(
        session=session,
        analysis_id=analysis_id,
        user_id=current_user.id,
    )

    if analysis is None:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found",
        )

    result = get_analysis_result_by_analysis_id(
        session=session,
        analysis_id=analysis.id,
    )

    result_read = (
        AnalysisResultRead.model_validate(result) if result is not None else None
    )

    return AnalysisDetailRead(
        id=analysis.id,
        status=analysis.status,
        created_at=analysis.created_at,
        result=result_read,
    )


@router.post(
    "/analyze_resume",
    response_model=AnalysisResultRead,
    tags=["Analyze"],
)
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    ai_model: str = Form(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    resume_text = await extract_text_from_pdf(resume)

    analysis = create_analysis(
        session=session,
        analysis=Analysis(
            user_id=current_user.id,
            resume_text=resume_text,
            job_description=job_description,
            ai_model=ai_model,
            status="processing",
        ),
    )

    session.commit()
    session.refresh(analysis)

    result = await run_resume_analysis(
        session=session,
        analysis=analysis,
    )

    return result


@router.post(
    "/stream_analyze_resume",
    tags=["Analyze"],
)
async def stream_analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    ai_model: str = Form(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    resume_text = await extract_text_from_pdf(resume)

    analysis = create_analysis(
        session=session,
        analysis=Analysis(
            user_id=current_user.id,
            resume_text=resume_text,
            job_description=job_description,
            ai_model=ai_model,
            status="processing",
        ),
    )

    session.commit()
    session.refresh(analysis)

    async def generate():
        yield encode_sse(
            {
                "type": "analysis_created",
                "value": {"analysis_id": str(analysis.id)},
            }
        )

        async for event in stream_run_resume_analysis(
            session=session,
            analysis=analysis,
        ):
            yield encode_sse(event)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
