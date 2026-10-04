// src/constants/storage.ts
//
// Single source of truth for localStorage key names. The auth keys were
// already centralized behind authToken.service.ts's own functions (use
// those rather than this constant directly). The email/SOP key wasn't --
// it was retyped as a raw string in EmailSOPs.tsx, EmailSOPEditPage.tsx,
// and DashboardOverview.tsx.

/**
 * Email/SOP documents aren't backed by an API yet, so they're persisted to
 * localStorage under this single shared key. See lib/emailSopStorage.ts
 * for the read/write helpers built on top of it.
 */
export const EMAIL_SOPS_STORAGE_KEY = "userEmailSOPs";
