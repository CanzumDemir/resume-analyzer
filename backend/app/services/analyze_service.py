from sqlmodel import Session
from uuid import UUID
import asyncio
import logging
from app.core.database import create_analysis_result
from app.models.analysis import Analysis
from app.schemas.ai_analysis_output import AIAnalysisOutput
from app.models.analysis_result import AnalysisResult
from app.services.ai_service import (
    generate_resume_analysis,
    stream_generate_resume_analysis,
)


logger = logging.getLogger(__name__)


def save_completed_analysis(
    session: Session,
    analysis_id: UUID,
    result: AIAnalysisOutput,
) -> AnalysisResult:
    """
    Persist final AI result and mark
    the analysis as completed.
    """

    analysis_result = AnalysisResult(
        analysis_id=analysis_id,
        title=result.title,
        overall_score=(result.overall_score),
        ats_score=result.ats_score,
        section_scores=(result.section_scores.model_dump()),
        summary=result.summary,
        strengths=result.strengths,
        room_for_improvement=(result.room_for_improvement),
        missing_keywords=(result.missing_keywords),
        recommendations_for_action=(result.recommendations_for_action),
    )

    create_analysis_result(
        session=session,
        analysis_result=analysis_result,
    )

    analysis = session.get(
        Analysis,
        analysis_id,
    )

    if analysis is None:
        raise RuntimeError("Analysis not found while saving the final result.")

    analysis.status = "completed"

    session.add(analysis)

    session.commit()

    session.refresh(analysis_result)

    return analysis_result


def mark_analysis_failed(
    session: Session,
    analysis_id: UUID,
) -> None:
    """
    Restore the session after a failed
    transaction and persist failed status.
    """

    session.rollback()

    analysis = session.get(
        Analysis,
        analysis_id,
    )

    if analysis is None:
        return

    analysis.status = "failed"

    session.add(analysis)

    session.commit()


async def run_resume_analysis(
    session: Session,
    analysis: Analysis,
) -> AnalysisResult:
    """
    Non-streaming analysis endpoint.
    """

    analysis_id = analysis.id

    try:
        async for result in stream_generate_resume_analysis(
            analysis.ai_model,
            analysis.resume_text,
            analysis.job_description,
        ):
            if isinstance(
                result,
                AIAnalysisOutput,
            ):
                return save_completed_analysis(
                    session=session,
                    analysis_id=analysis_id,
                    result=result,
                )

        raise RuntimeError("AI analysis completed without a final result.")

    except Exception:
        logger.exception(
            "Analysis %s failed",
            analysis_id,
        )

        try:
            mark_analysis_failed(
                session=session,
                analysis_id=analysis_id,
            )

        except Exception:
            logger.exception(
                "Could not mark analysis %s as failed",
                analysis_id,
            )

        raise


async def stream_run_resume_analysis(
    session: Session,
    analysis: Analysis,
):
    """
    Stream partial AI results to the client
    and persist the final result.
    """

    analysis_id = analysis.id

    try:
        async for result in stream_generate_resume_analysis(
            analysis.ai_model,
            analysis.resume_text,
            analysis.job_description,
        ):
            if isinstance(
                result,
                AIAnalysisOutput,
            ):
                save_completed_analysis(
                    session=session,
                    analysis_id=analysis_id,
                    result=result,
                )

                yield {
                    "type": "done",
                    "value": True,
                }

                return

            yield result

        raise RuntimeError("AI stream completed without a final result.")

    except asyncio.CancelledError:
        logger.warning(
            "Analysis %s was cancelled",
            analysis_id,
        )

        try:
            mark_analysis_failed(
                session=session,
                analysis_id=analysis_id,
            )

        except Exception:
            logger.exception(
                "Could not mark cancelled analysis %s as failed",
                analysis_id,
            )

        raise

    except Exception:
        logger.exception(
            "Analysis %s failed",
            analysis_id,
        )

        try:
            mark_analysis_failed(
                session=session,
                analysis_id=analysis_id,
            )

        except Exception:
            logger.exception(
                "Could not mark analysis %s as failed",
                analysis_id,
            )

        yield {
            "type": "error",
            "value": ("The analysis failed. Please try again."),
        }

        return
