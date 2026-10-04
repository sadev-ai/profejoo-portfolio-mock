// src/lib/emailSopStorage.ts
//
// Email/SOP documents aren't backed by an API yet -- they're persisted to
// localStorage under a single shared key. This wraps just the raw
// read/write (not the JSON parsing or migration logic, which differs
// slightly per call site) so that key lives in exactly one place instead
// of being retyped at every call site (EmailSOPs.tsx, EmailSOPEditPage.tsx,
// DashboardOverview.tsx).

import { EMAIL_SOPS_STORAGE_KEY } from "@/constants/storage";

export function readEmailSOPsRaw(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(EMAIL_SOPS_STORAGE_KEY);
}

export function writeEmailSOPsRaw(json: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EMAIL_SOPS_STORAGE_KEY, json);
}
