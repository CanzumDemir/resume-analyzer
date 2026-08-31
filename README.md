# AI Resume Analyzer

#### Description:

AI Resume Analyzer is a full-stack web application that compares a PDF resume
with a job description using the OpenAI API. It extracts the resume text,
requests a schema-validated analysis, and streams completed result fields back
to the browser. The result includes overall and ATS scores, five section scores,
a summary, strengths, improvement areas, missing keywords, and prioritized
recommendations.

The application solves two practical problems. First, resume feedback is often
generic and disconnected from a specific vacancy. This project analyzes the
resume and job description together. Second, a complete AI response can take
long enough that an ordinary request appears unresponsive. The application
therefore sends structured fields to the interface as they become available
instead of waiting to display the entire result.

## Project status

This repository contains the public CS50x version of AI Resume Analyzer.
It represents an earlier stage of the project and was published as part of my CS50x final project. Development has continued privately since then, and the current version has evolved significantly in terms of architecture, security, reliability, and functionality.
This repository is therefore mainly kept as a public snapshot of the project at the time of the CS50x submission.

## Features

- Email/password signup and login with Argon2 password hashing
- JWT authentication in an HttpOnly cookie
- PDF type, signature, and configurable size validation
- Three validated OpenAI model presets: fast, standard, and expert
- Resume comparison against a supplied job description
- Structured OpenAI output validated by Pydantic/SQLModel
- Field-by-field Server-Sent Events (SSE) over a POST request
- PostgreSQL persistence for analyses and generated results
- Per-user analysis history and ownership checks
- Reloading and polling of stored in-progress or completed analyses

The backend also exposes an authenticated endpoint that can generate and store
an improved resume for a completed analysis. It is intentionally not exposed in
the current frontend. The primary submitted workflow is resume analysis.

## Technology

The backend uses Python 3.13, FastAPI, SQLModel, PostgreSQL, the OpenAI Python
SDK, Apache Tika, PyJWT, and pwdlib with Argon2. The frontend uses Next.js 16,
React 19, TypeScript, Tailwind CSS 4, and react-markdown. TypeScript API types
are generated from FastAPI's OpenAPI schema.

## Architecture and data flow

```text
Browser ── POST PDF + job description ──▶ FastAPI
                                               │
                                      validate PDF and model
                                               │
                                      extract text with Tika
                                               │
                                  create processing Analysis row
                                               │
                              OpenAI structured Responses stream
                                               │
                     ◀── SSE events as complete fields appear ──
                                               │
                           save AnalysisResult and mark completed

Browser ── GET /analyses/{id} ──▶ FastAPI ──▶ PostgreSQL
```

Each protected query includes the authenticated user's ID. Knowing another
analysis UUID is therefore insufficient to read its analysis or generated
outputs.

## Design decisions

### Fetch-based SSE

The browser consumes the stream with `fetch` and `ReadableStream` rather than
`EventSource`. `EventSource` is convenient for GET streams, but starting an
analysis requires a multipart POST body containing the PDF, job description,
and selected model. The frontend maintains a small SSE buffer so incomplete
network chunks are not parsed too early.

### Structured output and partial JSON

The backend supplies `AIAnalysisOutput` as the OpenAI structured-output schema.
While text deltas arrive, `pydantic_core.from_json(..., allow_partial=True)` is
used to detect complete top-level fields. Only complete fields are sent to the
browser. The final response is validated against the full schema before it is
stored.

### Database as the source of truth

The live stream improves feedback during generation, but it is not permanent
state. An `Analysis` row is created before the OpenAI request. The final
`AnalysisResult` and completed status are committed together. On reload or when
opening an older URL, the frontend reads the stored result instead of relying
on stream state. Failed and cancelled analyses are marked as failed.

### Authentication and browser security

Passwords are stored only as Argon2 hashes. The signed JWT is stored in an
HttpOnly cookie rather than local storage, so browser JavaScript cannot read it.
SameSite and Secure behavior are configurable for local and deployed
environments. CORS accepts explicit frontend origins rather than a wildcard.
Queries that return user-owned content filter by both resource ID and user ID.

### Output language

There is no language selector. The analysis follows the primary language of the
job description, or the resume when the job description has no clear primary
language. Technical terms and official names remain unchanged where translation
would reduce accuracy.

## Project structure

```text
backend/app/
  main.py                    FastAPI setup, CORS, routes, exception handler
  core/config.py             browser-security and upload settings
  core/database.py           engine, sessions, and database queries
  core/security.py           password hashing, JWT validation, auth cookies
  routes/authentication.py   signup, login, and logout
  routes/analyze.py          stored and streaming/non-streaming analyses
  routes/generate.py         improved-resume generation and retrieval
  services/pdf_service.py    PDF validation and Apache Tika extraction
  services/ai_service.py     OpenAI structured and streaming requests
  services/analyze_service.py  persistence and failure handling
  services/generate_service.py generated-output persistence
  services/ai_prompts.py     analysis and improvement instructions
  models/                    SQLModel database tables
  schemas/                   HTTP, event, and AI output schemas
  tests/                     auth, isolation, PDF, prompt, and SSE tests

frontend/src/
  app/                       landing, authentication, dashboard, results
  components/analysis/       stream state, SSE parser, result presentation
  components/auth/           login and signup forms
  components/dashboard/      analysis wizard, navigation, history
  hooks/useStoredAnalysis.ts stored-analysis polling
  types/api.d.ts             generated OpenAPI TypeScript definitions
```

