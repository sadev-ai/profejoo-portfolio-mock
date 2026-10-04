// src/components/emailsop/ViewModeToggle.tsx
import { Rows } from "lucide-react";
import SharedViewModeToggle from "@/components/Shared/ViewModeToggle";
import type { ViewMode } from "./EmailSOPs";

type Props = {
  viewMode: ViewMode;
  onChange: (m: ViewMode) => void;
};

export default function ViewModeToggle({ viewMode, onChange }: Props) {
  return (
    <SharedViewModeToggle
      viewMode={viewMode}
      onChange={onChange}
      groupAriaLabel="Change view mode"
      TableIcon={Rows}
    />
  );
}
