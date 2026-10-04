import { publicApi } from "@/lib/axios";
import { ApiError } from "@/lib/apiError";

const PROFESSOR_METADATA_PATH =
  import.meta.env.VITE_PROF_METADATA_URL ?? "/api/v1/professor-metadata";

export type UniversitySummary = {
  id?: number;
  name?: string;
  qs_ranking?: number;
  qs_ranking_subject?: number;
  country?: string;
  region?: string;
  city?: string;
  overall_score?: string;
  website?: string;
  openalex_id?: string;
  ror_id?: string;
  image_url?: string;
  logo_url?: string;
  international_students?: number;
};

export type ProfessorMetadata = {
  id: number;
  openalex_id?: string;
  display_name?: string;
  works_count?: number;
  cited_by_count?: number;
  orcid?: string;
  h_index?: number;
  subject?: string;
  department?: string;
  scholar_link?: string;
  primary_university_id?: number;
  primary_university?: UniversitySummary;
  universities?: UniversitySummary[];
  last_known_institution_id?: string;
  photo_url?: string;
  years_active?: string | number;
  tags?: string[];
  bio?: string;
  highlights?: string[];
  [key: string]: unknown;
};

function toProfMetadataError(err: any): ApiError {
  if (err?.code === "ECONNABORTED") {
    return new ApiError("Request timed out", 408, "TIMEOUT");
  }

  if (err?.response) {
    const res = err.response;
    const data = res.data ?? {};

    const msg =
      data?.message ||
      data?.error ||
      data?.detail ||
      "Professor metadata request failed";

    const code = data?.code || data?.error_code;
    return new ApiError(String(msg), res.status, code, data);
  }

  if (err instanceof ApiError) return err;

  return new ApiError(err?.message || "Network error", 0, "NETWORK_ERROR");
}

export async function getProfessorMetadata(
  profId: string | number
): Promise<ProfessorMetadata> {
  try {
    const url = `${PROFESSOR_METADATA_PATH}/${encodeURIComponent(
      String(profId)
    )}`;
    const res = await publicApi.get<ProfessorMetadata>(url);
    return res.data;
  } catch (err: unknown) {
    throw toProfMetadataError(err);
  }
}
