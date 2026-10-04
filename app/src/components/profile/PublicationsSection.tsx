// src/components/profile/PublicationsSection.tsx
import OutputTypeSection, { type OutputTypeSectionConfig } from "@/components/profile/OutputTypeSection";
import type { Counts } from "@/lib/profileCompleteness";

const config: OutputTypeSectionConfig = {
  type: "publication",
  countKey: "publications",
  sectionId: "publications",
  title: "Publications",
  singular: "Paper",
  pluralLower: "publications",
};

export default function PublicationsSection({
  attachRef,
  onCountsChange,
}: {
  attachRef: (el: HTMLElement | null) => void;
  onCountsChange?: (u: Partial<Counts>) => void;
}) {
  return <OutputTypeSection attachRef={attachRef} onCountsChange={onCountsChange} config={config} />;
}
