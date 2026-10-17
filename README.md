# ApplyPilot

<p align="center">
  <img src="./client/src/assets/ApplyPilotLogo.png" alt="ApplyPilot logo" width="96" />
</p>

<h3 align="center">Your job search, organized.</h3>

<p align="center">
  A focused workspace for tracking applications, comparing resume evidence with job descriptions, and practicing interviews.
</p>

<p align="center">
  <a href="https://github.com/hariskhan1613/ApplyPilot">Repository</a>
  ·
  <a href="#local-development">Local development</a>
  ·
  <a href="#api-overview">API overview</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white" alt="Node.js 22" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB and Mongoose" />
  <img src="https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=white" alt="Vitest" />
</p>

## Overview

ApplyPilot is a full-stack MERN-style job-search workspace designed to keep job-search work explainable and private by default. It combines:

- A real application tracker with status history, notes, follow-up dates, search, filters, sorting, and owner-scoped CRUD.
- A server-side PDF resume analyzer that compares extracted resume evidence with a job description.
- Structured AI guidance with matched skills, unclear or missing requirements, evidence-based suggestions, and a clear disclaimer.
- Interview practice sessions with bounded question generation, personal notes, and practiced progress.
- A dashboard with real application counts, recent applications, follow-ups, and onboarding guidance.
- Light, dark, and system themes with responsive layouts and keyboard-accessible controls.

> ApplyPilot is a planning and preparation tool. It does not guarantee ATS results, interviews, or employment outcomes.

## Product highlights

| Area | What it provides |
| --- | --- |
| Authentication | Sign up, login, logout, protected routes, hashed passwords, and an HttpOnly session cookie |
| Applications | Create, read, update, delete, search, status filters, sorting, notes, follow-ups, and status history |
| Dashboard | Real counts and recent activity loaded from the authenticated user's data |
| Resume Analyzer | PDF validation, in-memory extraction, server-only AI calls, structured output validation, and saved results |
| Interview Prep | Role/category generation, bounded questions, notes, practiced state, and saved sessions |
| Settings | Profile display, Light/Dark/System appearance, and session logout |
| Accessibility and UX | Semantic landmarks, visible focus states, responsive layouts, loading/error/empty states, and reduced-motion-friendly CSS |

## Screens and interface

The client uses the real ApplyPilot logo from [`client/src/assets/ApplyPilotLogo.png`](./client/src/assets/ApplyPilotLogo.png) and a token-based CSS design system. No stock photography, fake testimonials, or fabricated product metrics are included.

The public landing page includes:

- A focused product introduction
- Feature sections for tracking, resume analysis, and interview preparation
- A three-step explanation of the workflow
- Honest product limitations
- Responsive login and signup entry points

## Technology stack

<p>
  <img src="https://skillicons.dev/icons?i=react,vite,nodejs,express,mongodb,js,css,git,github" alt="React, Vite, Node.js, Express, MongoDB, JavaScript, CSS, Git, and GitHub" />
</p>

### Client

- React 19
- Vite 8
- React Router 7
- Lucide React icons
- CSS custom properties and semantic theme tokens
- Fetch-based API client with credentials enabled for the session cookie

### Server

- Node.js with Express 5
- MongoDB with Mongoose 9
- `bcryptjs` for password hashing
- JWT stored in an HttpOnly cookie
- Helmet, CORS, request limits, and rate limiting
- Multer memory storage and `pdf-parse` for PDF extraction
- Provider adapter for Gemini-native and OpenAI-compatible LLM APIs

### Verification

- Vitest
- Supertest
- MongoDB Memory Server
- Production Vite build

## Repository structure

```text
ApplyPilot/
├── client/
│   ├── public/              # Favicon and web manifest assets
│   └── src/
│       ├── app/             # Routes and page-level UI
│       ├── assets/          # Logo and source assets
│       ├── components/      # App shell, shared UI, themes, illustrations
│       ├── contexts/        # Authentication context
│       ├── services/        # Browser API client
│       └── theme.css        # Design tokens and responsive styles
├── server/
│   ├── src/
│   │   ├── config/          # Environment and database setup
│   │   ├── controllers/     # Thin HTTP controllers
│   │   ├── middleware/      # Auth, upload, and error handling
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business rules and integrations
│   │   └── *.test.js        # API and model tests
│   └── .env.example         # Safe environment template
├── .gitignore
└── README.md
```

