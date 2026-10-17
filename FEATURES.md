# Features and Page Inventory --- ApplyPilot

## Included routes

  --------------------------------------------------------------------------
  Route                      Page                    Behavior
  -------------------------- ----------------------- -----------------------
  `/`                        Landing                 Product explanation and
                                                     CTA

  `/login`                   Login                   Credential
                                                     validation/session

  `/signup`                  Sign up                 Registration and
                                                     duplicate email
                                                     handling

  `/dashboard`               Dashboard               Real counts, recent
                                                     records, follow-up
                                                     preview

  `/applications`            Applications            Search, status filter,
                                                     sorting, CRUD entry
                                                     points

  `/applications/:id`        Application details     Details, notes,
                                                     timeline, edit/delete

  `/tools/resume-analyzer`        Resume Analyzer         PDF upload, JD input,
                                                     structured AI result
  `/tools/interview-prep`         Interview Prep          Generate questions,
                                                     notes, practice state

  `/settings`                Settings                Profile and
                                                     Light/Dark/System theme
  --------------------------------------------------------------------------

## Shared layout

Authenticated shell: sidebar, topbar, page content. Sidebar: Dashboard,
Applications, Resume Analyzer, Interview Prep, Settings. Topbar:
title/breadcrumb, theme, profile/logout. Add/Edit can use modal/drawer.
Destructive actions require confirmation; mutations show concise toast.

## Statuses

`Applied`, `In Review`, `Interview`, `Offer`, `Rejected`. A status
change appends status + timestamp to history. Define initial status
behavior explicitly.

## Resume result

Summary; evidenced matched skills; requirements not found/unclear;
grounded suggestions; disclaimer; retry/error states. Do not equate "not
found in resume" with "candidate lacks skill."

## Interview workflow

Choose role/category → server validates → AI returns bounded structured
questions → validate and render → user saves notes/practice state →
sessions remain user-scoped.

## Dashboard

Total applications, status counts, recent records, upcoming follow-up
dates. No dedicated analytics page or fake production values.

## Common UI states

Loading, empty collection, no search matches, validation error,
network/server error, success, expired session, not found, disabled
submit while pending.

## Deferred

Separate analytics page, calendar, notifications center, resume builder,
job search aggregator.
