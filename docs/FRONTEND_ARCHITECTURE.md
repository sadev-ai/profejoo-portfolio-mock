# Frontend Architecture Notes

## Main layers

```text
pages / route screens
        ↓
feature components + shared UI
        ↓
contexts / hooks / adapters
        ↓
service modules
        ↓
Axios instances
        ↓
production API (private) OR public mock adapter
```

## Key frontend concerns represented

- Central route constants and React Router navigation.
- Auth, profile and resume contexts for cross-page state.
- Service modules separated by domain: auth, search, professor metadata, profile, resumes, notifications and chat.
- API error normalization and token-expiry helpers.
- Form validation with React Hook Form and Zod.
- Reusable Radix-based UI primitives.
- Profile ↔ resume adapters and completeness calculations.
- Responsive desktop/mobile layouts and drawers/sheets.
- Browser persistence for demo data and Email/SOP drafts.

## Why the public mock uses an Axios adapter

Replacing the backend at the Axios boundary preserves the original frontend service contracts. Components and contexts still call the same service functions, while the public repository avoids shipping private backend code or requiring production infrastructure.
