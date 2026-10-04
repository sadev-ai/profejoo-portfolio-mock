// src/components/profile/HonorsSection.tsx
import OutputTypeSection, { type OutputTypeSectionConfig } from "@/components/profile/OutputTypeSection";
import type { Counts } from "@/lib/profileCompleteness";

const config: OutputTypeSectionConfig = {
  type: "honor_and_award",
  countKey: "honors",
  sectionId: "honors",
  title: "Honors & Awards",
  singular: "Honor",
  pluralLower: "honors or awards",
};

export default function HonorsSection({
  attachRef,
  onCountsChange,
}: {
  attachRef: (el: HTMLElement | null) => void;
  onCountsChange?: (u: Partial<Counts>) => void;
}) {
  return <OutputTypeSection attachRef={attachRef} onCountsChange={onCountsChange} config={config} />;
}
