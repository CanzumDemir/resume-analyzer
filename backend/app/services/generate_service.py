from sqlmodel import Session

from app.core.database import create_generated_output
from app.models.analysis import Analysis
from app.models.analysis_result import AnalysisResult
from app.models.generated_output import GeneratedOutput
from app.services.ai_service import improve_resume


async def run_improve_resume(
    session: Session,
    analysis: Analysis,
    analysis_result: AnalysisResult,
    ai_model: str | None = None,
) -> GeneratedOutput:
    ai_output = await improve_resume(
        ai_model=ai_model or analysis.ai_model,
        job_description=analysis.job_description,
        resume_text=analysis.resume_text,
        analysis_result=analysis_result,
    )

    generated_output = GeneratedOutput(
        analysis_id=analysis.id,
        output_type="improved_resume",
        content=ai_output.content,
    )

    create_generated_output(session=session, generated_output=generated_output)

    session.commit()
    session.refresh(generated_output)

    return generated_output
