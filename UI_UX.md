# UI/UX Specification --- ApplyPilot (v2: "Calm Precision")

## 0. Why v2

v1 screenshots showed: invisible labels in dark mode, a collapsed search
input on /applications, native file input, repeated uppercase eyebrows,
no icons/logo mark, hollow "Good work" copy on empty data, duplicated
Log out, glow shadows. v2 fixes these and defines a coherent design
system. **Fix the bugs in section 12 before polishing anything else.**

## 1. Visual direction

Calm, credible, precise. Neutral surfaces, one blue accent, soft tinted
status badges, thin borders, generous whitespace, small radii, almost no
shadow. Premium comes from alignment, hierarchy and consistency, not from
gradients or glow.

Never: glowing gradients, glassmorphism, decorative animation, stock
photos, fake testimonials, fake metrics, fake logos, praise copy that is
not backed by data.

## 2. Design tokens

Implemented in `theme.css`. All components use semantic variables only;
no hard-coded hex in components.

### Light

| Token | Value | Use |
|---|---|---|
| `--bg` | `#F7F8FB` | App background |
| `--surface` | `#FFFFFF` | Cards, inputs, sidebar |
| `--surface-2` | `#F1F4F9` | Hover rows, subtle fills |
| `--border` | `#E4E8F0` | Default borders |
| `--border-strong` | `#CBD3E1` | Input borders, dividers |
| `--text` | `#0F172A` | Primary text |
| `--text-2` | `#475467` | Secondary text, labels |
| `--text-3` | `#667085` | Metadata, placeholders |
| `--primary` | `#2563EB` | Buttons, focus |
| `--primary-hover` | `#1D4ED8` | Button hover |
| `--primary-soft` | `#EAF1FF` | Active nav, soft fills |
| `--primary-text` | `#1D4ED8` | Links, active nav text |

### Dark

| Token | Value |
|---|---|
| `--bg` | `#0B1220` |
| `--surface` | `#111A2C` |
| `--surface-2` | `#172338` |
| `--border` | `#243049` |
| `--border-strong` | `#33425F` |
| `--text` | `#EEF2FA` |
| `--text-2` | `#B4BFD3` |
| `--text-3` | `#8B98B0` |
| `--primary` | `#2563EB` (button bg, white text) |
| `--primary-hover` | `#2F6BED` |
| `--primary-soft` | `#15264A` |
| `--primary-text` | `#8DB3FF` (links, active nav, logo) |

Rule: **blue text on dark uses `--primary-text`, never `--primary`.**
White on `#3B82F6` fails AA for small text, so it is not used for buttons.
Verify every pair with a contrast checker (target 4.5:1 body, 3:1 large
text and UI borders).

### Status badges (tinted bg + text + dot; text label always present)

| Status | Light text / bg | Dark text / bg |
|---|---|---|
| Applied | `#1D4ED8` / `#EAF1FF` | `#8DB3FF` / `#15264A` |
| In Review | `#6D28D9` / `#F1EBFE` | `#A78BFA` / `#231C3F` |
| Interview | `#B45309` / `#FEF3E2` | `#FBBF24` / `#2E2410` |
| Offer | `#15803D` / `#E8F6EE` | `#4ADE80` / `#0F2A1D` |
| Rejected | `#B91C1C` / `#FDECEC` | `#F87171` / `#331618` |

Feedback colors: success `#15803D`/`#4ADE80`, warning `#B45309`/`#FBBF24`,
error `#B91C1C`/`#F87171`.

## 3. Typography

Font: **Inter** (variable, self-hosted or Google Fonts, `font-display: swap`)
with system-ui fallback. One family only.

| Role | Size / weight / tracking |
|---|---|
| Page title | 26px / 600 / -0.02em |
| Section title | 16-18px / 600 / -0.01em |
| Body | 14-15px / 400 / line-height 1.55 |
| Label | 13px / 500 |
| Metadata | 12-13px / 400 / `--text-3` |
| Stat number | 28px / 600 / tabular-nums |
| Nav item | 14px / 500 |

Remove the uppercase letter-spaced blue "eyebrow" above every page title.
Use at most one eyebrow-style label in the whole product (landing hero).
Max line length for paragraphs: 70ch.

## 4. Spacing, shape, elevation

- Spacing scale: 4/8/12/16/24/32/40/56.
- Radius: inputs/buttons 10px, cards 14px, badges 999px, dialogs 16px.
- Borders 1px `--border`. Shadow only on dropdowns, dialogs, toasts
  (`--shadow-md`). Cards use border, not shadow. **No glow on buttons.**
- Controls 40px high default, 44px on touch/mobile.

## 5. Icons, logo, imagery

