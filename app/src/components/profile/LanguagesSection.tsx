// src/components/profile/LanguagesSection.tsx
import SimpleListSection, { type SimpleListSectionConfig } from "@/components/profile/SimpleListSection";
import LanguageForm from "@/components/profile/LanguageForm";
import type { Counts } from "@/lib/profileCompleteness";

const config: SimpleListSectionConfig = {
  field: "languages",
  countKey: "languages",
  sectionId: "languages",
  title: "Languages",
  singular: "Language",
  FormComponent: LanguageForm,
};

export default function LanguagesSection({
  attachRef,
  onCountsChange,
}: {
  attachRef: (el: HTMLElement | null) => void;
  onCountsChange?: (u: Partial<Counts>) => void;
}) {
  return <SimpleListSection attachRef={attachRef} onCountsChange={onCountsChange} config={config} />;
}
