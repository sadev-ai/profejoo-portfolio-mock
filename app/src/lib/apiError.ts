// src/lib/apiError.ts
//
// Single source of truth for API error handling. Previously this exact
// class + mapping logic was independently reimplemented in auth.service.ts,
// notifications.service.ts, profmd.service.ts, chatbot.service.ts (as
// ApiError/toApiError), and re-implemented under different names in
// profile.service.ts (ProfileApiError/toProfileApiError) and
// resume.service.ts (ResumeApiError/toResumeApiError). Every call site
// should import from here instead of redefining its own copy.

export class ApiError extends Error {
  status: number;
  code?: string;
  data?: any;

  constructor(message: string, status: number, code?: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

/**
 * Looks up the first present key across a response's common shapes:
 * top-level, `.data`, or `.result`. Backends in this app aren't fully
 * consistent about which shape they return, so call sites pass a list of
 * acceptable key aliases (e.g. `["access_token", "accessToken"]`).
 */
export function fromRes(res: any, keys: string[]) {
  for (const key of keys) {
    if (res?.[key] !== undefined) return res[key];
    if (res?.data?.[key] !== undefined) return res.data[key];
    if (res?.result?.[key] !== undefined) return res.result[key];
  }

  return undefined;
}

/**
 * Normalizes any thrown value (axios error, network error, already-an-
 * ApiError, etc.) into an ApiError with a consistent shape.
 */
export function toApiError(error: any): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (typeof error?.status === "number") {
    return new ApiError(
      error.message || "Request failed",
      error.status,
      error.code,
      error.data
    );
  }

  if (error?.code === "ECONNABORTED") {
    return new ApiError("Request timed out", 408, "TIMEOUT");
  }

  if (error?.response) {
    const response = error.response;
    const data = response.data ?? {};

    const message =
      data?.message ||
      data?.error ||
      data?.detail ||
      (Array.isArray(data?.errors) &&
        (data.errors[0]?.message || data.errors[0]?.msg)) ||
      "Request failed";

    const code = data?.code || data?.error_code || data?.errorCode;

    return new ApiError(String(message), response.status, code, data);
  }

  return new ApiError(
    error?.message || "Network error",
    0,
    "NETWORK_ERROR",
    error?.data
  );
}
