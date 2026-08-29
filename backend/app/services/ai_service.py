import asyncio
import os
from collections.abc import AsyncIterator

from dotenv import load_dotenv
from openai import (
    APIError,
    APIStatusError,
    AsyncOpenAI,
    BadRequestError,
)
from pydantic import ValidationError
from pydantic_core import from_json


from app.exceptions.exceptions import AIServiceException
from app.schemas.ai_analysis_output import AIAnalysisOutput
from app.services.ai_prompts import (
    IMPROVE_RESUME_INSTRUCTIONS,
    IMPROVE_RESUME_USER_PROMPT,
    RESUME_ANALYSIS_INSTRUCTIONS,
    USER_INPUT_PROMPT,
)
from app.schemas.ai_improved_resume_output import AIImprovedResumeOutput
from app.models.analysis_result import AnalysisResult


async def generate_resume_analysis(
    ai_model: str, resume_text: str, job_description: str | None = None
):
    load_dotenv()

    client = AsyncOpenAI()

    max_attempts = 3

    for attempt in range(max_attempts):
        try:
            response = await client.responses.parse(
                model=ai_model if ai_model else os.getenv("OPENAI_MODEL"),
                instructions=RESUME_ANALYSIS_INSTRUCTIONS,
                input=USER_INPUT_PROMPT.replace("{resume_text}", resume_text).replace(
                    "{job_description}", job_description or "None"
                ),
                text_format=AIAnalysisOutput,
            )

            if response.status != "completed":
                if attempt == max_attempts - 1:
                    raise AIServiceException(
                        status_code=500,
                        message="Failed to generate AI analysis after multiple attempts.",
                    )
                await asyncio.sleep(1)
                continue

            for output in response.output:
                if output.type != "message":
                    continue

                for item in output.content:
                    if item.type == "refusal":
                        raise AIServiceException(
                            status_code=400,
                            message="The AI service refused to process the request.",
                        )

                    if item.type == "output_text" and item.parsed is not None:
                        return item.parsed

        except BadRequestError as e:
            raise AIServiceException(
                status_code=400,
                message="Invalid request to the AI service.",
            ) from e

        except APIStatusError as e:
            if e.status_code >= 500 and attempt < max_attempts - 1:
                continue

            raise AIServiceException(
                status_code=500,
                message="Failed to generate AI analysis.",
            ) from e

        except APIError as e:
            if attempt == max_attempts - 1:
                raise AIServiceException(
                    status_code=500,
                    message="Failed to connect to the AI service after multiple attempts.",
                ) from e

        except ValidationError as e:
            raise AIServiceException(
                status_code=400,
                message="Validation error: {e}",
            ) from e

    raise AIServiceException(
        status_code=500,
        message="Failed to generate AI analysis after multiple attempts.",
    )


async def stream_generate_resume_analysis(
    ai_model: str, resume_text: str, job_description: str
) -> AsyncIterator[dict | AIAnalysisOutput]:
    load_dotenv()

    client = AsyncOpenAI(
        max_retries=2,
        timeout=60.0,
    )

    buffer = ""

    fields = list(AIAnalysisOutput.model_fields.keys())

    already_sent: set[str] = set()

    async with client.responses.stream(
        model=(ai_model if ai_model else os.getenv("OPENAI_MODEL")),
        instructions=RESUME_ANALYSIS_INSTRUCTIONS,
        input=USER_INPUT_PROMPT.replace(
            "{resume_text}",
            resume_text,
        ).replace(
            "{job_description}",
            job_description or "None",
        ),
        text_format=AIAnalysisOutput,
    ) as stream:
        async for event in stream:
            if event.type == "response.refusal.delta":
                raise RuntimeError("The model refused to analyze the resume.")

            if event.type != "response.output_text.delta":
                continue

            buffer += event.delta

            try:
                partial_data = from_json(
                    buffer,
                    allow_partial=True,
                )
            except ValueError:
                continue

            if not isinstance(
                partial_data,
                dict,
            ):
                continue

            for field, next_field in zip(
                fields,
                fields[1:],
            ):
                if field in already_sent:
                    continue

                if field in partial_data and next_field in partial_data:
                    already_sent.add(field)

                    yield {
                        "type": field,
                        "value": partial_data[field],
                    }

        final_response = await stream.get_final_response()

        result = final_response.output_parsed

        if result is None:
            raise RuntimeError("OpenAI returned no parsed analysis.")

        result_dict = result.model_dump()

        for field in fields:
            if field in already_sent:
                continue

            yield {
                "type": field,
                "value": result_dict[field],
            }

        yield result


async def improve_resume(
    ai_model: str,
    resume_text: str,
    job_description: str,
    analysis_result: AnalysisResult,
) -> AIImprovedResumeOutput:
    client = AsyncOpenAI(max_retries=2, timeout=60.0)

    response = await client.responses.parse(
        model=ai_model,
        instructions=IMPROVE_RESUME_INSTRUCTIONS,
        input=IMPROVE_RESUME_USER_PROMPT.format(
            resume_text=resume_text,
            job_description=job_description,
            summary=analysis_result.summary,
            strengths="\n".join(analysis_result.strengths),
            room_for_improvement="\n".join(analysis_result.room_for_improvement),
            missing_keywords="\n".join(analysis_result.missing_keywords),
            recommendations="\n".join(analysis_result.recommendations_for_action),
        ),
        text_format=AIImprovedResumeOutput,
    )

    result = response.output_parsed

    if result is None:
        raise RuntimeError("OpenAI returned no improved resume.")

    return result
