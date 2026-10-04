// src/lib/url.ts
//
// Shared URL helpers for profile form fields. The validation logic here
// was previously copy-pasted (identically) across BasicsSection, LinkForm,
// OutputForm, and CredentialForm.

/**
 * Validates a (possibly protocol-less) URL the same way every profile form
 * does: a bare domain is treated as https, and only http(s) is accepted as
 * the final protocol. Returns "" when the value is empty/valid, or a
 * user-facing error message otherwise.
 */
export function computeUrlError(val: string): string {
  if (!val.trim()) return "";
  try {
    const normalized = val.match(/^https?:\/\//i) ? val : `https://${val}`;
    const u = new URL(normalized);
    if (!/^https?:$/.test(u.protocol)) throw new Error("Only http(s) allowed");
    return "";
  } catch {
    return "Enter a valid URL (e.g., https://example.com)";
  }
}

/**
 * Adds an https:// prefix to a bare domain/URL if one isn't already
 * present. Matches the normalization LinkForm, OutputForm, and
 * CredentialForm apply at submit time (no trimming).
 */
export function withHttpsPrefix(val: string): string {
  return val.match(/^https?:\/\//i) ? val : `https://${val}`;
}

/**
 * Same idea as withHttpsPrefix, but also trims and treats a blank value as
 * "". Matches BasicsSection's normalizeUrl behavior exactly.
 */
export function normalizeUrl(val?: string): string {
  return val && val.trim() ? withHttpsPrefix(val.trim()) : "";
}
