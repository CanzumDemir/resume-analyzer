# AI Assistance Record

CS50x permits external AI tools for the final project, provided that their use
is cited and the essence of the submitted work remains the student's own. This
record documents the assistance as accurately as the project author can
reconstruct it. It deliberately does not claim line-by-line provenance where
that information is no longer known.

## Project authorship and earlier assistance

The backend was developed predominantly by the project author. In particular,
the author built its fundamental architecture and application logic and used
that work to learn the underlying concepts. Later in development, AI tools were
used selectively for debugging, reviews, refactoring, and improvements to
existing backend implementations.

The frontend involved substantially more AI assistance. AI tools were used
extensively for UI design, Tailwind CSS, styling, layout, and parts of the
concrete frontend implementation. The project author determined the overall
project structure, extensibility, and direction, and understands the
fundamental Next.js App Router concepts, frontend structure, and connection to
the backend.

Because the project was developed over a long period, the author can no longer
reliably identify which individual historical lines were written by the author
or produced or modified with AI assistance. The broad disclosures above are
therefore intentional and more accurate than invented file-by-file or
line-by-line claims. Corresponding broad comments appear in the frontend root
layout and global stylesheet.

## OpenAI Codex submission-hardening pass

OpenAI Codex assisted with a final review and submission-hardening pass on
2026-08-30. This work included:

- reviewing the repository against the CS50x final-project requirements;
- implementing the generated-output ownership check;
- replacing the unresolved output-language placeholder with a documented
  language-selection rule;
- correcting model labels using the official OpenAI model documentation and
  adding server-side validation for the selectable models;
- hardening CORS, authentication cookies, upload validation, size limits, and
  client-facing error messages;
- creating tests for authentication, authorization, PDF validation, and SSE;
- regenerating the OpenAPI TypeScript definitions;
- restructuring and updating project documentation and removing unused
  template assets.

The hand-written backend files substantially reviewed or changed during that
pass contain dated comments describing the relevant Codex assistance. These
include the affected authentication, analysis, generation, security,
configuration, PDF, prompt, schema, and test modules. Frontend files changed in
that pass also contain specific dated comments where appropriate.

`frontend/src/types/api.d.ts` was generated from the backend OpenAPI schema and
is marked as generated in the file itself.
