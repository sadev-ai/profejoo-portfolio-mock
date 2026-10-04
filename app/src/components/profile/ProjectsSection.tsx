// src/components/profile/ProjectsSection.tsx
import OutputTypeSection, { type OutputTypeSectionConfig } from "@/components/profile/OutputTypeSection";
import type { Counts } from "@/lib/profileCompleteness";

const config: OutputTypeSectionConfig = {
  type: "project",
  countKey: "projects",
  sectionId: "projects",
  title: "Projects",
  singular: "Project",
  pluralLower: "projects",
};

export default function ProjectsSection({
  attachRef,
  onCountsChange,
}: {
  attachRef: (el: HTMLElement | null) => void;
  onCountsChange?: (u: Partial<Counts>) => void;
}) {
  return <OutputTypeSection attachRef={attachRef} onCountsChange={onCountsChange} config={config} />;
}
