# Architecture --- ApplyPilot

## High-level flow

Browser (React/Vite) → HTTP request → Express middleware/auth/validation
→ controller → service → MongoDB via Mongoose and/or LLM provider →
normalized response → UI state update.

## Proposed repository tree

``` text
ApplyPilot/
├── client/src/
│   ├── app/{App.jsx,router.jsx}
│   ├── components/{layout/,ui/,applications/,ai/}
│   ├── contexts/{AuthContext.jsx,ThemeContext.jsx}
│   ├── pages/{LandingPage.jsx,LoginPage.jsx,SignupPage.jsx,DashboardPage.jsx,ApplicationsPage.jsx,ApplicationDetailsPage.jsx,ResumeAnalyzerPage.jsx,InterviewPrepPage.jsx,SettingsPage.jsx}
│   ├── services/{apiClient.js,authService.js,applicationService.js,aiService.js}
│   ├── styles/{tokens.css,themes.css,global.css}
│   └── main.jsx
├── server/src/
│   ├── config/{env.js,database.js}
│   ├── middleware/{authenticate.js,validateRequest.js,uploadResume.js,errorHandler.js}
│   ├── models/{User.js,Application.js,ResumeAnalysis.js,InterviewSession.js}
│   ├── routes/{auth.routes.js,application.routes.js,resume.routes.js,interview.routes.js}
│   ├── controllers/{auth.controller.js,application.controller.js,resume.controller.js,interview.controller.js}
│   ├── services/{auth.service.js,application.service.js,pdf.service.js,ai.service.js,interview.service.js}
│   ├── utils/{ApiError.js,asyncHandler.js}
│   ├── app.js
│   └── server.js
├── README.md
├── specs.md
├── TECH_STACK.md
├── FEATURES.md
├── ARCHITECTURE.md
├── FILE_GUIDE.md
├── STEPS.md
├── UI_UX.md
├── MASTER_PROMPT.md
└── .gitignore
```

The coding agent may adapt names to existing files, but must update
FILE_GUIDE.md and avoid dead/duplicate modules.

## Models

**User:** name, normalized unique email, passwordHash, themePreference
(`light|dark|system`), timestamps. Never return passwordHash.

**Application:** userId, companyName, jobTitle, jobUrl, location,
workMode, salaryMin/salaryMax, status enum, appliedAt, followUpAt,
notes, statusHistory array `{status, changedAt}`, timestamps. All
queries and mutations must include authenticated user ID.

**ResumeAnalysis:** userId, result, createdAt, and only minimal
metadata/text retention required. Avoid storing raw resume text
indefinitely without a clear reason.

**InterviewSession:** userId, role, category, bounded questions array
with question text, notes and practiced flag, timestamps.

## API proposal

Auth: `POST /api/auth/register`, `POST /api/auth/login`,
`POST /api/auth/logout`, `GET /api/auth/me`. Applications:
`GET /api/applications?search=&status=&sort=`, `POST /api/applications`,
`GET /api/applications/:id`, `PATCH /api/applications/:id`,
`DELETE /api/applications/:id`. Dashboard: `GET /api/dashboard/summary`.
Resume: `POST /api/resume/analyze` (multipart PDF + JD); optionally
`GET /api/resume/analyses` and `GET /api/resume/analyses/:id` if history
is implemented. Interview: `POST /api/interview/generate`,
`POST /api/interview/sessions`, `GET /api/interview/sessions`,
`PATCH /api/interview/sessions/:id`, optional delete endpoint if UI
supports it. Health: `GET /api/health`.

## Request flows

### Create application

UI validates obvious fields → service sends POST → auth middleware
identifies user → request validation → controller → application service
writes with trusted userId → response → UI updates/refetches. Errors
show actionable messages.

### Resume analysis

UI submits PDF/JD → auth and upload validation → PDF extraction rejects
empty text → AI service sends bounded untrusted content with structured
instructions → validate output → save under user if history enabled →
render results/caveat → remove temporary file. Normalize provider
errors.

### Interview prep

UI selects role/category → validate/rate-limit → AI returns bounded
structured questions → validate → user saves session/notes → all
reads/writes scoped to authenticated user.

## Security boundaries

Frontend guards are not authorization. Never trust userId from request
body. Prevent IDOR by scoping queries by both ID and authenticated
owner. Validate uploaded files and AI output. Keep provider keys
server-only, rate-limit AI, and avoid logging sensitive resume/auth
data. Return safe JSON errors, e.g. `{message, code}`.
