// src/components/profile/InterestsSection.tsx
import SimpleListSection, { type SimpleListSectionConfig } from "@/components/profile/SimpleListSection";
import InterestForm from "@/components/profile/InterestForm";
import type { Counts } from "@/lib/profileCompleteness";

const config: SimpleListSectionConfig = {
  field: "interests",
  countKey: "interests",
  sectionId: "interests",
  title: "Interests",
  singular: "Interest",
  FormComponent: InterestForm,
};

export default function InterestsSection({
  attachRef,
  onCountsChange,
}: {
  attachRef: (el: HTMLElement | null) => void;
  onCountsChange?: (u: Partial<Counts>) => void;
}) {
  return <SimpleListSection attachRef={attachRef} onCountsChange={onCountsChange} config={config} />;
}
