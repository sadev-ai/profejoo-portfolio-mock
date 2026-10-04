# Profejoo — Public Portfolio Reconstruction

A sanitized, runnable portfolio version of **Profejoo**, an academic productivity web application for discovering professors/universities, managing an academic profile, building resumes, organizing outreach documents, and handling user notifications.

> **Portfolio disclosure**
>
> The original product was developed by a **6-person team**. The portfolio owner reports implementing roughly **80% of the frontend**. This repository is a public-safe reconstruction for demonstration purposes — it is **not** the original private production repository.
>
> The private backend, production databases, production search/AI services, deployment secrets, internal infrastructure, and real user data are intentionally excluded.

## UI Preview

A few selected screens from the frontend implementation:

<table>
  <tr>
    <td width="50%">
      <img src="README_MEDIA/Screenshot%20%281084%29.png" alt="Profejoo UI preview 1" />
    </td>
    <td width="50%">
      <img src="README_MEDIA/Screenshot%20%281085%29.png" alt="Profejoo UI preview 2" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="README_MEDIA/Screenshot%20%281086%29.png" alt="Profejoo UI preview 3" />
    </td>
    <td width="50%">
      <img src="README_MEDIA/Screenshot%20%281087%29.png" alt="Profejoo UI preview 4" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="README_MEDIA/Screenshot%20%281088%29.png" alt="Profejoo UI preview 5" />
    </td>
    <td width="50%">
      <img src="README_MEDIA/Screenshot%20%281089%29.png" alt="Profejoo UI preview 6" />
    </td>
  </tr>
</table>

## Demo Video

A short walkthrough showcasing the main Profejoo frontend flows.

[Video](https://github.com/sadev-ai/profejoo-portfolio-mock/blob/main/README_MEDIA/Record.mp4)

The walkthrough demonstrates the dashboard, professor and university discovery, professor details, profile management, resume workflows, notifications, and other frontend interactions.

## What is included

- `app/` — the main React + TypeScript + Vite frontend, adapted to run in demo mode without the private backend.
- `landing/` — the Astro landing page, wired to the local/public app URL.
- `demo-static/` — a dependency-free interactive preview that can be served with any static web server.
- `docker-compose.yml` — optional two-container setup for the React app and Astro landing page.
- `README_FA.md` — Persian documentation.
- `PORTFOLIO_BULLETS.md` — resume/GitHub-ready project descriptions.
- `assets/Record.mp4` — local copy of the UI walkthrough.

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
