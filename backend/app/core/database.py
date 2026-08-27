from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine, Session, select
from app.models.users import User
from app.models.analysis import Analysis
from app.models.analysis_message import AnalysisMessage
from app.models.analysis_result import AnalysisResult
from app.models.generated_output import GeneratedOutput
from app.models.users_auth import UserAuth
import os
from uuid import UUID

from app.schemas.analysis_list_item import AnalysisListItemRead

load_dotenv()
engine = create_engine(os.getenv("DATABASE_URL"))


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


def get_all_users(session: Session) -> list[User]:
    """Retrieves all users from the database."""
    statement = select(User)
    results = session.exec(statement).all()
    return results


def get_user_by_id(session: Session, user_id: UUID) -> User | None:
    """Retrieves a user from the database by their ID."""
    statement = select(User).where(User.id == user_id)
    result = session.exec(statement).first()
    return result


def get_user_by_email(session: Session, email: str) -> User:
    """Retrieves a user from the database by their email address."""
    statement = select(User).where(User.email == email)
    result = session.exec(statement).first()
    return result


def get_user_by_username(session: Session, username: str) -> User:
    """Retrieves a user from the database by their username."""
    statement = select(User).where(User.username == username)
    result = session.exec(statement).first()
    return result


def get_user_auth(session: Session, user_id: UUID) -> UserAuth:
    """Retrieves the authentication record for a user by their user ID."""
    statement = select(UserAuth).where(UserAuth.user_id == user_id)
    result = session.exec(statement).first()
    return result


def create_user(session: Session, user: User) -> User:
    """Creates a new user in the database."""
    session.add(user)
    session.flush()
    session.refresh(user)
    return user


def create_user_auth(session: Session, user_auth: UserAuth) -> UserAuth:
    """Creates a new user authentication record in the database."""
    session.add(user_auth)
    session.flush()
    session.refresh(user_auth)
    return user_auth


def user_exists(session: Session, email: str, username: str) -> bool:
    """Checks if a user with the given email or username already exists in the database."""
    statement = select(User).where((User.email == email) | (User.username == username))
    result = session.exec(statement).first()
    return result is not None


def create_analysis(session: Session, analysis: Analysis) -> Analysis:
    """Creates a new analysis"""
    session.add(analysis)
    session.flush()
    session.refresh(analysis)

    return analysis


def create_analysis_result(
    session: Session, analysis_result: AnalysisResult
) -> AnalysisResult:
    """Creates a new analysis result"""
    session.add(analysis_result)
    session.flush()
    session.refresh(analysis_result)

    return analysis_result


def get_all_analyses(
    session: Session,
    user_id: UUID,
) -> list[AnalysisListItemRead]:
    statement = (
        select(
            Analysis.id,
            AnalysisResult.title,
            Analysis.status,
            Analysis.created_at,
        )
        .outerjoin(
            AnalysisResult,
            AnalysisResult.analysis_id == Analysis.id,
        )
        .where(Analysis.user_id == user_id)
        .order_by(Analysis.created_at.desc())
    )

    rows = session.exec(statement).all()

    analyses: list[AnalysisListItemRead] = []

    for (
        analysis_id,
        result_title,
        status,
        created_at,
    ) in rows:
        if result_title:
            title = result_title
        elif status == "failed":
            title = "Failed analysis"
        else:
            title = "Analysis in progress"

        analyses.append(
            AnalysisListItemRead(
                id=analysis_id,
                title=title,
                status=status,
                created_at=created_at,
            )
        )

    return analyses


def get_analysis_result_by_analysis_id(
    session: Session,
    analysis_id: UUID,
) -> AnalysisResult | None:
    statement = select(AnalysisResult).where(AnalysisResult.analysis_id == analysis_id)

    return session.exec(statement).first()


def get_analysis_by_id_for_user(
    session: Session,
    analysis_id: UUID,
    user_id: UUID,
) -> Analysis | None:
    statement = select(Analysis).where(
        Analysis.id == analysis_id,
        Analysis.user_id == user_id,
    )

    return session.exec(statement).first()


def create_generated_output(
    session: Session,
    generated_output: GeneratedOutput,
) -> GeneratedOutput:
    session.add(generated_output)
    session.flush()
    session.refresh(generated_output)

    return generated_output


def get_all_generated_outputs_by_analysis_id(
    session: Session,
    analysis_id: UUID,
) -> list[GeneratedOutput]:
    statement = (
        select(GeneratedOutput)
        .where(GeneratedOutput.analysis_id == analysis_id)
        .order_by(GeneratedOutput.created_at.desc())
    )

    return list(session.exec(statement).all())
