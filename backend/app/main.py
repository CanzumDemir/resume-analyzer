from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.database import create_db_and_tables
from app.exceptions.exceptions import AIServiceException
from app.routes import analyze, authentication, generate


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    title="Resume Analyzer API",
    description="API for analyzing resumes.",
    version="1.0",
    contact={"name": "Can Demir", "email": "candemir_10@hotmail.com"},
    lifespan=lifespan,
)


@app.exception_handler(AIServiceException)
async def ai_service_exception_handler(request: Request, exc: AIServiceException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.message},
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)
app.include_router(authentication.router)
app.include_router(generate.router)
