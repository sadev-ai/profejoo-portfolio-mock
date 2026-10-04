// src/components/profile/SectionTitle.tsx
import * as React from "react";
import { Badge } from "@/components/ui/badge";

type Props = { title: string; count?: number };

/** Compact section header that matches the Profejoo theme. */
export default function SectionTitle({ title, count }: Props) {
  return (
    <div className="profejoo flex items-center gap-3">
      <h3 className="profejoo-h3 text-foreground">{title}</h3>
      {typeof count === "number" && (
        <Badge
          variant="secondary"
          className="text-[var(--secondary-400)] bg-[var(--secondary-50)] "
          aria-label={`${count} items`}
        >
          {count}
        </Badge>
      )}
    </div>
  );
}