## Screenshots

### Landing page

![Landing page](docs/screenshots/01-landing-page.jpeg)

### Start analysis

![Start analysis](docs/screenshots/01-start-analysis.jpeg)

### Scores and summary

![Analysis scores](docs/screenshots/03-analysis-results-scores.jpeg)

### Strengths and improvement areas

![Strengths and improvements](docs/screenshots/04-analysis-results-details.jpeg)

### Missing keywords and recommendations

![Keywords and recommendations](docs/screenshots/05-analysis-results-details.jpeg)

## Local setup

### Prerequisites

- Python 3.13
- Node.js 20 or later
- PostgreSQL
- Java on `PATH` for Apache Tika
- An OpenAI API key with access to the configured models

Create the PostgreSQL database named in `DATABASE_URL` before starting the API.
SQLModel creates the tables, but it does not create the PostgreSQL database.
Apache Tika may download its server JAR on first use, so the first PDF analysis
can require internet access in addition to the OpenAI request.

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

On macOS or Linux, activate with `source .venv/bin/activate` and copy the file
with `cp .env.example .env`. The API runs at `http://localhost:8000`.

### Frontend

```powershell
cd frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

On macOS or Linux, use `cp .env.example .env.local`. The browser application
runs at `http://localhost:3000`.

## Environment variables

Backend (`backend/.env`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection URL |
| `OPENAI_API_KEY` | Secret OpenAI API key |
| `OPENAI_MODEL` | Fallback model for calls without a selected model |
| `SECRET_KEY` | Long random JWT signing secret |
| `ALGORITHM` | JWT signing algorithm, normally `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Authentication cookie lifetime |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `COOKIE_SECURE` | `true` for HTTPS; `false` for local HTTP |
| `COOKIE_SAMESITE` | `lax`, `strict`, or `none`; `none` requires Secure |
| `MAX_PDF_SIZE_MB` | Maximum PDF size processed by the application |

Frontend (`frontend/.env.local`):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL, e.g. `http://localhost:8000` |

Never commit `.env` or `.env.local`. Both are ignored by the repository.

## Tests and generated API types

Backend tests use an isolated in-memory SQLite database and do not call OpenAI
or Apache Tika over the network:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest -q
```

Frontend checks:

```powershell
cd frontend
npm run lint
npm run build
```

After changing FastAPI routes or schemas, start the backend and regenerate the
frontend definitions:

```powershell
cd frontend
npm run generate-api
```

## Privacy and security notes

Resume text and job descriptions contain personal data. This application sends
their text to the configured OpenAI API project and stores it in PostgreSQL.
Use dummy documents for public demonstrations unless the person concerned has
intentionally approved publication and processing. Production deployments must
use HTTPS, a strong unique `SECRET_KEY`, `COOKIE_SECURE=true`, explicit CORS
origins, protected database credentials, and appropriate OpenAI data controls.

The application validates the declared PDF media type, the `%PDF-` signature,
and a configurable size limit. These checks reduce accidental or abusive input,
but they are not a malware scanner. Authentication also does not currently
include rate limiting or account recovery.

## Known limitations of this version

- Database tables are created directly from SQLModel metadata; there is no
  migration system for schema upgrades.
- The backend improved-resume endpoint has no frontend interface.
- There is no delete-account or delete-analysis interface.
- A deployed service would need operational controls such as rate limits,
  monitoring, backups, and a formal privacy policy.

These are intentionally documented limitations rather than unfinished features
required for the submitted core workflow.

## Project status

This repository contains the public CS50x version of AI Resume Analyzer.

It represents an earlier stage of the project and was published as part of my CS50x final project. Development has continued privately since then, and the current version has evolved significantly in terms of architecture, security, reliability, and functionality.

This repository is therefore mainly kept as a public snapshot of the project at the time of the CS50x submission.


## AI assistance and sources

AI tools were used as development aids. The backend was predominantly developed
by the project author, with later AI assistance for selected debugging, review,
refactoring, and improvement work. The frontend received substantially more AI
assistance, particularly for UI design, Tailwind CSS, styling, layout, and
implementation details. The honest scope and limits of the available
provenance, together with the confirmed 2026-08-30 OpenAI Codex
submission-hardening pass, are documented in
[AI_ASSISTANCE.md](AI_ASSISTANCE.md). Relevant source files also contain
comments citing that assistance.

Primary technical references include the
[FastAPI documentation](https://fastapi.tiangolo.com/),
[Next.js documentation](https://nextjs.org/docs),
[SQLModel documentation](https://sqlmodel.tiangolo.com/),
[Apache Tika documentation](https://tika.apache.org/), and the
[OpenAI API documentation](https://developers.openai.com/api/docs/).

