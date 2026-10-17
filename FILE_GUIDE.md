# File-by-File Logic and Interview Guide

This guide describes intended responsibilities. It must be updated after
each implementation phase to match every actual file. Never claim to
understand generated code without reading it.

## Phase 0/1 audit snapshot

The initial audit found no client/server source. Phases 1 through 7 now
provide the runtime, database, authentication, application API, and
connected frontend layers described below. AI integrations remain future
phases except for the resume-analysis provider boundary described below.

## Actual Phase 1 files

- `client/src/main.jsx`: renders the landing page with product
  navigation, CTA links, feature cards, and a privacy-oriented footer.
- `client/src/style.css`: responsive landing-page styles and initial
  light-theme visual tokens.
- `client/vite.config.js`: enables the React plugin and fixes the local
  Vite port at 5173.
- `server/src/config/env.js`: loads environment variables, parses the
  port, and fails clearly for invalid ports or missing production
  configuration.
- `server/src/app.js`: creates the Express app, applies Helmet, explicit
  CORS, JSON size limits, and exposes `GET /api/health`.
- `server/src/server.js`: reads validated configuration and starts the
  HTTP listener.
- `server/src/middleware/errorHandler.js`: returns safe JSON for missing
  routes and unexpected errors without exposing stack traces to clients.
- `server/src/utils/ApiError.js`: shared expected-error type for future
  controllers and services.
- `server/src/config/database.js`: connects and disconnects Mongoose,
  rejecting startup when no MongoDB URI is configured.
- `server/src/models/User.js`: stores normalized unique email, hashed
  password, theme preference, and timestamps; password hashes are
  excluded from normal queries.
- `server/src/models/Application.js`: stores application details,
  owner reference, status enum, status history, indexes, and timestamps.
- `server/src/models/ResumeAnalysis.js`: stores owner-scoped structured
  analysis results and minimal source metadata.
- `server/src/models/InterviewSession.js`: stores owner-scoped bounded
  categorized questions, notes, practiced state, and timestamps.
- `server/src/models/models.test.js`: verifies MongoDB write/read
  persistence, initial status history, and schema bounds using an
  in-memory MongoDB server.
- `server/src/services/auth.service.js`: validates registration data,
  normalizes email, hashes and verifies passwords, creates JWTs, and
  returns public user data without password hashes.
- `server/src/middleware/authenticate.js`: reads the HttpOnly session
  cookie, verifies its JWT, loads the user, and attaches trusted identity.
- `server/src/controllers/auth.controller.js`: translates register,
  login, logout, and current-user operations into HTTP responses and
  cookie changes.
- `server/src/routes/auth.routes.js`: exposes auth endpoints and applies
  a bounded login/register rate limit.
- `server/src/auth.test.js`: verifies registration, duplicate email
  handling, invalid credentials, cookie sessions, logout, and protected
  current-user access.
- `server/src/services/application.service.js`: validates application
  payloads, scopes every read/write by owner ID, handles search/filter/
  sort, appends status history, and builds dashboard aggregates.
- `server/src/controllers/application.controller.js`: translates
  application and dashboard service results into HTTP responses.
- `server/src/routes/application.routes.js`: protects and exposes
  application list, create, detail, update, and delete endpoints.
- `server/src/routes/dashboard.routes.js`: protects the dashboard
  summary endpoint at `/api/dashboard/summary`.
- `server/src/application.test.js`: verifies CRUD, validation,
  status-history updates, dashboard counts, unauthenticated rejection,
  and cross-user isolation.

## Actual Phase 5 frontend files

- `client/src/main.jsx`: mounts the React application with browser
  routing, theme state, and authentication state providers.
- `client/src/app/App.jsx`: defines public/protected routes, the
  authenticated shell, landing/auth/dashboard/application/detail/edit/
  settings screens, and their loading/error/empty states.
- `client/src/services/apiClient.js`: centralizes API URL resolution,
  credentialed fetch requests, JSON parsing, and normalized errors.
- `client/src/contexts/AuthContext.jsx`: loads the current session and
  exposes login, registration, and logout actions to the UI.
- `client/src/contexts/ThemeContext.jsx`: persists Light/Dark/System
  preference and applies the resolved theme to the document.
- `client/src/style.css`: defines responsive layout, form controls,
  status badges, application panels, light/dark themes, and focus states.
- `server/src/middleware/uploadResume.js`: accepts one PDF in memory,
  enforces the 5 MB limit, and rejects non-PDF uploads.
- `server/src/services/pdf.service.js`: lazily loads the PDF parser,
  extracts bounded text, rejects unreadable or scanned PDFs, and ensures
  parser cleanup.
- `server/src/services/ai.service.js`: validates job-description length,
  translates requests for Gemini or OpenAI-compatible providers, applies
  grounded instructions and timeout, validates structured output, and
  normalizes provider errors.
- `server/src/controllers/resume.controller.js`: coordinates upload
  extraction, AI analysis, and owner-scoped result persistence.
- `server/src/routes/resume.routes.js`: protects the analyzer endpoint
  and applies an AI request rate limit.
- `server/src/resume.test.js`: verifies authenticated upload validation
  for non-PDF and missing-file requests.
