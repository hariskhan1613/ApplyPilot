# Build Steps --- ApplyPilot

## Phase 0: Audit/setup

-   [x] Inspect existing client/server files and package scripts;
    preserve working Vite setup.
-   [x] Confirm Git status and add `.gitignore` for env files,
    dependencies, builds, logs and temp uploads.
-   [x] Read all project docs before coding.
-   [x] Create `server/.env.example` placeholders, never real
    credentials.
    **Checkpoint:** package manifests and source now exist; client build
    and API health response have been verified.

## Phase 1: Backend skeleton

-   [x] Configure server scripts.
-   [x] Create app/server entry files and env validation.
-   [x] Add `/api/health`, not-found and central error handler.
-   [x] Run backend and verify JSON health response.

## Phase 2: Database/models

-   [x] Configure MongoDB connection.
-   [x] Create User, Application, ResumeAnalysis, InterviewSession
    schemas.
-   [x] Add enums, timestamps, indexes and ownership refs.
-   [x] Test one write/read.

## Phase 3: Authentication

-   [x] Register with normalized email and hashed password.
-   [x] Handle duplicate email and invalid credentials.
-   [x] Login/logout/current-user endpoint.
-   [x] Add auth middleware and protect all private routes.
-   [x] Test unauthenticated access is rejected; ownership tests belong
    with protected application routes in Phase 4.
-   [x] Configure HttpOnly SameSite=Lax JWT cookie strategy; production
    cookies also use Secure.

## Phase 4: Application API

-   [x] List/search/status filter/sort.
-   [x] Create/detail/update/delete.
-   [x] Validate fields, enum, URLs, dates and salary ranges.
-   [x] Scope every query to authenticated user.
-   [x] Append status history when status changes.
-   [x] Test happy path, invalid input and unauthorized access.

## Phase 5: Frontend shell and CRUD

-   [x] Set up router, auth/theme contexts, API services.
-   [x] Build layout, sidebar, topbar, controls, and confirmation flow.
-   [x] Add CSS tokens and Light/Dark/System.
-   [x] Build landing/auth/dashboard/applications/details/settings
    pages.
-   [x] Connect real APIs and add loading/empty/error/success states.
-   [x] Test the production build; responsive CSS targets desktop,
    tablet, and mobile layouts.

## Phase 6: PDF Resume Analyzer

-   [x] Choose maintained PDF text extraction library.
-   [x] Enforce upload type/size limits and text/JD length limits.
-   [x] Extract text server-side and handle scanned/empty PDFs honestly.
-   [x] Configure server-side AI provider.
-   [x] Request structured output and validate it.
-   [x] Handle timeout, provider failure, malformed output and retry.
-   [x] Keep uploads in memory and document result/raw-text retention.
-   [x] Test authenticated missing and invalid PDF uploads.

## Phase 7: Interview Prep

-   [x] Role/category form.
-   [x] Generate bounded questions and validate output.
-   [x] Save session, notes and practiced state.
-   [x] Scope all data by user and test provider failure.

## Phase 8: Verification

-   [x] Register/login/logout (automated auth tests).
-   [x] Create/update/delete and verify persistence after reload
    (automated application tests).
-   [x] Test search and each status filter (automated application tests).
-   [x] Test cross-user access denial (automated application/interview
    tests).
-   [x] Test valid/invalid PDF and AI failure paths (automated upload
    validation and missing-provider tests; valid-provider path requires
    configured credentials).
-   [x] Generate questions and save/reload notes (automated provider-mock
    interview test).
-   [ ] Manually test Light/Dark/System, keyboard focus, responsive
    widths, and empty states in a browser.
-   [x] Run production builds; fix meaningful console errors.
    Client build and backend suite pass; live provider and deployment
    checks remain pending.

## Phase 9: GitHub/deploy

-   [ ] Check staged files; ensure `.env` and secrets are absent.
-   [ ] Commit meaningful chunks and push to GitHub.
-   [ ] Deploy backend and set production env vars.
-   [ ] Configure database access and exact frontend CORS origin.
-   [ ] Deploy frontend with correct API URL.
-   [ ] Verify health endpoint and one end-to-end flow on live URLs.
-   [ ] Update README with actual links and limitations.

## AI-assisted workflow

Implement one phase at a time. Run each checkpoint before continuing. On
error, diagnose actual output; do not replace the whole codebase. Review
diffs, explain the request flow, and never mark a screen complete unless
its behavior works.
