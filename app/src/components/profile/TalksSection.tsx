// src/components/profile/TalksSection.tsx
import OutputTypeSection, { type OutputTypeSectionConfig } from "@/components/profile/OutputTypeSection";
import type { Counts } from "@/lib/profileCompleteness";

const config: OutputTypeSectionConfig = {
  type: "talk",
  countKey: "talks",
  sectionId: "talks",
  title: "Talks",
  singular: "Talk",
  pluralLower: "talks",
};

export default function TalksSection({
  attachRef,
  onCountsChange,
}: {
  attachRef: (el: HTMLElement | null) => void;
  onCountsChange?: (u: Partial<Counts>) => void;
}) {
  return <OutputTypeSection attachRef={attachRef} onCountsChange={onCountsChange} config={config} />;
}