- `server/src/services/interview.service.js`: generates owner-scoped
  interview sessions and validates note/practiced updates.
- `server/src/controllers/interview.controller.js`: translates
  generation, listing, and update operations into HTTP responses.
- `server/src/routes/interview.routes.js`: protects interview endpoints
  and rate-limits question generation.
- `server/src/interview.test.js`: verifies authentication, input
  validation, and explicit missing-provider behavior.

## Root documentation

-   **README.md:** reproducible setup, environment, commands, security,
    scope. Interview: "It helps reviewers run the project without
    guessing."
-   **specs.md:** requirements and acceptance criteria. Prevents scope
    drift and makes features testable.
-   **TECH_STACK.md:** explains dependency choices and trade-offs rather
    than listing buzzwords.
-   **FEATURES.md:** maps routes to user-visible behavior and UI states.
-   **ARCHITECTURE.md:** boundaries, data models, API contract and
    request flow. Trace UI → service → route →
    middleware/controller/service → model/provider → response.
-   **FILE_GUIDE.md:** purpose, functions, inputs/outputs, side effects,
    validation, and errors for every actual source file.
-   **STEPS.md:** ordered build plan with checkpoints so each slice is
    verified before the next.
-   **UI_UX.md:** design tokens, page behavior, theme, responsive
    layouts and accessibility.
-   **MASTER_PROMPT.md:** instructions that constrain the AI coding
    tool; not a substitute for code review.
-   **.gitignore:** excludes dependencies, builds, logs, local env
    secrets and temporary uploads.

## Frontend

-   `main.jsx`: creates React root and imports global styles. Separates
    startup from page logic.
-   `app/App.jsx`: top-level composition and global providers.
-   `app/router.jsx`: maps URLs to pages and handles client route
    guards. Backend must still authorize data.
-   `contexts/AuthContext.jsx`: loads current user and exposes auth
    state/actions; UI state only, not a security boundary.
-   `contexts/ThemeContext.jsx`: resolves Light/Dark/System, applies
    theme, persists preference.
-   `services/apiClient.js`: central base URL, credentials, JSON
    parsing, and normalized errors.
-   `services/authService.js`: register/login/logout/current-user calls.
-   `services/applicationService.js`:
    list/filter/create/detail/update/delete and dashboard requests.
-   `services/aiService.js`: multipart resume request and
    interview/session requests.
-   Page components compose UI, call services, and handle
    loading/error/empty states. They must not contain database or
    provider logic.
-   `AppLayout`, `Sidebar`, `Topbar`: shared navigation shell.
-   `Button`, `Input`, `Textarea`, `Select`: consistent accessible
    controls and validation display.
-   `Modal`/`Drawer`: add/edit forms and confirmations.
-   `StatusBadge`: consistent status display.
-   `LoadingSkeleton`, `EmptyState`, `ErrorState`, `Toast`: reusable
    feedback states.
-   `tokens.css`: spacing, typography, radius, shadow and layout
    variables.
-   `themes.css`: semantic colors for Light/Dark.
-   `global.css`: reset, body typography, focus and base layout.

Expected page responsibilities: Landing explains product; Login/Signup
validate forms; Dashboard fetches real counts; Applications manages
list/search/filter; Application Details fetches one authorized record;
Resume Analyzer uploads PDF/JD and renders structured results; Interview
Prep generates questions and saves notes; Settings manages
profile/theme.

## Backend

-   `server.js`: process entry point; validate config, connect DB, then
    listen. Fail fast if required setup fails.
-   `app.js`: register middleware, routes, health endpoint, not-found
    and central error handlers; can be tested without opening a port.
-   `config/env.js`: validate required env vars at startup; fail clearly
    without printing secrets.
-   `config/database.js`: central MongoDB connection and safe error
    handling.
-   Models define document fields, enums, indexes and timestamps. Schema
    validation does not prove ownership.
-   Routes map URL/method to middleware/controller; they should not
    contain large business logic.
-   Controllers translate validated HTTP input to service calls and
    return status/response.
-   `auth.service.js`: normalize email, hash/verify password, create
    user/session.
-   `application.service.js`: business rules and owner-scoped database
    operations.
-   `pdf.service.js`: extract text, detect unusable PDFs, apply limits,
    clean temp files.
-   `ai.service.js`: safe prompts, provider call, timeout/error
    handling, parse/validate structured output.
-   `interview.service.js`: generate bounded questions and persist
    sessions.
-   `authenticate.js`: verify session/token and attach trusted identity.
-   `validateRequest.js`: reject invalid input before business logic.
-   `uploadResume.js`: enforce PDF size/type limits.
-   `errorHandler.js`: normalize errors and prevent stack traces
    reaching clients.
-   `ApiError.js`: represent expected HTTP errors with status/code.
-   `asyncHandler.js`: forward async errors to Express middleware if
    required by the chosen Express pattern.

## Required final file walkthrough

After implementation, list every actual file and explain its purpose,
every non-trivial function, data flow, why each security check exists,
every environment variable, and how each API maps to
route/controller/service/model. List features not implemented. Never
invent files or claim unimplemented logic exists.
