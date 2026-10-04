// src/constants/routes.ts
//
// Single source of truth for the app's route paths. These were previously
// retyped as raw string literals across 25+ files (AppRouter.tsx, navbar,
// auth forms, page redirects, card "view" links, etc). Import ROUTES for
// static paths, and the builder functions below for paths that include an
// id or query param.
//
// Route constants are centralized here so navigation and redirects use the
// same path definitions across the public portfolio build.

export const ROUTES = {
  HOME: "/",
  TEST: "/test",

  LOGIN: "/login",
  SIGNUP: "/signup",
  LOGOUT: "/logout",
  FAQ: "/faq",
  SUPPORT: "/support",

  DASHBOARD: "/dashboard",
  DASHBOARD_SEARCH: "/dashboard/search",
  DASHBOARD_CHATBOT: "/dashboard/chatbot",
  DASHBOARD_PROFILE: "/dashboard/profile",
  DASHBOARD_NOTIFICATIONS: "/dashboard/notifications",
  DASHBOARD_PLANS: "/dashboard/plans",
  DASHBOARD_FAVORITES: "/dashboard/favorites",
  DASHBOARD_HISTORY: "/dashboard/history",
  DASHBOARD_SETTINGS: "/dashboard/settings",
  DASHBOARD_STATS: "/dashboard/stats",

  DASHBOARD_RESUME_MAKER: "/dashboard/resume-maker",
  DASHBOARD_RESUME_MAKER_NEW_IMPORT: "/dashboard/resume-maker/new/import",
  DASHBOARD_RESUME_MAKER_NEW_FROM_PROFILE: "/dashboard/resume-maker/new/from-profile",
  DASHBOARD_RESUME_MAKER_NEW_SCRATCH: "/dashboard/resume-maker/new/scratch",
  DASHBOARD_RESUME_BUILDER: "/dashboard/resume-builder",

  DASHBOARD_EMAIL_SOP: "/dashboard/email-sop",

  // Pre-existing legacy redirect sources (kept exactly as-is, including the
  // capitalization of /Search).
  LEGACY_PROFILE: "/profile",
  LEGACY_SEARCH: "/Search",
  LEGACY_CHATBOT: "/chatbot",

  CATCH_ALL: "*",

  // Route templates (react-router `path:` values with param placeholders)
  DASHBOARD_PROFESSOR_TEMPLATE: "/dashboard/professor/:profId",
  DASHBOARD_NOTIFICATION_DETAIL_TEMPLATE: "/dashboard/notifications/:id",
  DASHBOARD_RESUME_EDIT_TEMPLATE: "/dashboard/resume-maker/:id/edit",
  DASHBOARD_EMAIL_SOP_EDIT_TEMPLATE: "/dashboard/email-sop/:id/edit",
} as const;

/** `/dashboard/professor/:profId` with a concrete id. */
export function professorDetailPath(profId: string | number): string {
  return `/dashboard/professor/${profId}`;
}

/** `/dashboard/notifications/:id` with a concrete id. */
export function notificationDetailPath(id: string | number): string {
  return `/dashboard/notifications/${id}`;
}

/** `/dashboard/resume-maker/:id/edit` with a concrete id. */
export function resumeEditPath(id: string | number): string {
  return `/dashboard/resume-maker/${id}/edit`;
}

/** `/dashboard/email-sop/:id/edit` with a concrete id. */
export function emailSopEditPath(id: string | number): string {
  return `/dashboard/email-sop/${id}/edit`;
}

/**
 * `/dashboard/resume-builder?resumeId=...`, optionally with `&download=pdf`
 * appended -- matches the exact query string ResumeScratchPageNew builds.
 */
export function resumeBuilderPath(
  resumeId: string | number,
  options?: { downloadPdf?: boolean }
): string {
  const suffix = options?.downloadPdf ? "&download=pdf" : "";
  return `/dashboard/resume-builder?resumeId=${resumeId}${suffix}`;
}
