// src/services/authToken.service.ts

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const ACCESS_TOKEN_EXPIRES_AT_KEY = "accessTokenExpiresAt";
const USER_KEY = "user";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function getAccessToken(): string | null {
  return getStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

export function getRefreshToken(): string | null {
  return getStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
}

export function saveTokens(
  accessToken: string,
  refreshToken?: string | null,
  expiresAt?: number | null
) {
  const storage = getStorage();
  if (!storage) return;

  storage.setItem(ACCESS_TOKEN_KEY, accessToken);

  if (refreshToken) {
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  const finalExpiresAt = expiresAt || getJwtExpiry(accessToken);

  if (finalExpiresAt) {
    storage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, String(finalExpiresAt));
  }
}

export function saveUser(user: any) {
  const storage = getStorage();
  if (!storage || !user) return;

  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): any | null {
  const storage = getStorage();
  if (!storage) return null;

  const raw = storage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuthTokens() {
  const storage = getStorage();
  if (!storage) return;

  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
  storage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
  storage.removeItem(USER_KEY);
}

export function getJwtPayload<T = any>(token?: string | null): T | null {
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
  } catch {
    return null;
  }
}

export function getJwtExpiry(token?: string | null): number | null {
  const payload = getJwtPayload<{ exp?: number }>(token);

  if (!payload?.exp || typeof payload.exp !== "number") {
    return null;
  }

  return payload.exp;
}

export function getAccessTokenExpiry(): number | null {
  const storage = getStorage();
  if (!storage) return null;

  const raw = storage.getItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
  if (!raw) return null;

  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function isAccessTokenExpired(leewaySeconds = 30): boolean {
  const savedExpiry = getAccessTokenExpiry();
  const jwtExpiry = getJwtExpiry(getAccessToken());

  const expiry = savedExpiry || jwtExpiry;

  if (!expiry) return true;

  const now = Math.floor(Date.now() / 1000);

  return now >= expiry - leewaySeconds;
}