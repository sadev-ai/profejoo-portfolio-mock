// src/services/profile.service.ts
import { authApi } from "@/lib/axios";
import type { ProfileResponse, ProfileData } from "@/types/profile";

const PROFILE_PATH = "/api/v1/profile";

/* ====================== Error Handling ====================== */

export class ProfileApiError extends Error {
  status: number;
  code?: string;
  data?: any;

  constructor(message: string, status: number, code?: string, data?: any) {
    super(message);
    this.name = "ProfileApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

function toProfileApiError(err: any): ProfileApiError {
  if (err?.code === "ECONNABORTED") {
    return new ProfileApiError("Request timed out", 408, "TIMEOUT");
  }

  if (err?.response) {
    const res = err.response;
    const data = res.data ?? {};

    const msg =
      data?.message ||
      data?.error ||
      data?.detail ||
      "Profile request failed";

    const code = data?.code || data?.error_code;
    return new ProfileApiError(String(msg), res.status, code, data);
  }

  if (err instanceof ProfileApiError) return err;

  return new ProfileApiError(
    err?.message || "Network error",
    0,
    "NETWORK_ERROR"
  );
}

/* ====================== Profile API Functions ====================== */

/**
 * GET /api/v1/profile
 * Get user's complete profile data
 */
export async function getProfile(): Promise<ProfileResponse> {
  try {
    const res = await authApi.get(PROFILE_PATH);
    return res.data as ProfileResponse;
  } catch (err: any) {
    console.error("[PROFILE] Get profile error:", err);
    throw toProfileApiError(err);
  }
}

/**
 * PATCH /api/v1/profile
 * Partially update profile sections
 * Only provided sections will be updated
 */
export async function updateProfile(
  updates: Partial<ProfileData>
): Promise<ProfileResponse> {
  try {
    const res = await authApi.patch(PROFILE_PATH, updates);
    return res.data as ProfileResponse;
  } catch (err: any) {
    console.error("[PROFILE] Update profile error:", err);
    throw toProfileApiError(err);
  }
}

/**
 * PUT /api/v1/profile
 * Fully replace profile data (use with caution)
 */
export async function replaceProfile(
  profileData: ProfileData
): Promise<ProfileResponse> {
  try {
    const res = await authApi.put(PROFILE_PATH, profileData);
    return res.data as ProfileResponse;
  } catch (err: any) {
    console.error("[PROFILE] Replace profile error:", err);
    throw toProfileApiError(err);
  }
}

/* ====================== Section-specific Update Helpers ====================== */

/**
 * Update only the basics section
 */
export async function updateBasics(
  basics: ProfileData["basics"]
): Promise<ProfileResponse> {
  return updateProfile({ basics });
}

/**
 * Update only the academics section
 */
export async function updateAcademics(
  academics: ProfileData["academics"]
): Promise<ProfileResponse> {
  return updateProfile({ academics });
}

/**
 * Update only the experience section
 */
export async function updateExperience(
  experience: ProfileData["experience"]
): Promise<ProfileResponse> {
  return updateProfile({ experience });
}

/**
 * Update only the output section
 */
export async function updateOutput(
  output: ProfileData["output"]
): Promise<ProfileResponse> {
  return updateProfile({ output });
}

/**
 * Update only the credentials section
 */
export async function updateCredentials(
  credentials: ProfileData["credentials"]
): Promise<ProfileResponse> {
  return updateProfile({ credentials });
}

/**
 * Update only the skills section
 */
export async function updateSkills(
  skill_groups: ProfileData["skill_groups"],
  links?: ProfileData["links"]
): Promise<ProfileResponse> {
  return updateProfile({ skill_groups, links });
}

/**
 * Update only the interests section
 */
export async function updateInterests(
  interests: ProfileData["interests"]
): Promise<ProfileResponse> {
  return updateProfile({ interests });
}

/**
 * Update only the languages section
 */
export async function updateLanguages(
  languages: ProfileData["languages"]
): Promise<ProfileResponse> {
  return updateProfile({ languages });
}

/**
 * Update only the extras section
 */
export async function updateExtras(
  extras: ProfileData["extras"]
): Promise<ProfileResponse> {
  return updateProfile({ extras });
}
