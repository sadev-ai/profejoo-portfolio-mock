// src/components/resumes/ViewModeToggle.tsx
import { List } from "lucide-react";
import SharedViewModeToggle from "@/components/Shared/ViewModeToggle";
import type { ViewMode } from "./Resumes";

type Props = {
  viewMode: ViewMode;
  onChange: (m: ViewMode) => void;
};

export default function ViewModeToggle({ viewMode, onChange }: Props) {
  return (
    <SharedViewModeToggle
      viewMode={viewMode}
      onChange={onChange}
      groupAriaLabel="Change resumes view mode"
      TableIcon={List}
    />
  );
}
