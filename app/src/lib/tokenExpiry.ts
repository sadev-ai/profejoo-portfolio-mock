// src/lib/tokenExpiry.ts
//
// Single source of truth for turning an auth response into a concrete
// "expires at" unix timestamp (seconds). auth.service.ts and lib/axios.ts
// previously each had an identical copy of this pair of functions.

import { fromRes } from "@/lib/apiError";
import { getJwtExpiry } from "@/services/authToken.service";

export function normalizeExpiresAt(value: any): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return undefined;
  }

  return numericValue > 1_000_000_000_000
    ? Math.floor(numericValue / 1000)
    : Math.floor(numericValue);
}

export function resolveExpiresAt(data: any, accessToken: string): number {
  const directExpiry = normalizeExpiresAt(
    fromRes(data, ["expiresAt", "expires_at", "exp"])
  );

  if (directExpiry) {
    return directExpiry;
  }

  const expiresIn = Number(fromRes(data, ["expires_in", "expiresIn"]));

  if (Number.isFinite(expiresIn) && expiresIn > 0) {
    return Math.floor(Date.now() / 1000) + expiresIn;
  }

  const jwtExpiry = getJwtExpiry(accessToken);

  if (jwtExpiry) {
    return jwtExpiry;
  }

  return Math.floor(Date.now() / 1000) + 3600;
}
