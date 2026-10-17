# ApplyPilot

**AI Job Application Copilot**: track applications, compare a PDF resume
with a job description, and practice interview questions.

## Approved scope

-   Authentication: sign up, login, logout, protected routes, password
    hashing, user-owned data.
-   Application tracker: CRUD, search, status filters, details, notes,
    follow-up date, status history.
-   PDF Resume Analyzer: server-side PDF text extraction,
    job-description input, AI comparison, matched skills, requirements
    not found/unclear, improvement suggestions, saved analysis history
    if implemented.
-   AI Interview Prep: role/category-based question generation, personal
    notes, practiced state, saved sessions.
-   Dashboard with real application counts and recent applications.
-   Settings: Light, Dark, System theme and basic profile settings.
-   Responsive UI, loading/empty/error/success states, tests, GitHub and
    deployment.

Deferred: separate analytics page, calendar, notifications center,
resume builder, job-search aggregator.

## Stack

React + Vite, React Router, CSS, Node.js, Express, MongoDB + Mongoose,
password hashing, JWT/session strategy, server-side LLM API, server-side
PDF text extraction.

## Structure

`client/` frontend; `server/` API; root Markdown files define
requirements, stack, features, architecture, file guide, steps, UI/UX,
and AI coding instructions.

## Current status

Automated Phase 8 verification is now complete. The repository contains
a Vite/React client and
an Express API with environment validation, security middleware, MongoDB
models, cookie-based authentication, owner-scoped application CRUD,
dashboard summary data, and connected frontend routes for auth,
applications, dashboard, settings, resume analysis, and interview
preparation. No feature is considered complete from a rendered screen
alone.

Automated verification currently passes:

- `server/npm test`: 6 test files, 21 tests passed.
- `client/npm run build`: production bundle built successfully.
- `git diff --check`: no whitespace errors.
- Vite smoke check: `GET http://localhost:5173/` returned HTTP 200
  and served the ApplyPilot entry page.

Manual browser checks for theme switching, keyboard focus, responsive
widths, and every empty/error state remain a local QA checklist. Live
provider behavior requires configured credentials and has not been
claimed from mocked tests.

## Run locally

```powershell
cd server
copy .env.example .env
npm run dev
```

In a second terminal:

```powershell
cd client
npm run dev
```

The API health check is available at `http://localhost:5000/api/health`.
The server now requires a reachable `MONGODB_URI` before it starts.
`npm test` uses an in-memory MongoDB instance for model and authentication
tests. Authentication uses an HttpOnly, SameSite=Lax JWT cookie named
`applypilot_session`; production cookies also use Secure. SameSite
reduces cross-site request risk; a dedicated CSRF token layer should be
added before relaxing the cookie policy or supporting cross-site clients.

Application endpoints:

- `GET /api/applications?search=&status=&sort=&direction=`
- `POST /api/applications`
- `GET /api/applications/:id`
- `PATCH /api/applications/:id`
- `DELETE /api/applications/:id`
- `GET /api/dashboard/summary`

All application and dashboard queries require authentication and include
the authenticated owner ID in their database filter.

The frontend uses `VITE_API_URL` when provided and otherwise targets
`http://localhost:5000/api`. Browser requests include credentials so the
HttpOnly session cookie is sent to the API.

Resume analysis uses `LLM_API_KEY`, `LLM_MODEL`, and optional
`LLM_API_URL`. The server accepts only in-memory PDF uploads up to 5 MB,
extracts text, sends bounded untrusted text to the configured provider,
validates the structured response, and stores the result without storing
raw resume text. Scanned PDFs are rejected honestly because OCR is not
implemented.

Gemini is supported when `LLM_API_URL` uses
`generativelanguage.googleapis.com`: the server translates the shared
provider request into Gemini `generateContent` format and parses Gemini
candidate text. OpenAI-compatible endpoints remain supported as a
fallback. Restart the server after changing provider code or `.env`.

Interview preparation uses the same server-only provider boundary. It
generates 3–10 bounded practice questions, validates their category and
text, stores sessions under the authenticated user, and persists notes
and practiced state. Provider output is labeled practice material, not a
guarantee of interview questions.

## Environment variables

Typical server variables: `PORT`, `MONGODB_URI`, `JWT_SECRET`,
`CLIENT_ORIGIN`, `LLM_API_KEY`, `LLM_MODEL`, `NODE_ENV`. Use
placeholders in `.env.example`; never commit `.env` or expose provider
keys in `VITE_*` variables.

## Security

Hash passwords, validate inputs and uploaded files, scope all protected
records by authenticated user, rate-limit auth/AI routes before public
deployment, configure production CORS explicitly, clean temporary
uploads, and never expose stack traces/secrets. AI output is guidance,
not a guaranteed ATS score or hiring prediction.

## Definition of done

A feature is complete only when UI, API, validation, persistence,
failure states, and tests/manual checks work. Keep this README
synchronized with actual code and deployed URLs.
