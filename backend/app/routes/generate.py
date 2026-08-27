from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.core.database import (
    get_all_generated_outputs_by_analysis_id,
    get_analysis_by_id_for_user,
    get_analysis_result_by_analysis_id,
    get_session,
)
from app.core.security import get_current_user
from app.models.users import User
from app.schemas.generated_output import GeneratedOutputRead
from app.services.generate_service import run_improve_resume

router = APIRouter()


@router.post(
    "/analyses/{analysis_id}/improve-resume",
    response_model=GeneratedOutputRead,
    tags=["Analyze"],
)
async def improve_analysis_resume(
    analysis_id: UUID,
    ai_model: str | None = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    analysis = get_analysis_by_id_for_user(
        session=session, analysis_id=analysis_id, user_id=current_user.id
    )

    if analysis is None:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found.",
        )

    if analysis.status != "completed":
        raise HTTPException(
            status_code=409, detail="Analysis must be completed before improving resume"
        )

    analysis_result = get_analysis_result_by_analysis_id(
        analysis_id=analysis.id, session=session
    )

    if analysis_result is None:
        raise HTTPException(
            status_code=404,
            detail="Analysis result not found",
        )

    return await run_improve_resume(
        session=session,
        analysis=analysis,
        analysis_result=analysis_result,
        ai_model=ai_model,
    )


@router.get(
    "/analyses/{analysis_id}/generated-outputs",
    response_model=list[GeneratedOutputRead],
    tags=["Analyze"],
)
async def generated_outputs(
    analysis_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    generated_outputs = get_all_generated_outputs_by_analysis_id(
        session=session, analysis_id=analysis_id
    )

    if generated_outputs is None:
        raise HTTPException(
            status_code=404,
            detail="File not found",
        )

    return generated_outputs
