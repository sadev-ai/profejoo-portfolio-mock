# Profejoo — Public Portfolio Reconstruction

A sanitized, runnable portfolio version of **Profejoo**, an academic productivity web application for discovering professors/universities, managing an academic profile, building resumes, organizing outreach documents, and handling user notifications.

> **Portfolio disclosure**
>
> The original product was developed by a **6-person team**. The portfolio owner reports implementing roughly **80% of the frontend**. This repository is a public-safe reconstruction for demonstration purposes — it is **not** the original private production repository.
>
> The private backend, production databases, production search/AI services, deployment secrets, internal infrastructure, and real user data are intentionally excluded.

## What is included

- `app/` — the main React + TypeScript + Vite frontend, adapted to run in demo mode without the private backend.
- `landing/` — the Astro landing page, wired to the local/public app URL.
- `demo-static/` — a dependency-free interactive preview that can be served with any static web server.
- `docker-compose.yml` — optional two-container setup for the React app and Astro landing page.
- `README_FA.md` — Persian documentation.
- `PORTFOLIO_BULLETS.md` — resume/GitHub-ready project descriptions.

## Frontend feature coverage

### Authentication & route protection
- Login and signup UX.
- OTP verification flow.
- Forgot/reset password flow.
- Protected/public route handling.
- JWT/access/refresh token service abstractions.
- Google OAuth integration exists in the original frontend path, but is intentionally disabled in public demo mode.

### Dashboard
- Responsive dashboard shell and navigation.
- Profile, plan, resources, favorites/history and notification-oriented cards.
- Quick stats and overview states.

### Professor & university discovery
- Separate **Professor** and **University** search modes.
- Search/filter metadata loading.
- Country, university, subject and metric filters.
- Sort direction/options and pagination-ready response handling.
- Professor cards with research fields, tags, H-index, citations and expandable details.
- University cards with ranking and academic metadata.
- Professor metadata/detail page with profile stats, research tags, links, highlights, biography and publications carousel.

### Structured academic profile
Editable sections for:
- Basics/contact information.
- Education.
- Work / RA / TA experience.
- Publications.
- Projects.
- Talks.
- Honors & awards.
- Credentials/certificates.
- Skill groups.
- External links.
- Languages.
- Interests.
- Extras/activities.

The frontend includes add/edit/delete flows, confirmation dialogs, validation-oriented forms, section counts, completeness calculations and responsive drawer/sheet patterns.

### Resume maker
- Resume list with table/card presentation modes.
- Create, rename, duplicate and delete flows.
- Resume statuses and completeness indicators.
- Create from profile with selectable sections.
- Start-from-scratch structured builder.
- Resume editing and autosave-oriented flow.
- Template/design workspace.
- Editable resume content and section ordering/mapping logic.
- Print/export workflow and LaTeX generation support.
- PDF/DOCX import entry point is intentionally represented as **Coming Soon** in the supplied frontend.

### Email & SOP workspace
- Create/edit document workflow.
- Rich text editor based on Tiptap.
- Card/table views.
- Rename, duplicate and delete flows.
- Local draft persistence in browser storage.

### Notifications
- Notification list.
- Read/unread grouping.
- Mark-as-read interaction.
- Notification detail route.
- Frontend service mapping from API-shaped data to UI models.

### FAQ / chatbot
- FAQ topics and question flows.
- Guest and authenticated-session service abstractions.
- Chat history/session API contracts.
- Public demo responses are deterministic and local; no private AI service is called.

### Subscription / supporting screens
- Subscription plan UI.
- Supporting placeholder routes for areas such as stats, favorites, history, settings and support.
- Loading, empty, confirmation and error-oriented UI states across the app.

## Tech stack represented in the source

**Main app**
- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Radix UI primitives
- React Hook Form + Zod
- Axios service layer
- Framer Motion / Motion
- Tiptap rich text editor
- jsPDF / html2canvas / react-to-print
- Recharts

**Landing**
- Astro
- Tailwind CSS

**Original private backend integration (not included here)**
- Go / Gin
- PostgreSQL
- Redis
- Elasticsearch
- WebSocket-based realtime capabilities

The public demo replaces those private services with a browser-local mock adapter and synthetic data.

## Demo mode architecture

The React app keeps the real frontend service boundaries (`auth`, `profile`, `search`, `resume`, `notifications`, `chat`, professor metadata), but Axios is routed through `src/mocks/mockAdapter.ts` when demo mode is enabled.

This means the UI still exercises realistic frontend behavior while remaining safe to publish:

```text
React UI
  -> context / hooks
  -> typed service modules
  -> Axios instances
  -> demo Axios adapter
  -> synthetic data + localStorage
```

No private server is required.

## Run it

### Fastest: dependency-free preview

```bash
cd demo-static
python -m http.server 8000
```

Open `http://localhost:8000`.

This preview demonstrates dashboard, search, editable profile basics, resume CRUD, notification state, chatbot behavior and the public portfolio disclosure.

### Main React app

Requirements: Node.js 20+

```bash
cd app
npm ci
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`). The login form is prefilled in portfolio mode:

```text
Email:    demo@profejoo.dev
Password: demo1234
```

The mock adapter accepts the demo credentials and stores changes in browser `localStorage`.

### Astro landing page

```bash
cd landing
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

By default the landing page points to the main app at `http://localhost:5173`.

### Docker

```bash
docker compose up --build
```

- App: `http://localhost:8080`
- Landing: `http://localhost:8081`

## What was changed for the public version

- Removed the backend source from the deliverable.
- Removed production/deployment secrets and private service dependencies.
- Replaced network dependencies with synthetic mock data.
- Added persistent mock state through `localStorage`.
- Disabled external Google OAuth in demo mode.
- Added demo login credentials.
- Fixed Windows-only import casing so the source is Linux/CI friendly.
- Rewired landing links to a configurable app URL.
- Removed internal CI/workflow files and internal refactoring notes.
- Removed bundled font files; the public package uses a system font stack.
- Added a dependency-free interactive preview.
- Replaced starter READMEs with portfolio-focused documentation.

## What is intentionally not claimed as complete

This repository should not be presented as a full production deployment. The following are intentionally mocked, private, placeholder, or unfinished:

- Real authentication / OTP delivery.
- Production professor and university datasets.
- Elasticsearch-backed search.
- AI chatbot / AI resume parsing.
- Production Email/SOP generation services.
- Payments/subscription backend.
- Real-time backend behavior.
- Resume import parser (the supplied UI labels this as Coming Soon).
- Placeholder routes such as stats/favorites/history/settings.

## Suggested GitHub description

> Public portfolio reconstruction of Profejoo — a React/TypeScript academic productivity app featuring professor & university search, structured profiles, resume workflows, notifications, rich-text outreach tools, and a mocked browser-local API layer.

## Attribution / publication note

Because the original product was collaborative and private, publish this repository only after confirming that the code, branding and assets you are uploading are permitted to be shared. The safest public framing is **“portfolio reconstruction based on a private team project”**, not “the original production source.”
