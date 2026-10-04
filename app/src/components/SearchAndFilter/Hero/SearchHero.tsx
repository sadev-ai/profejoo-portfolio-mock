import React, {
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
  useEffect,
} from "react";
import SearchModeTabs from "@/components/SearchAndFilter/Hero/SearchModeTabs";
import SearchForm, { type SearchFormHandle } from "@/components/SearchAndFilter/Hero/SearchForm";
import OrderBy from "@/components/SearchAndFilter/Hero/OrderBy";
import BackgroundImage from "@/components/SearchAndFilter/Hero/BackgroundImage";
import { publicAsset } from "@/lib/publicAsset";

export interface FieldDomains {
  qsRanking: [number, number];
  hIndex: [number, number];
  citation: [number, number];
  universityNames: string[];
  subjects: string[];
  countries: string[];
}

type Mode = "University" | "Professor";

export type SortOption = {
  label: string;
  value: string;
  defaultDir: "asc" | "desc";
};

export type SearchRequestPayload = {
  mode: Mode;
  orderBy: string;
  orderDir?: "asc" | "desc";
  filters: Record<string, unknown>;
};

export type ProfessorSelection = {
  university: string;
  country: string;
  subject: string;
};

interface SearchHeroProps {
  fieldDomains: FieldDomains;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  sortOptionsByMode: Record<Mode, SortOption[]>;
  pendingProfessorFilters?: ProfessorSelection | null;
  onPendingProfessorFiltersConsumed?: () => void;
  onSearchRequest?: (
    payload: SearchRequestPayload,
    options?: { resetPage?: boolean }
  ) => void;
}

const SearchHero: React.FC<SearchHeroProps> = ({
  fieldDomains,
  mode,
  onModeChange,
  sortOptionsByMode,
  pendingProfessorFilters,
  onPendingProfessorFiltersConsumed,
  onSearchRequest,
}) => {
  const fallbackSortOption: SortOption = {
    label: "Alphabetical",
    value: "alphabet",
    defaultDir: "asc",
  };
  const initialSortLabel =
    sortOptionsByMode[mode]?.[0]?.label ?? fallbackSortOption.label;
  const [orderBy, setOrderBy] = useState<string>(initialSortLabel);
  const [currentFilters, setCurrentFilters] = useState<Record<string, unknown>>(
    {}
  );

  const tabsRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<SearchFormHandle>(null);
  const [offset, setOffset] = useState(0);

  useLayoutEffect(() => {
    const calcOffset = () => {
      const tabsHeight = tabsRef.current?.offsetHeight ?? 0;
      const formHeight = formContainerRef.current?.offsetHeight ?? 0;
      const screenWidth = window.innerWidth;
      const overlapFactor = screenWidth < 768 ? 0.35 : 0.5;
      setOffset(tabsHeight + formHeight * overlapFactor);
    };

    calcOffset();
    window.addEventListener("resize", calcOffset);
    return () => window.removeEventListener("resize", calcOffset);
  }, []);

  const orderOptions = sortOptionsByMode[mode] ?? [];

  useEffect(() => {
    setOrderBy(orderOptions[0]?.label ?? fallbackSortOption.label);
  }, [mode]);

  useEffect(() => {
    const labels = orderOptions.map((option) => option.label);
    if (!labels.includes(orderBy)) {
      setOrderBy(orderOptions[0]?.label ?? fallbackSortOption.label);
    }
  }, [orderOptions, orderBy]);

  const emitSearch = useCallback(
    (
      filters: Record<string, unknown>,
      targetMode: Mode = mode,
      targetOrderBy: string = orderBy,
      options?: { resetPage?: boolean }
    ) => {
      const availableOptions = sortOptionsByMode[targetMode] ?? [];
      const resolvedOption =
        availableOptions.find((option) => option.label === targetOrderBy) ??
        availableOptions[0] ??
        fallbackSortOption;
      onSearchRequest?.(
        {
          mode: targetMode,
          orderBy: resolvedOption.value,
          orderDir: resolvedOption.defaultDir,
          filters,
        },
        options
      );
    },
    [mode, orderBy, sortOptionsByMode, onSearchRequest]
  );

  const handleSearchSubmit = useCallback(
    (values: Record<string, unknown>) => {
      setCurrentFilters(values);
      emitSearch(values, mode, orderBy, { resetPage: true });
    },
    [emitSearch, mode, orderBy]
  );

  const handleOrderByChange = (value: string) => {
    setOrderBy(value);
    emitSearch(currentFilters, mode, value, { resetPage: true });
  };

  const handleFiltersChange = useCallback(
    (updatedMode: Mode, values: Record<string, unknown>) => {
      if (updatedMode === mode) {
        setCurrentFilters(values);
      }
    },
    [mode]
  );

  useEffect(() => {
    if (!pendingProfessorFilters || mode !== "Professor") return;
    const nextValues = formRef.current?.setModeValues("Professor", {
      universities: [pendingProfessorFilters.university],
      countries: [pendingProfessorFilters.country],
      subjects: pendingProfessorFilters.subject === "General Studies" ? [] : [pendingProfessorFilters.subject],
      name: "",
      hIndex: [...fieldDomains.hIndex] as [number, number],
      citation: [...fieldDomains.citation] as [number, number],
    });
    if (nextValues) {
      setCurrentFilters(nextValues);
      emitSearch(nextValues, "Professor", orderBy, { resetPage: true });
    }
    onPendingProfessorFiltersConsumed?.();
  }, [
    pendingProfessorFilters,
    mode,
    fieldDomains.hIndex,
    fieldDomains.citation,
    orderBy,
    emitSearch,
    onPendingProfessorFiltersConsumed,
  ]);

  return (
    <section className="relative w-full overflow-visible">
      
      {/* 🔹 Background image container (Absolute) */}
      <div className="absolute top-0 left-0 w-full h-[60vh] z-0">
        <BackgroundImage src={publicAsset("assets/images/SnF-bg.png")} />
      </div>

      {/* 🔹 Spacer tag: this invisible div holds the image's place in the page so nothing gets thrown off */}
      <div className="w-full h-[60vh] pointer-events-none" aria-hidden="true" />

      {/* --- Tabs + Form Wrapper --- */}
      {/* 👈 Added: pt-24 class to create spacing from the top of the page (keeps it from going under the navbar) */}
      <div
        className="relative z-10 flex flex-col items-center w-full px-4" 
        style={{
          marginTop: offset ? `-${offset}px` : undefined,
        }}
      >
        {/* Tabs */}
        <div ref={tabsRef} className="w-full flex justify-center">
          <SearchModeTabs activeMode={mode} onModeChange={onModeChange} />
        </div>

        {/* SearchForm */}
        <div ref={formContainerRef} className="w-full max-w-6xl">
          <SearchForm
            ref={formRef}
            mode={mode}
            fieldDomains={fieldDomains}
            onSubmit={handleSearchSubmit}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        {/* OrderBy */}
        <div className="w-full max-w-6xl mt-6" id="snf-orderby-anchor">
          <OrderBy
            options={orderOptions.map((option) => option.label)}
            selected={orderBy}
            mode={mode}
            onChange={handleOrderByChange}
          />
        </div>
      </div>
    </section>
  );
};

export default SearchHero;