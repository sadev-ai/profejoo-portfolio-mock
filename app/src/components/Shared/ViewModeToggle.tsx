// src/components/shared/ViewModeToggle.tsx
//
// Shared implementation behind components/resumes/ViewModeToggle.tsx and
// components/emailsop/ViewModeToggle.tsx, which were otherwise identical
// aside from the table-view icon (List vs Rows) and the radiogroup
// aria-label. Each of those files is now a thin wrapper.
import type { LucideIcon } from "lucide-react";
import { LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ViewMode = "cards" | "table";

type Props = {
  viewMode: ViewMode;
  onChange: (m: ViewMode) => void;
  groupAriaLabel: string;
  TableIcon: LucideIcon;
};

export default function ViewModeToggle({
  viewMode,
  onChange,
  groupAriaLabel,
  TableIcon,
}: Props) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border bg-muted/40 p-1"
      role="radiogroup"
      aria-label={groupAriaLabel}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        role="radio"
        aria-label="Cards view"
        aria-checked={viewMode === "cards"}
        onClick={() => onChange("cards")}
        className={cn(
          "h-8 w-8 rounded-full border border-transparent text-muted-foreground transition-all",
          "hover:text-foreground",
          viewMode === "cards" &&
            "border-border bg-background text-foreground shadow-sm"
        )}
      >
        <LayoutGrid className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        role="radio"
        aria-label="Table view"
        aria-checked={viewMode === "table"}
        onClick={() => onChange("table")}
        className={cn(
          "h-8 w-8 rounded-full border border-transparent text-muted-foreground transition-all",
          "hover:text-foreground",
          viewMode === "table" &&
            "border-border bg-background text-foreground shadow-sm"
        )}
      >
        <TableIcon className="size-4" />
      </Button>
    </div>
  );
}
