// src/pages/SnF.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { AxiosError } from "axios";
import SearchHero, {
  type FieldDomains,
  type ProfessorSelection,
  type SearchRequestPayload,
  type SortOption,
} from "@/components/SearchAndFilter/Hero/SearchHero";
import ProfessorGrid from "@/components/SearchAndFilter/ProfessorCard/ProfessorGrid";
import UniversityGrid from "@/components/SearchAndFilter/UniversityCard/UniversityGrid";
import PaginationDots from "@/components/SearchAndFilter/PaginationDots";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/footer/Footer";
import type { Professor } from "@/components/SearchAndFilter/ProfessorCard/ProfessorExpandableCard";
import type { UniversityCardProps } from "@/components/SearchAndFilter/UniversityCard/UniversityCard";
import {
  submitSnFSearch,
  fetchSearchFiltersMetadata,
  type ProfessorSearchHit,
  type SearchApiResponse,
  type UniversitySearchHit,
  type SearchFiltersMetadataResponse,
} from "@/services/Search.service";

type Mode = "University" | "Professor";

const PAGE_LENGTH = 24;

const DEFAULT_SORT_OPTIONS: Record<Mode, SortOption[]> = {
  University: [
    { label: "Alphabetical", value: "alphabet", defaultDir: "asc" },
    { label: "QS Ranking", value: "qs_ranking", defaultDir: "asc" },
    { label: "Professors Count", value: "professors_count", defaultDir: "desc" },
  ],
  Professor: [
    { label: "Alphabetical", value: "alphabet", defaultDir: "asc" },
    { label: "H-Index", value: "h_index", defaultDir: "desc" },
    { label: "Citation", value: "citation", defaultDir: "desc" },
  ],
};

const dedupeAndSort = (values?: string[]) =>
  Array.from(
    new Set(
      (values ?? [])
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value?.length))
    )
  ).sort((a, b) => a.localeCompare(b));

const extractUniversityNames = (
  universities?: SearchFiltersMetadataResponse["universities"]
) =>
  dedupeAndSort(
    universities
      ?.map((entry) => entry?.name ?? (entry as { Name?: string })?.Name ?? "")
      .filter((name) => name.length > 0)
  );

const convertMetadataToDomains = (
  metadata: SearchFiltersMetadataResponse
): FieldDomains => ({
  qsRanking: [1, 1000],
  hIndex: [0, 200],
  citation: [0, 300000],
  universityNames: extractUniversityNames(metadata.universities),
  subjects: dedupeAndSort(metadata.subjects),
  countries: dedupeAndSort(metadata.countries),
});

const extractSearchErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
    ) {
      return (data as { message: string }).message;
    }
    if (typeof data === "string") {
      return data;
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error while calling the search API.";
};

const sanitizeText = (value?: string, fallback = "") =>
  value && value.length > 0 ? value : fallback;

const coalesceStringArray = (values?: string[], fallback: string[] = []) =>
  values?.map((entry) => entry.trim()).filter((entry) => entry.length > 0) ??
  ((fallback.length > 0) ? fallback : []); 

const buildProfessorCard = (
  result: ProfessorSearchHit,
  index: number
): Professor => {
  const tagCandidates = coalesceStringArray(result.tags);
  return {
    id: result.id?.toString() ?? (index + 1).toString(), 
    name: sanitizeText(result.display_name, "Unknown Name"),
    university: result.university ?? "Unknown University",
    field: result.subject ?? "Unknown Subject",
    department: sanitizeText(result.department, "Unknown Department"),
    tags: tagCandidates,
    stats: {
      yearsActivity: result.years_active ?? -1,
      hIndex: result.h_index ?? -1,
      citations: result.cited_by_count ?? -1,
    },
    avatar:
      result.photo_url ??
      "/assets/images/Logo.svg",
    about: result.bio ?? undefined,
    highlights: result.highlights ?? undefined,
  };
};

const buildUniversityCard = (
  result: UniversitySearchHit,
  index: number
): UniversityCardProps => {
  const fallbackName = sanitizeText(result.name, `University #${index + 1}`);
  return {
    name: fallbackName,
    country: sanitizeText(result.country, "Unknown Country"),
    city: sanitizeText(result.city, "Unknown City"),
    ranking: result.qsRanking ?? -1,
    professors: result.professors ?? -1,
    image:
      result.image_url ??
      "/assets/images/Logo.svg",
    logoImage:
      result.logo_url ??
      "/assets/images/Logo.svg",
    subject: sanitizeText(result.subject, "General Studies"),
    rankingSubj: result.qsRankingSubject ?? result.qsRanking ?? -1,
    internationalStudents: result.international_students ?? 0,
  };
};

const SearchAndFilterPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>("University");
  const [pendingProfessorFilters, setPendingProfessorFilters] =
    useState<ProfessorSelection | null>(null);
  const [pageByMode, setPageByMode] = useState<Record<Mode, number>>({
    University: 1,
    Professor: 1,
  });
  const [lastSearchPayload, setLastSearchPayload] =
    useState<SearchRequestPayload | null>(null);
  const [searchResponses, setSearchResponses] = useState<{
    Professor?: SearchApiResponse<ProfessorSearchHit>;
    University?: SearchApiResponse<UniversitySearchHit>;
  }>({});
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loadingMode, setLoadingMode] = useState<Mode | null>(null);
  const [fieldDomains, setFieldDomains] = useState<FieldDomains | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const metadataLoadedRef = useRef(false);
  const [sortOptionsByMode, setSortOptionsByMode] = useState<
    Record<Mode, SortOption[]>
  >(DEFAULT_SORT_OPTIONS);

  const totalUniversityPages = Math.max(
    1,
    searchResponses.University?.numberOfPages ?? 1
  );
  const totalProfessorPages = Math.max(
    1,
    searchResponses.Professor?.numberOfPages ?? 1
  );

  useEffect(() => {
    setPageByMode((prev) => ({
      University: Math.min(prev.University, totalUniversityPages),
      Professor: Math.min(prev.Professor, totalProfessorPages),
    }));
  }, [totalUniversityPages, totalProfessorPages]);

  const loadMetadata = useCallback(async () => {
    setMetadataLoading(true);
    setMetadataError(null);
    try {
      const metadata = await fetchSearchFiltersMetadata();
      setFieldDomains(convertMetadataToDomains(metadata));
      setSortOptionsByMode(convertSortOptions(metadata.sortOptions));
    } catch (error) {
      setMetadataError(extractSearchErrorMessage(error));
    } finally {
      setMetadataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (metadataLoadedRef.current) return;
    metadataLoadedRef.current = true;
    void loadMetadata();
  }, [loadMetadata]);

  const handleProfessorRedirect = (selection: ProfessorSelection) => {
    setPendingProfessorFilters(selection);
    setPageByMode((prev) => ({ ...prev, Professor: 1 }));
    setMode("Professor");
  };

  useEffect(() => {
    if (loadingMode === null && lastSearchPayload) {
      requestAnimationFrame(() => {
        scrollOrderByIntoView();
      });
    }
  }, [lastSearchPayload, loadingMode]);

  const scrollOrderByIntoView = () => {
    if (typeof window === "undefined") return;
    const anchor = document.getElementById("snf-orderby-anchor");
    if (!anchor) return;
    const navHeight =
      document.querySelector("nav")?.getBoundingClientRect().height ?? 0;
    const top =
      anchor.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({
      top: Math.max(top, 0),
      behavior: "smooth",
    });
  };

  const emitSearch = useCallback(
    async (payload: SearchRequestPayload, pageNumber: number) => {
      const request = {
        mode: payload.mode,
        orderBy: payload.orderBy,
        orderDir: payload.orderDir,
        filters: payload.filters,
        pageNumber,
        pageLength: PAGE_LENGTH,
      };

      setSearchError(null);
      setLoadingMode(payload.mode);

      try {
        if (payload.mode === "Professor") {
          const response =
            await submitSnFSearch<SearchApiResponse<ProfessorSearchHit>>(
              request
            );
          setSearchResponses((prev) => ({ ...prev, Professor: response }));
          setPageByMode((prev) => ({
            ...prev,
            Professor: response.pageNumber ?? pageNumber,
          }));
        } else {
          const response =
            await submitSnFSearch<SearchApiResponse<UniversitySearchHit>>(
              request
            );
          setSearchResponses((prev) => ({ ...prev, University: response }));
          setPageByMode((prev) => ({
            ...prev,
            University: response.pageNumber ?? pageNumber,
          }));
        }
      } catch (error) {
        console.error("Submitting search request failed:", error);
        setSearchError(extractSearchErrorMessage(error));
      } finally {
        setLoadingMode((current) =>
          current === payload.mode ? null : current
        );
      }
    },
    []
  );

  const handlePageChange = (page: number) => {
    setPageByMode((prev) => ({ ...prev, [mode]: page }));
    if (lastSearchPayload && lastSearchPayload.mode === mode) {
      void emitSearch(lastSearchPayload, page);
    }
  };

  const handleSearchRequest = useCallback(
    (payload: SearchRequestPayload, options?: { resetPage?: boolean }) => {
      setLastSearchPayload(payload);
      const targetPage = options?.resetPage ? 1 : pageByMode[payload.mode];

      if (options?.resetPage) {
        setPageByMode((prev) => {
          if (prev[payload.mode] === 1) return prev;
          return { ...prev, [payload.mode]: 1 };
        });
      }

      void emitSearch(payload, targetPage);
    },
    [emitSearch, pageByMode]
  );

  const professorResults = searchResponses.Professor
    ? (searchResponses.Professor.pageResults ?? []).map((result, index) =>
        buildProfessorCard(result, index)
      )
    : [];
  const universityResults = searchResponses.University
    ? (searchResponses.University.pageResults ?? []).map((result, index) =>
        buildUniversityCard(result, index)
      )
    : [];

  const currentResults =
    mode === "Professor" ? professorResults : universityResults;
  const totalPages =
    mode === "Professor" ? totalProfessorPages : totalUniversityPages;
  const currentPage = pageByMode[mode];
  const hasCurrentModeResponse =
    mode === "Professor"
      ? Boolean(searchResponses.Professor)
      : Boolean(searchResponses.University);
  const isModeLoading = loadingMode === mode;

  const emptyStateMessage = hasCurrentModeResponse
    ? `No ${
        mode === "Professor" ? "professors" : "universities"
      } match these filters.`
    : `Use the filters above to search for ${
        mode === "Professor" ? "professors" : "universities"
      }.`;

  if (!fieldDomains) {
    return (
      <div className="bg-sky-50 min-h-screen" data-api-loaded="false">
        {/* 👈 Added: floating navbar for the loading page */}
        <div className="absolute top-0 left-0 w-full z-50">
          <Navbar />
        </div>
        <div className="container mx-auto py-24 text-center space-y-4 pt-32">
          {metadataLoading ? (
            <p className="text-base text-gray-600">Loading filters…</p>
          ) : (
            <>
              <p className="text-base text-red-600">
                Unable to load filter metadata
                {metadataError ? `: ${metadataError}` : "."}
              </p>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-(--secondary-400) px-4 py-2 text-white shadow"
                onClick={() => {
                  void loadMetadata();
                }}
              >
                Retry
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 👈 Added: Absolute container for the navbar */}
      <div className="absolute top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <SearchHero
        fieldDomains={fieldDomains}
        mode={mode}
        onModeChange={setMode}
        sortOptionsByMode={sortOptionsByMode}
        pendingProfessorFilters={pendingProfessorFilters}
        onPendingProfessorFiltersConsumed={() =>
          setPendingProfessorFilters(null)
        }
        onSearchRequest={handleSearchRequest}
      />
      <div className="container mx-auto pb-8">
        { isModeLoading? (
          <div className="flex justify-center py-16">
            <p className="text-base text-gray-600 animate-pulse">
              Fetching{" "}
              {mode === "Professor" ? "professors" : "universities"}...
            </p>
          </div>
        ) : mode === "Professor" ? (
          professorResults.length > 0 ? (
            <ProfessorGrid professors={professorResults} />
          ) : (
            <div className="flex justify-center py-16">
              <p className="text-base text-gray-600 text-center max-w-2xl">
                {emptyStateMessage}
              </p>
            </div>
          )
        ) : universityResults.length > 0 ? (
          <UniversityGrid
            universities={universityResults}
            onShowProfessors={handleProfessorRedirect}
          />
        ) : (
          <div className="flex justify-center py-16">
            <p className="text-base text-gray-600 text-center max-w-2xl">
              {emptyStateMessage}
            </p>
          </div>
        )}
        {currentResults.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <PaginationDots
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
        {searchError && (
          <div className="flex justify-center mt-4">
            <p className="text-sm text-red-600 text-center max-w-2xl">
              Unable to fetch fresh results: {searchError}
            </p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SearchAndFilterPage;

const normalizeSortOptions = (
  options: Array<{ value?: string; label?: string; defaultDir?: string }> | undefined,
  fallback: SortOption[]
): SortOption[] => {
  if (!options || options.length === 0) return fallback;
  const seen = new Set<string>();
  const normalized: SortOption[] = [];
  options.forEach((option) => {
    const value = option?.value?.trim() ?? "";
    const derivedLabel = value
      ? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "";
    const label = option?.label?.trim() ?? derivedLabel;
    if (!value || !label || seen.has(value)) return;
    normalized.push({
      label,
      value,
      defaultDir: option?.defaultDir === "desc" ? "desc" : "asc",
    });
    seen.add(value);
  });
  return normalized.length > 0 ? normalized : fallback;
};

const convertSortOptions = (
  source?: SearchFiltersMetadataResponse["sortOptions"]
): Record<Mode, SortOption[]> => ({
  Professor: normalizeSortOptions(
    source?.professors,
    DEFAULT_SORT_OPTIONS.Professor
  ),
  University: normalizeSortOptions(
    source?.universities,
    DEFAULT_SORT_OPTIONS.University
  ),
});