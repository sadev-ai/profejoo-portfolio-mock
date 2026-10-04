// src/lib/jwt.ts
//
// Single source of truth for decoding a JWT payload. The same base64url
// decode algorithm previously existed twice: authToken.service.ts's
// getJwtPayload (silent on failure) and auth.service.ts's
// decodeGoogleIdToken (logs on failure). Both now call this with an
// optional error callback so each call site keeps its own exact logging
// behavior.

export function decodeJwtPayload<T = any>(
  token?: string | null,
  onError?: (error: unknown) => void
): T | null {
  if (!token) return null;

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((char) => {
          return "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(json);
  } catch (error) {
    onError?.(error);
    return null;
  }
}