- Icons: **lucide-react**, 18px in nav/buttons, 1.75 stroke, `currentColor`.
  Icon-only buttons need `aria-label` and tooltip.
- Logo: SVG mark (rounded square in `--primary`, white paper-plane/check
  glyph) + "ApplyPilot" wordmark 600 weight. Mark alone when sidebar
  collapses. Favicon = mark.
- Empty states: inline SVG illustrations (simple line art using
  `--border-strong`, `--primary-soft`, `--primary`), 120-160px, theme-aware.
  One per context: applications, follow-ups, resume results, interview
  sessions, not-found, error.
- Landing hero: **real screenshot** of the app populated with clearly
  labeled sample data, in a minimal browser frame, light/dark variants.
  No stock photos, no fake logos wall.

## 6. Authenticated shell

**Sidebar (248px desktop)**: logo; group "Workspace": Overview, Applications;
group "Tools": Resume Analyzer, Interview Prep; Settings pinned above the
user card. Each item = icon + label, 40px high, radius 10. Active =
`--primary-soft` bg, `--primary-text` text, 500 weight. Inactive =
`--text-2`, hover `--surface-2`. Bottom: user card (initials avatar, name,
email truncated) opening a menu: Settings, Log out. **Log out appears only
here and in Settings; remove other duplicates.**

**Topbar (56px)**: left = page title (hamburger on mobile); right = primary
"Add application" button (hidden on pages where it is already in header),
theme toggle (icon button cycling Light/Dark/System with tooltip + aria-label).
Content area padding 24-32px, max-width 1200px centered.

**Page header pattern**: title (26px) + one-line description (`--text-2`)
left, page actions right. No eyebrow.

**Mobile (<768px)**: sidebar becomes drawer with scrim and focus trap;
primary action becomes a bottom-right FAB or full-width button; tables
become stacked cards.

## 7. Components

| Component | Spec |
|---|---|
| Button primary | `--primary` bg, white text, 40px, radius 10, 500 weight, hover `--primary-hover`, active translateY(0), disabled 50% opacity + `not-allowed`, pending shows spinner and blocks resubmit |
| Button secondary | `--surface` bg, 1px `--border-strong`, `--text` |
| Button ghost | transparent, hover `--surface-2` |
| Button danger | `--danger-soft` bg + `--danger` text; solid red only inside confirm dialog |
| Input / textarea / select | `--surface` bg, 1px `--border-strong`, radius 10, 40px, placeholder `--text-3`; focus = 2px `--primary` ring offset 2px; error = red border + message below with icon |
| Select | Custom styled (chevron icon), same height as inputs, never full-bleed stretched |
| Label | 13px/500 `--text`, above field; helper text 12px `--text-3` |
| Card | `--surface`, 1px border, radius 14, padding 20-24 |
| Stat card | icon chip (32px, tinted), label, 28px number, optional hint line |
| Badge | 12px/500, dot + text, tinted bg per section 2 |
| Tabs (status filter) | Segmented pills with counts; active = `--surface` + border + `--text`; scrolls horizontally on mobile |
| Table | Sticky header `--surface-2`, 48px rows, hover `--surface-2`, row click opens details, kebab menu for Edit/Delete |
| Dropzone | Dashed 1.5px `--border-strong`, radius 14, icon, "Drop PDF here or browse", constraints line, states: idle/drag-over/selected (file name, size, remove)/error |
| Drawer | Right side, 480px, for add/edit application; sticky footer Save/Cancel |
| Dialog | Radius 16, scrim 50%, focus trap, Esc closes, destructive confirm names the item |
| Toast | Bottom-right, 4s, icon + concise text, `role="status"`, theme-aware |
| Skeleton | `--surface-2` shimmer; shimmer disabled under reduced motion |
| Empty state | Illustration + title + one sentence + primary action |
| Progress stepper | Used for analyzer stages; no fake percentages |
| Accordion | Interview question cards, expand to notes + practiced switch |

## 8. Pages

### Landing `/`
Sticky header (logo, Login, Get Started). Hero: benefit headline, one
sentence, primary + secondary CTA, real product screenshot. Three feature
blocks (tracker, resume analysis, interview prep) each with icon and
screenshot crop. How-it-works in 3 numbered steps. Honest limits line
("Not a job board. No ATS guarantees."). Footer. No fabricated proof.

### Login / Sign-up
Centered 400px card on `--bg`, logo above. Fields with labels, show/hide
password, pending state, field errors, generic auth error, cross-links.
Sign-up shows live password rules checklist. Forgot-password only if built.

