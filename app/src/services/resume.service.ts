// src/services/resume.service.ts
import { authApi } from "@/lib/axios";

const RESUMES_PATH = "/api/v1/resumes";
// File uploads get a longer timeout than the shared axios instance's
// default (30s) since parsing a CV file can take a while.
const UPLOAD_TIMEOUT_MS = 60000;

/* ====================== Backend API Types ====================== */

// Backend resume structure based on API documentation
export interface BackendResumeSection {
  academics?: Array<{
    description?: string;
    end?: string;
    gpa?: string;
    gpa_format?: string;
    institution?: string;
    location?: string;
    start?: string;
    title?: string;
  }>;
  basics?: {
    avatar_url?: string;
    birthday?: string;
    city?: string;
    country?: string;
    email?: string;
    first_name?: string;
    full_name?: string;
    gender?: string;
    last_name?: string;
    linkedin?: string;
    location?: string;
    phone?: string;
    summary?: string;
    tags?: string[];
    website?: string;
  };
  credentials?: Array<{
    description?: string;
    issuer?: string;
    link?: string;
    title?: string;
    year?: string;
  }>;
  experience?: Array<{
    bullets?: string[];
    current?: boolean;
    description?: string;
    employment_type?: string;
    end?: string;
    location?: string;
    organization?: string;
    professor?: string;
    start?: string;
    tags?: string[];
    title?: string;
    type?: string;
    work_arrangement?: string;
  }>;
  extras?: Array<{
    bullets?: string[];
    end?: string;
    location?: string;
    organization?: string;
    start?: string;
    tags?: string[];
    title?: string;
  }>;
  interests?: string[];
  languages?: string[];
  links?: Array<{
    title?: string;
    url?: string;
  }>;
  output?: Array<{
    link?: string;
    summary?: string;
    tags?: string[];
    title?: string;
    type?: "publication" | "project" | "honor_and_award" | "talk";
    venue?: string;
    year?: string;
  }>;
  skill_groups?: Array<{
    items?: string[];
    name?: string;
  }>;
}

export interface BackendResumePayload {
  notes?: string;
  order?: string[];
  pages?: number;
  sections: BackendResumeSection;
  source?: string;
  style?: string;
  status?: string;
  tags?: string[];
  template?: string;
  title: string;
  completeness?: number;
}

// Resume detail response (single resume)
export interface BackendResumeResponse {
  id: number;
  title: string;
  template?: string;
  style?: string;
  source?: string;
  status?: string;
  pages?: number;
  tags?: string[];
  completeness?: number;
  ai_status?: string;
  job_id?: string;
  created_at?: string;
  updated_at: string;
  data?: {
    notes?: string;
    section_order?: string[];
    sections?: BackendResumeSection;
    template?: string;
    imported_summary?: string[];
    raw_sections?: any;
  };
  cv_result?: any;
  sop_result?: any;
}

// Resume list item (without full sections)
export interface ResumeListItem {
  id: number;
  title: string;
  style?: string;
  source?: string;
  status?: string;
  pages?: number;
  tags?: string[];
  completeness?: number;
  ai_status?: string;
  created_at: string;
  updated_at: string;
}

// API response wrapper for list
export interface ResumeListResponse {
  data: ResumeListItem[];
  total: number;
  limit: number;
  offset: number;
}

/* ====================== Error Handling ====================== */

export class ResumeApiError extends Error {
  status: number;
  code?: string;
  data?: any;

