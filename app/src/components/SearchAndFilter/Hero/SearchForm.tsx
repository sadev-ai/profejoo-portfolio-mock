import React, { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import MultiSelectComboBox from "@/components/SearchAndFilter/Hero/MultiSelectComboBox";
import RangeSlider from "@/components/SearchAndFilter/Hero/RangeSlider";
import SubmitButton from "@/components/SearchAndFilter/Hero/SubmitButton";
import TextInputField from "@/components/SearchAndFilter/Hero/TextInputField";
import { type FieldDomains } from "@/components/SearchAndFilter/Hero/SearchHero";

type Mode = "University" | "Professor";

type UniversityFormState = {
  universityNames: string[];
  subjects: string[];
  countries: string[];
  qsRanking: [number, number];
};

type ProfessorFormState = {
  name: string;
  universities: string[];
  subjects: string[];
  countries: string[];
  hIndex: [number, number];
  citation: [number, number];
};

type FormState = {
  University: UniversityFormState;
  Professor: ProfessorFormState;
};

const cloneTuple = (tuple: [number, number]): [number, number] => [
  tuple[0],
  tuple[1],
];

const createInitialState = (domains: FieldDomains): FormState => ({
  University: {
    universityNames: [],
    subjects: [],
    countries: [],
    qsRanking: cloneTuple(domains.qsRanking),
  },
  Professor: {
    name: "",
    universities: [],
    subjects: [],
    countries: [],
    hIndex: cloneTuple(domains.hIndex),
    citation: cloneTuple(domains.citation),
  },
});

export type SearchFormHandle = {
  setModeValues: <M extends Mode>(
    targetMode: M,
    values: Partial<FormState[M]>
  ) => FormState[M];
};

interface SearchFormProps {
  mode: Mode;
  fieldDomains: FieldDomains;
  onSubmit: (values: Record<string, unknown>) => void;
  onFiltersChange?: (mode: Mode, values: Record<string, unknown>) => void;
}

const SearchForm = forwardRef<SearchFormHandle, SearchFormProps>(
  ({ mode, fieldDomains, onSubmit, onFiltersChange }, ref) => {
  const [formStateByMode, setFormStateByMode] = useState<FormState>(() =>
    createInitialState(fieldDomains)
  );

  const isUniversity = mode === "University";
  const universityState = formStateByMode.University;
  const professorState = formStateByMode.Professor;
  const activeModeState = formStateByMode[mode];

  const updateModeState = <M extends Mode, K extends keyof FormState[M]>(
    targetMode: M,
    key: K,
    value: FormState[M][K]
  ) => {
    setFormStateByMode((prev) => ({
      ...prev,
      [targetMode]: {
        ...prev[targetMode],
        [key]: value,
      },
    }));
  };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(activeModeState);
    };

    useEffect(() => {
      onFiltersChange?.(mode, activeModeState);
    }, [mode, activeModeState, onFiltersChange]);

    useImperativeHandle(
      ref,
      () => ({
        setModeValues: <M extends Mode>(
          targetMode: M,
          values: Partial<FormState[M]>
        ) => {
          let nextModeState: FormState[M] | null = null;
          setFormStateByMode((prev) => {
            const merged = {
              ...prev[targetMode],
              ...values,
            } as FormState[M];
            nextModeState = merged;
            return {
              ...prev,
              [targetMode]: merged,
            };
          });
          return (
            nextModeState ??
            (formStateByMode[targetMode] as FormState[M])
          );
        },
      }),
      [formStateByMode]
    );

  const gridClassName = isUniversity
    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
    : "grid grid-cols-1 md:grid-cols-3 gap-6";

    return (
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl mx-auto bg-(--better-white) rounded-2xl shadow p-6"
      >
      <div className="space-y-6">
        <div className={gridClassName}>
          {isUniversity ? /* University Mode */ (
            <>
              <MultiSelectComboBox
                titleText="Country"
                options={fieldDomains.countries}
                value={universityState.countries}
                onChange={(v) => updateModeState("University", "countries", v)}
              />
              <MultiSelectComboBox
                titleText="Subject"
                options={fieldDomains.subjects}
                value={universityState.subjects}
                onChange={(v) => updateModeState("University", "subjects", v)}
              />
              <RangeSlider
                titleText="QS Ranking"
                min={fieldDomains.qsRanking[0]}
                max={fieldDomains.qsRanking[1]}
                value={universityState.qsRanking}
                defaultValue={fieldDomains.qsRanking}
                onChange={(range) =>
                  updateModeState("University", "qsRanking", [
                    range.min,
                    range.max,
                  ])
                }
              />
              <MultiSelectComboBox
                titleText="University Name"
                options={fieldDomains.universityNames}
                value={universityState.universityNames}
                onChange={(v) =>
                  updateModeState("University", "universityNames", v)
                }
              />
            </>
          ) : /* Professor Mode */ (
            <>
              <MultiSelectComboBox
                titleText="Country"
                options={fieldDomains.countries}
                value={professorState.countries}
                onChange={(v) => updateModeState("Professor", "countries", v)}
              />
              <MultiSelectComboBox
                titleText="University"
                options={fieldDomains.universityNames}
                value={professorState.universities}
                onChange={(v) => updateModeState("Professor", "universities", v)}
              />
              <MultiSelectComboBox
                titleText="Subject"
                options={fieldDomains.subjects}
                value={professorState.subjects}
                onChange={(v) => updateModeState("Professor", "subjects", v)}
              />
              
              <RangeSlider
                titleText="h-index"
                min={fieldDomains.hIndex[0]}
                max={fieldDomains.hIndex[1]}
                value={professorState.hIndex}
                defaultValue={fieldDomains.hIndex}
                onChange={(range) =>
                  updateModeState("Professor", "hIndex", [
                    range.min,
                    range.max,
                  ])
                }
              />
              <RangeSlider
                titleText="Citations"
                min={fieldDomains.citation[0]}
                max={fieldDomains.citation[1]}
                step={(fieldDomains.citation[1] - fieldDomains.citation[0]) / 1000}
                value={professorState.citation}
                defaultValue={fieldDomains.citation}
                onChange={(range) =>
                  updateModeState("Professor", "citation", [
                    range.min,
                    range.max,
                  ])
                }
              />
              <TextInputField
                titleText="Name"
                value={professorState.name}
                onChange={(value) => updateModeState("Professor", "name", value)}
                placeholder="Enter professor name"
                maxLength={50}
              />
            </>
          )}
        </div>

        <div className="flex justify-center">
          <div className="w-full md:w-1/3 flex justify-center">
            <SubmitButton label="Search" fullWidth />
          </div>
        </div>
      </div>
    </form>
  );
});

SearchForm.displayName = "SearchForm";
export default SearchForm;
