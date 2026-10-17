# Product Specifications --- ApplyPilot

## Summary

ApplyPilot is a personal job-search workspace for organizing
applications, comparing resume content with a job description, and
preparing for interviews. It is not a job board and does not guarantee
ATS performance or hiring outcomes.

## User

A student, recent graduate, or early-career candidate managing multiple
applications.

## Principles

Trust over hype; privacy by default; useful before complex; accessible
responsive UI; clear error handling; code that can be explained in an
interview.

## Functional requirements

### FR-01 Landing

Explain the product and link to sign-up/login. No fake testimonials or
fabricated metrics.

### FR-02 Authentication

Register name/email/password; normalize email; reject duplicate email;
hash passwords; login verifies credentials; logout clears session;
protected routes require authentication. Server authorization is
mandatory---frontend route guards are not security.

### FR-03 Application management

Create/list/read/update/delete. Required: company and job title.
Optional: URL, location, work mode, salary range, applied date, notes,
follow-up date. Status enum: `Applied`, `In Review`, `Interview`,
`Offer`, `Rejected`. Search company/title; filter status; sort by
applied/updated date. Detail page includes status history. Delete
requires confirmation. User A must never access User B records.

### FR-04 Dashboard

Show real totals/status counts, recent applications, upcoming
follow-ups, and shortcuts. No hard-coded production metrics.

### FR-05 PDF Resume Analyzer

Accept bounded PDF uploads and JD text; validate server-side; extract
text; reject empty/unusable extraction; send only needed text to AI.
Return structured summary, evidenced matched skills, requirements not
found/unclear, improvement suggestions, and disclaimer. "Not found in
resume" does not mean the candidate lacks a skill. Do not invent
credentials or metrics. Handle provider timeout, malformed output,
quota, and unavailable API. Make retention of results/text explicit.

### FR-06 Interview Prep

Choose role and category (Technical, HR, Behavioral); generate bounded
questions; validate response schema; save personal notes and practiced
state per user; label output as practice material, not guaranteed
questions.

### FR-07 Settings

Basic profile fields and Light/Dark/System theme; persist theme choice
and apply across all components.

### FR-08 UI states

Loading/skeleton, empty state, no search matches, field validation,
recoverable error/retry, success toast, confirmation for destructive
action, unauthorized and not-found states.

## Non-functional

Keep secrets server-side; validate all untrusted input; use consistent
HTTP statuses/errors; scope protected queries by user; accessible
labels/focus; responsive desktop/tablet/mobile; safe logs; documented
setup/deployment.

## Out of scope

Job scraping, calendar sync, push/email notifications, separate
analytics dashboard, resume PDF builder, teams/recruiter collaboration,
guaranteed ATS scores, auto-applying to jobs.

## Acceptance criteria

Happy path, invalid input, async states, persistence, server
authorization, and a manual/automated check must be demonstrated.
Documentation must match actual implementation.

## Decisions to document during implementation

Choose a coherent JWT/session strategy; prefer secure HttpOnly cookies
when correctly configured. Select and document PDF library/upload limits
and LLM provider/model. Never claim unimplemented functionality.
