// src/components/dashboard/common.tsx
// src/components/dashboard/common.tsx
import * as React from "react";

type TagPillProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent";
};

export function TagPill({ children, variant = "primary" }: TagPillProps) {
  const base =
    "inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold";
  const variantClass =
    variant === "primary"
      ? "tag-pill-primary"
      : variant === "secondary"
      ? "tag-pill-secondary"
      : "tag-pill-accent";

  return <span className={`${base} ${variantClass}`}>{children}</span>;
}


export function MutedLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </span>
  );
}