Planning and specification documents are intentionally kept local and excluded from the public repository. `README.md` is the public project documentation.

## Local development

### Prerequisites

- Node.js 22 or a compatible current LTS release
- npm 10 or later
- A reachable MongoDB instance, local or hosted
- An LLM provider key for resume analysis and interview generation

### 1. Install dependencies

```powershell
Set-Location .\server
npm install

Set-Location ..\client
npm install
```

### 2. Configure the server

```powershell
Set-Location .\server
Copy-Item .env.example .env
```

Edit `server/.env` locally. Never commit it.

```env
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/applypilot
JWT_SECRET=replace-with-a-long-random-secret
LLM_API_KEY=replace-with-provider-key
LLM_MODEL=gemini-3.1-flash-lite
LLM_API_URL=https://generativelanguage.googleapis.com/v1beta/models
```

### 3. Start the API

```powershell
Set-Location .\server
npm run dev
```

The API is available at `http://localhost:5000`.

### 4. Start the client

In a second terminal:

```powershell
Set-Location .\client
npm run dev
```

The client is available at `http://localhost:5173`.

The client uses `VITE_API_URL` when provided and otherwise defaults to `http://localhost:5000/api`.

## Available scripts

### Client

```powershell
npm run dev       # Start the Vite development server
npm run build     # Create a production build
npm run preview   # Preview the production build locally
```

### Server

```powershell
npm run dev       # Start Express with nodemon
npm start         # Start Express normally
npm test          # Run the API and model test suite
```

## API overview

All protected resources are scoped to the authenticated user's ID. The server never trusts an owner ID from the request body.

### Health

```text
GET /api/health
```

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Applications and dashboard

```text
GET    /api/applications?search=&status=&sort=&direction=
POST   /api/applications
GET    /api/applications/:id
PATCH  /api/applications/:id
DELETE /api/applications/:id
GET    /api/dashboard/summary
```

### AI tools

```text
POST /api/resume/analyze
POST /api/interview/generate
GET  /api/interview/sessions
PATCH /api/interview/sessions/:id
```

## AI and resume data handling

- Provider credentials remain server-side and are never placed in client `VITE_*` variables.
- Resume uploads are accepted as PDF files up to 5 MB.
- Files are processed in memory; raw resume text is not persisted.
- Scanned PDFs are rejected because OCR is not currently implemented.
- Resume and job-description text are treated as untrusted input.
- AI output is validated before display or persistence.
- Resume analysis returns structured guidance rather than invented facts or guaranteed scores.
- Interview generation is bounded to 3–10 practice questions and labeled as practice material.

## Security model

- Passwords are hashed with bcrypt.
- Authentication uses an HttpOnly `applypilot_session` cookie containing a signed JWT.
- Production cookies use `Secure` and `SameSite=Lax`.
- Protected database queries include the authenticated owner ID.
- Helmet, CORS, JSON limits, upload validation, rate limiting, and safe API errors are configured.
- Secrets, passwords, tokens, resume text, and API keys are not logged or committed.

Before a public cross-site deployment, review the cookie/CORS arrangement and add a dedicated CSRF token layer if the deployment topology requires it.

## Verification status

The current repository has been verified with:

```text
server/npm test       6 test files, 21 tests passed
client/npm run build  Production build successful
git diff --check      No whitespace errors
```

The project is pushed to:

<https://github.com/hariskhan1613/ApplyPilot>

Live hosting is not claimed yet. Production deployment still requires a hosted MongoDB database, backend and frontend hosting, production environment variables, explicit CORS configuration, and live authentication/API verification.

## Current limitations

- OCR for scanned/image-only PDFs is not implemented.
- The product does not provide job-board aggregation, calendar sync, notifications, analytics pages, or resume building.
- AI output depends on the configured provider and should be reviewed by the user.
- Live deployment URLs will be added after deployment is completed and verified.

## License

No open-source license has been declared yet. Add a license before accepting external contributions or redistributing the project.

## Credits

Built and maintained by **Mohd Haris Khan**.
