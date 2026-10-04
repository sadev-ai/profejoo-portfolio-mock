import { publicApi } from "@/lib/axios";

export type Mode = "Professor" | "University";

// Describes a paginated search response from the backend.
export interface SearchApiResponse<T> {
  numberOfPages?: number;
  pageNumber?: number;
  pageLength?: number;
  totalResults?: number;
  orderBy?: string;
  orderDir?: "asc" | "desc";
  pageResults?: T[];
}

// Represents a normalized professor record returned by the API.
export interface ProfessorSearchHit {
  id?: string;
  display_name?: string;
  //firstName?: string;
  //lastName?: string;
  photo_url?: string;
  department?: string;
  //position?: string;
  university?: string;
  country?: string;
  subject?: string;
  tags?: string[];
  bio?: string;
  highlights?: string[]; // not included in back yet
  h_index?: number;
  cited_by_count?: number; // citation
  works_count?: number; // articles
  years_active?: number;
  //openToApply?: boolean;
}

// Represents a normalized university record returned by the API.
export interface UniversitySearchHit {
  id?: string;
  name?: string;
  country?: string;
  city?: string;
  qsRanking?: number;
  professors?: number;
  image_url?: string;
  logo_url?: string;
  subject?: string;
  qsRankingSubject?: number;
  international_students?: number;
}

// Payload SnF sends to the backend for any search request.
export interface SnFSearchRequest {
  mode: Mode;
  orderBy: string;
  orderDir?: "asc" | "desc";
  filters: Record<string, unknown>;
  pageNumber: number;
  pageLength: number;
}

// Resolves and validates the default API base URL.
const DEFAULT_API_BASE_URL = (() => {
  const raw = import.meta.env.VITE_DEFAULT_API_BASE_URL;
  const normalized = typeof raw === "string" ? raw.trim() : "";
  if (!normalized) {
    return "http://demo.local";
  }
  if (!/^https?:\/\//i.test(normalized)) {
    throw new Error(
      "Invalid VITE_DEFAULT_API_BASE_URL. It must start with http:// or https://"
    );
  }
  return normalized;
})();

// Removes trailing slashes so we can compose endpoints safely.
const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

// Decides which base URL the service should use.
const API_BASE_URL = (() => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof envUrl === "string" && envUrl.trim().length > 0) {
    return normalizeBaseUrl(envUrl.trim());
  }
  return normalizeBaseUrl(DEFAULT_API_BASE_URL);
})();

// REST endpoint for professor searches.
const PROFESSOR_SEARCH_URL =
  import.meta.env.VITE_PROFESSOR_SEARCH_URL ??
  `${API_BASE_URL}/api/v1/search/professors/advanced`;

// REST endpoint for university searches.
const UNIVERSITY_SEARCH_URL =
  import.meta.env.VITE_UNIVERSITY_SEARCH_URL ??
  `${API_BASE_URL}/api/v1/search/universities/advanced`;

// REST endpoint to fetch dropdown metadata.
const FILTER_METADATA_URL =
  import.meta.env.VITE_SNF_FILTER_METADATA_URL ??
  `${API_BASE_URL}/api/v1/search/filters/metadata`;

// Sanitizes string-array filters and removes empties.
const ensureStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((entry) => String(entry).trim())
        .filter((entry) => entry.length > 0)
    : [];

// Attempts to coerce unknown values into numbers.
const ensureNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

// Ensures slider tuples are always [min, max] numeric pairs.
const ensureNumberRange = (
  value: unknown
): [number | undefined, number | undefined] => {
  if (Array.isArray(value) && value.length === 2) {
    return [ensureNumber(value[0]), ensureNumber(value[1])];
  }
  return [undefined, undefined];
};

// Safe trim to avoid undefined or non-string errors.
const sanitizeString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

// Removes undefined entries so axios doesn’t send null-valued keys.
const stripUndefined = (payload: Record<string, unknown>) => {
  const next: Record<string, unknown> = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) {
      next[key] = value;
    }
  });
  return next;
};

// Creates the common part of both search payloads.
const createBasePayload = (request: SnFSearchRequest) => {
  return {
    orderBy: request.orderBy,
    orderDir: request.orderDir ?? "asc",
    limit: request.pageLength, // exactly the old pageLenthe
    offset: (request.pageNumber - 1) * request.pageLength, // instead of the old pageNumber
  };
};

// Builds the professor-specific payload for POST /search/professors.
const buildProfessorPayload = (request: SnFSearchRequest) => {
  const filters = request.filters;
  const [hIndexMin, hIndexMax] = ensureNumberRange(
    filters["hIndex"] ?? filters["h_index"]
  );
  const [citationMin, citationMax] = ensureNumberRange(filters["citation"]);

  return stripUndefined({
    ...createBasePayload(request),
    query: sanitizeString(filters["name"]),
    universities: ensureStringArray(filters["universities"]),
    countries: ensureStringArray(filters["countries"]),
    subjects: ensureStringArray(filters["subjects"]),
    h_index_min: hIndexMin,
    h_index_max: hIndexMax,
    cited_by_min: citationMin,
    cited_by_max: citationMax,
  });
};

// Builds the university-specific payload for POST /search/universities.
const buildUniversityPayload = (request: SnFSearchRequest) => {
  const filters = request.filters;
  const [qsMin, qsMax] = ensureNumberRange(
    filters["qsRanking"] ?? filters["qs_ranking"]
  );

  return stripUndefined({
    ...createBasePayload(request),
    countries: ensureStringArray(filters["countries"]),
    universities: ensureStringArray(
      filters["universityNames"] ?? filters["names"]
    ),
    subjects: ensureStringArray(filters["subjects"]),
    qsRanking_min: qsMin,
    qsRanking_max: qsMax,
    search_by_subject_ranking: false,
  });
};

// Chooses the correct builder based on the search mode.
const buildPayload = (request: SnFSearchRequest) =>
  request.mode === "Professor"
    ? buildProfessorPayload(request)
    : buildUniversityPayload(request);

// Returns the API endpoint for a given search mode.
const resolveEndpoint = (mode: Mode) =>
  mode === "Professor" ? PROFESSOR_SEARCH_URL : UNIVERSITY_SEARCH_URL;

// POSTs searches to the backend and returns the parsed JSON.
export const submitSnFSearch = async <T = unknown>(
  request: SnFSearchRequest
): Promise<T> => {
  const payload = buildPayload(request);
  const url = resolveEndpoint(request.mode);

  const response = await publicApi.post<T>(url, payload);

  return response.data;
};

// Raw metadata returned by /search/filters/metadata.
export interface SearchFiltersMetadataResponse {
  countries: string[];
  subjects: string[];
  universities: Array<{
    id?: number;
    name: string;
    ID?: number;
    Name?: string;
  }>;
  sortOptions: {
    professors: Array<{
      value: string;
      label?: string;
      defaultDir?: "asc" | "desc";
    }>;
    universities: Array<{
      value: string;
      label?: string;
      defaultDir?: "asc" | "desc";
    }>;
  };
}

// Fetches dropdown metadata for the SnF UX.
export const fetchSearchFiltersMetadata = async () => {
  const response = await publicApi.get<SearchFiltersMetadataResponse>(
  FILTER_METADATA_URL
  );
return response.data;
};