### Dashboard `/dashboard`
- Header: "Good morning/afternoon/evening, {firstName}" + context line from
  real data (e.g. "2 follow-ups due this week"; with no data: "Let's set up
  your pipeline."). No praise copy.
- 4 stat cards: Total, In review, Interviews, Offers.
- **Zero state**: "Get started" card with 3 checklist items (Add first
  application, Analyze a resume, Practice interview), completion derived
  from real data.
- With data: pipeline bar (stacked by status, labeled), Recent applications
  (list rows with badge), Upcoming follow-ups (date chips; overdue in red
  with text "Overdue"), AI tool shortcut cards.

### Applications `/applications`
Header + Add application. Toolbar: search input (icon, flexible width,
min 240px), segmented status tabs with counts, sort select (Applied date /
Updated). Table columns: Company (logo initial avatar + name), Role,
Status badge, Applied, Follow-up, Actions. Tablet drops Follow-up; mobile
cards. States: skeleton, empty (illustration + Add), no matches (clear
filters button), error (retry).

### Application details `/applications/:id`
Breadcrumb, header (company, role, status select, Edit, Delete), two-column:
details grid (location, work mode, URL, applied, follow-up, salary) and
notes; right/below: status timeline (vertical, dated). Not-found state with
illustration and back link; same response for missing and inaccessible.

### Resume Analyzer `/tools/resume-analyzer`
Two-column: left = dropzone + JD textarea (char counter) + Analyze (disabled
until valid); right = "How this works" card (what is sent to AI, retention,
caveat that absence != lack of skill). Processing: stepper (Uploading,
Extracting text, Analyzing, Done) without percentages. Results: summary
card, matched skills (skill + quoted evidence), requirements not found or
unclear (neutral amber, wording "not found in resume"), suggestions,
disclaimer. Errors: unreadable/scanned PDF, timeout, quota, malformed output,
each with retry.

### Interview Prep `/tools/interview-prep`
Left config card (role, category segmented control, optional experience
level, Generate). Right/below: saved sessions list. Session view: header
with role/category, progress "3 of 10 practiced", accordion question cards
(notes textarea, practiced switch), Save with unsaved-changes indicator.
Label: "Practice material, not guaranteed interview questions."

### Settings `/settings`
Cards: Profile (name, email), Appearance (Light/Dark/System as 3 visual
option tiles, not a dropdown), Session (Log out). No dead controls.

## 9. Application form (drawer)
Company, job title required; status default Applied; URL, location, work
mode (segmented Remote/Hybrid/On-site), applied date, follow-up date,
salary min/max, notes with counter. Validate URL, dates, min <= max, bounded
notes. Field errors inline, Save pending lock, Cancel confirms if dirty.

## 10. Theme behavior
Preference stored: `light | dark | system`. Resolved value written to
`<html data-theme>` before first paint (inline script in `index.html`) to
avoid flash; `color-scheme` set; `matchMedia` listener updates when
preference is system. All native controls, scrollbars, menus, dialogs,
toasts and badges consume tokens.

## 11. Interaction and accessibility
Transitions 120-160ms on color/background/border only; honor
`prefers-reduced-motion`. Visible 2px focus ring on every interactive
element, never `outline: none` without replacement. Labels bound to inputs,
one `h1` per page, landmarks (`nav`, `main`), icon buttons labeled, tap
targets >= 40px (44px mobile), confirmation for destructive actions,
concise toasts, no inert buttons, color never the only status signal.

## 12. Fix-first bug list (from v1 screenshots)
1. Dark labels/question text/"Practiced" use a too-dark variable; map to `--text` / `--text-2`.
2. Applications toolbar: search input collapsed; give it `flex: 1; min-width: 240px`, select a fixed width.
3. Replace native file input with dropzone.
4. Remove uppercase blue eyebrows.
5. Dark active nav/logo/links use `--primary-text`.
6. Remove duplicate Log out and the labeled theme `<select>`.
7. Remove button glow shadows.
8. Replace "Good work, keep going." with data-backed greeting.

## 13. States and responsive tests
Every async view: loading, empty, no matches, validation, server/network
error, success, expired session, not found. Test at 360px, 768px, 1280px
in Light and Dark. Run axe or Lighthouse accessibility on each page and
record contrast results.

## 14. Implementation order
1. Add `theme.css`, Inter, theme init script.
2. Rebuild shell (sidebar, topbar, user menu, theme toggle).
3. Shared components: Button, Input, Select, Badge, Card, EmptyState, Skeleton, Toast, Dialog/Drawer.
4. Applications page (table, tabs, drawer), then Dashboard.
5. Resume Analyzer dropzone + stepper + results; Interview Prep accordion.
6. Landing page with real screenshots; login/sign-up polish.
7. Accessibility and responsive pass.
