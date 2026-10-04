// src/services/auth.service.ts

import { publicApi, authApi } from "@/lib/axios";

import {
  saveTokens,
  saveUser,
} from "@/services/authToken.service";
import { ApiError, toApiError, fromRes } from "@/lib/apiError";
import { resolveExpiresAt } from "@/lib/tokenExpiry";
import { decodeJwtPayload } from "@/lib/jwt";

// Re-exported so existing `import { ApiError } from "@/services/auth.service"`
// call sites across the app keep working unchanged.
export { ApiError };

const JSON_HEADERS = { "Content-Type": "application/json" };

const LOGIN_PATH           = "/api/v1/auth/login";
const LOGOUT_PATH          = "/api/v1/auth/logout";
const REFRESH_PATH         = "/api/v1/auth/refresh";
const SIGNUP_PATH          = "/api/v1/auth/signup";
const SIGNUP_VERIFY_PATH   = "/api/v1/auth/signup/verify";
const FORGOT_PASSWORD_PATH = "/api/v1/auth/forgot-password";
const RESET_PASSWORD_PATH  = "/api/v1/auth/reset-password";
const ME_PATH              = "/api/v1/me";
const GOOGLE_AUTH_PATH     = "/api/v1/auth/google";

function extractUser(data: any) {
  const user = fromRes(data, ["user"]);

  if (user) {
    return user;
  }

  const userId = fromRes(data, ["user_id", "userId", "id"]);

  if (!userId) {
    return null;
  }

  return {
    id: userId,
    user_id: userId,
    email: fromRes(data, ["email"]),
    username: fromRes(data, ["username"]),
    role: fromRes(data, ["role"]),
    verified: fromRes(data, ["verified"]),
  };
}

async function buildAndSaveAuthResult(
  data: any,
  fallbackRefreshToken?: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user?: any;
}> {
  const accessToken = fromRes(data, [
    "access_token",
    "accessToken",
    "token",
    "jwt",
  ]);

  const refreshTokenFromResponse = fromRes(data, [
    "refresh_token",
    "refreshToken",
  ]);

  const refreshToken = refreshTokenFromResponse || fallbackRefreshToken;

  if (!accessToken) {
    throw new ApiError("Missing access token", 500, "NO_ACCESS_TOKEN", data);
  }

  const expiresAt = resolveExpiresAt(data, accessToken);

  saveTokens(accessToken, refreshToken, expiresAt);

  const user = extractUser(data);

  if (user) {
    saveUser(user);
  }

  return {
    accessToken,
    refreshToken,
    expiresAt,
    user,
  };
}

export type SignupRequestBody = {
  email: string;
  password: string;
  password_confirm: string;
};

export async function signup(body: SignupRequestBody): Promise<any> {
  try {
    const res = await publicApi.post(SIGNUP_PATH, body, {
      headers: JSON_HEADERS,
    });

    return res.data;
  } catch (error: any) {
    console.error("[AUTH] Signup error:", error);
    throw toApiError(error);
  }
}

export type SignupVerifyBody = {
  email: string;
  otp: string;
  password: string;
};

export async function signupVerify(body: SignupVerifyBody): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user?: any;
}> {
  try {
    const res = await publicApi.post(SIGNUP_VERIFY_PATH, body, {
      headers: JSON_HEADERS,
    });

    return await buildAndSaveAuthResult(res.data);
  } catch (error: any) {
    console.error("[AUTH] Signup verify error:", error);
    throw toApiError(error);
  }
}

export type LoginRequestBody = {
  email: string;
  password: string;
};

export async function login(body: LoginRequestBody): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user?: any;
}> {
  try {
    const res = await publicApi.post(LOGIN_PATH, body, {
      headers: JSON_HEADERS,
    });

    return await buildAndSaveAuthResult(res.data);
  } catch (error: any) {
    console.error("[AUTH] Login error:", error);
    throw toApiError(error);
  }
}

export async function logout(refreshToken: string): Promise<{ ok: true }> {
  try {
    await publicApi.post(
      LOGOUT_PATH,
      {
        refresh_token: refreshToken,
      },
      {
        headers: JSON_HEADERS,
      }
    );

    return { ok: true };
  } catch (error: any) {
    console.error("[AUTH] Logout error:", error);
    throw toApiError(error);
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user?: any;
}> {
  try {
    const res = await publicApi.post(
      REFRESH_PATH,
      {
        refresh_token: refreshToken,
      },
      {
        headers: JSON_HEADERS,
      }
    );

    return await buildAndSaveAuthResult(res.data, refreshToken);
  } catch (error: any) {
    console.error("[AUTH] Refresh token error:", error);
    throw toApiError(error);
  }
}

export async function forgotPassword(
  email: string
): Promise<{ ok: true; cooldown?: number }> {
  try {
    const res = await publicApi.post(
      FORGOT_PASSWORD_PATH,
      {
        email,
      },
      {
        headers: JSON_HEADERS,
      }
    );

    const data = res.data;

    const cooldownRaw = fromRes(data, ["cooldown", "retry_after", "retryAfter"]);
    const cooldown =
      typeof cooldownRaw === "number" ? cooldownRaw : undefined;

    return {
      ok: true,
      cooldown,
    };
  } catch (error: any) {
    console.error("[AUTH] Forgot password error:", error);
    throw toApiError(error);
  }
}

export type ResetPasswordBody = {
  email: string;
  otp: string;
  new_password: string;
  password_confirm: string;
};

export async function resetPassword(
  body: ResetPasswordBody
): Promise<{ ok: true }> {
  try {
    await publicApi.post(RESET_PASSWORD_PATH, body, {
      headers: JSON_HEADERS,
    });

    return { ok: true };
  } catch (error: any) {
    console.error("[AUTH] Reset password error:", error);
    throw toApiError(error);
  }
}

export async function me(): Promise<any> {
  try {
    const res = await authApi.get(ME_PATH, {
      headers: JSON_HEADERS,
    });

    return res.data;
  } catch (error: any) {
    console.error("[AUTH] Me error:", error);
    throw toApiError(error);
  }
}

function decodeGoogleIdToken(idToken: string): any {
  return decodeJwtPayload(idToken, (error) =>
    console.error("[AUTH] Failed to decode Google ID token:", error)
  );
}

export async function googleAuth(
  idToken: string,
  deviceId?: string
): Promise<any> {
  try {
    const googleUserInfo = decodeGoogleIdToken(idToken);

    const res = await publicApi.post(
      GOOGLE_AUTH_PATH,
      {
        id_token: idToken,
        device_id: deviceId || "web-browser",
      },
      {
        headers: JSON_HEADERS,
      }
    );

    const data = res.data;

    const result = await buildAndSaveAuthResult(data);

    const backendUser = extractUser(data);

    const user =
      backendUser ||
      result.user ||
      {
        user_id: fromRes(data, ["user_id", "userId"]) || googleUserInfo?.sub,
        id: fromRes(data, ["user_id", "userId"]) || googleUserInfo?.sub,
        username:
          fromRes(data, ["username"]) ||
          googleUserInfo?.name ||
          googleUserInfo?.email,
        email: fromRes(data, ["email"]) || googleUserInfo?.email,
        role: fromRes(data, ["role"]) || "user",
        verified:
          fromRes(data, ["verified"]) ?? googleUserInfo?.email_verified ?? true,
      };

    saveUser(user);

    return {
      ...data,
      ...result,
      user,
    };
  } catch (error: any) {
    console.error("[AUTH] Google auth error:", error);
    throw toApiError(error);
  }
}