  constructor(message: string, status: number, code?: string, data?: any) {
    super(message);
    this.name = "ResumeApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

function toResumeApiError(err: any): ResumeApiError {
  if (err?.code === "ECONNABORTED") {
    return new ResumeApiError("Request timed out", 408, "TIMEOUT");
  }

  if (err?.response) {
    const res = err.response;
    const data = res.data ?? {};

    const msg =
      data?.message ||
      data?.error ||
      data?.detail ||
      "Resume request failed";

    const code = data?.code || data?.error_code;
    return new ResumeApiError(String(msg), res.status, code, data);
  }

  if (err instanceof ResumeApiError) return err;

  return new ResumeApiError(
    err?.message || "Network error",
    0,
    "NETWORK_ERROR"
  );
}

/* ====================== Resume API Functions ====================== */

/**
 * GET /api/v1/resumes
 * List all resumes for the authenticated user
 */
export async function listResumes(params?: {
  status?: string[];
  style?: string[];
  source?: string[];
  sort?: string;
  limit?: number;
  offset?: number;
}): Promise<ResumeListResponse> {
  try {
    const res = await authApi.get(RESUMES_PATH, { params });
    return res.data as ResumeListResponse;
  } catch (err: any) {
    console.error("[RESUME] List resumes error:", err);
    throw toResumeApiError(err);
  }
}

/**
 * POST /api/v1/resumes
 * Create a new resume from scratch
 */
export async function createResume(
  payload: BackendResumePayload
): Promise<BackendResumeResponse> {
  try {
    const res = await authApi.post(RESUMES_PATH, payload);
    // Backend returns the resume data directly
    return res.data as BackendResumeResponse;
  } catch (err: any) {
    console.error("[RESUME] Create resume error:", err);
    throw toResumeApiError(err);
  }
}

/**
 * POST /api/v1/resumes/from-profile
 * Create resume from user's profile data
 */
export async function createResumeFromProfile(
  title?: string,
  template?: string
): Promise<BackendResumeResponse> {
  try {
    const payload: any = {};
    if (title) payload.title = title;
    if (template) payload.template = template;

    const res = await authApi.post(`${RESUMES_PATH}/from-profile`, payload);
    return res.data as BackendResumeResponse;
  } catch (err: any) {
    console.error("[RESUME] Create resume from profile error:", err);
    throw toResumeApiError(err);
  }
}

/**
 * POST /api/v1/resumes/import
 * Import resume from CV file
 */
export async function importResume(
  file: File
): Promise<BackendResumeResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await authApi.post(`${RESUMES_PATH}/import`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: UPLOAD_TIMEOUT_MS,
    });
    return res.data as BackendResumeResponse;
  } catch (err: any) {
    console.error("[RESUME] Import resume error:", err);
    throw toResumeApiError(err);
  }
}

/**
 * GET /api/v1/resumes/{id}
 * Get a specific resume by ID
 */
export async function getResume(id: number | string): Promise<BackendResumeResponse> {
  try {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const res = await authApi.get(`${RESUMES_PATH}/${numericId}`);
    // Backend returns nested structure with data field
    return res.data as BackendResumeResponse;
  } catch (err: any) {
    console.error("[RESUME] Get resume error:", err);
    throw toResumeApiError(err);
  }
}

/**
 * PUT /api/v1/resumes/{id}
 * Fully replace a resume (use with caution)
 */
export async function replaceResume(
  id: number | string,
  payload: BackendResumePayload
): Promise<BackendResumeResponse> {
  try {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const res = await authApi.put(`${RESUMES_PATH}/${numericId}`, payload);
    return res.data as BackendResumeResponse;
  } catch (err: any) {
    console.error("[RESUME] Replace resume error:", err);
    throw toResumeApiError(err);
  }
}

/**
 * PATCH /api/v1/resumes/{id}
 * Partially update a resume
 */
export async function updateResume(
  id: number | string,
  updates: Partial<BackendResumePayload>
): Promise<BackendResumeResponse> {
  try {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const res = await authApi.patch(`${RESUMES_PATH}/${numericId}`, updates);
    return res.data as BackendResumeResponse;
  } catch (err: any) {
    console.error("[RESUME] Update resume error:", err);
    throw toResumeApiError(err);
  }
}

/**
 * DELETE /api/v1/resumes/{id}
 * Delete a resume
 */
export async function deleteResume(id: number | string): Promise<void> {
  try {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    await authApi.delete(`${RESUMES_PATH}/${numericId}`);
  } catch (err: any) {
    console.error("[RESUME] Delete resume error:", err);
    console.error("[RESUME] Error details:", {
      status: err.response?.status,
      data: err.response?.data,
      url: err.config?.url
    });
    throw toResumeApiError(err);
  }
}

/* ====================== Helper Functions ====================== */

/**
 * Update only the title of a resume
 */
export async function updateResumeTitle(
  id: number | string,
  title: string
): Promise<BackendResumeResponse> {
  return updateResume(id, { title });
}

/**
 * Update only the template of a resume
 */
export async function updateResumeTemplate(
  id: number | string,
  template: string
): Promise<BackendResumeResponse> {
  return updateResume(id, { template });
}

/**
 * Update resume sections
 */
export async function updateResumeSections(
  id: number | string,
  sections: Partial<BackendResumeSection>
): Promise<BackendResumeResponse> {
  return updateResume(id, { sections: sections as BackendResumeSection });
}

/**
 * Duplicate a resume (fetch + create new)
 */
export async function duplicateResume(
  id: number | string,
  newTitle?: string
): Promise<BackendResumeResponse> {
  try {
    const original = await getResume(id);
    const payload: BackendResumePayload = {
      title: newTitle || `${original.title} (Copy)`,
      template: original.data?.template || original.template,
      style: original.style,
      source: "manual", // Mark as manual since it's a copy
      sections: (original.data?.sections || {}) as BackendResumeSection,
      tags: original.tags,
      notes: original.data?.notes,
      order: original.data?.section_order,
      pages: original.pages,
    };
    return await createResume(payload);
  } catch (err: any) {
    console.error("[RESUME] Duplicate resume error:", err);
    throw toResumeApiError(err);
  }
}
