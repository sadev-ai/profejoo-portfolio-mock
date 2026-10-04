// src/components/shared/StatusBadge.tsx
//
// Shared implementation behind components/resumes/ResumeStatusBadge.tsx
// and components/emailsop/EmailSOPStatusBadge.tsx, which were otherwise
// identical -- both ResumeStatus and EmailSOPStatus are the same
// "published" | "draft" union. Each of those files is now a thin wrapper
// so existing imports of either name keep working.
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ItemStatus = "published" | "draft";

type Meta = {
  label: string;
  className: string;
  dotClassName: string;
};

const STATUS_META: Record<ItemStatus, Meta> = {
  published: {
    label: "Published",
    className: "profejoo-border-secondary",
    dotClassName: "profejoo-bg-secondary",
  },
  draft: {
    label: "Draft",
    className: "profejoo-border-accent",
    dotClassName: "profejoo-bg-accent",
  },
};

// Fallback for the future, in case a new status is added before its style is.
const DEFAULT_META: Meta = {
  label: "Unknown",
  className:
    "bg-muted text-muted-foreground border-border " +
    "dark:bg-muted/30 dark:text-muted-foreground dark:border-border",
  dotClassName: "bg-muted-foreground/60",
};

type Props = {
  status: ItemStatus;
};

export default function StatusBadge({ status }: Props) {
  const meta = STATUS_META[status] ?? DEFAULT_META;

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        "text-[11px] font-medium leading-none whitespace-nowrap",
        meta.className
      )}
    >
      <span
        className={cn(
          "inline-block h-1.5 w-1.5 rounded-full",
          meta.dotClassName
        )}
      />
      {meta.label}
    </Badge>
  );
}
