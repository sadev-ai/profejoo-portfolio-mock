import React from "react";
import { TabsTrigger } from "@/components/ui/tabs";
import type { SectionKey } from "@/hooks/useScrollSpy";
import type { LucideIcon } from "lucide-react";

export default function TabBtn({
  value,
  label,
  count,
  nodeRef,
  Icon,
}: {
  value: SectionKey | string;
  label: string;
  count?: number;
  nodeRef?: (el: HTMLButtonElement | null) => void;
  /** Icon for the tab */
  Icon: LucideIcon;
}) {
  return (
    <TabsTrigger
      ref={nodeRef}
      value={value}
      aria-label={label}
      title={label}
      className="
        group shrink-0 rounded-full
        text-sm font-medium
        text-muted-foreground hover:text-foreground
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-ring
        focus-visible:ring-offset-2 focus-visible:ring-offset-background
        data-[state=active]:bg-background
        data-[state=active]:text-foreground
        data-[state=active]:shadow-sm
        /* Icon-only size on mobile/tablet */
        w-10 h-10 p-0 flex items-center justify-center
        /* On desktop, the text is shown too */
        lg:w-auto lg:h-auto lg:px-4 lg:py-2.5
        whitespace-nowrap
        transition-colors duration-200
      "
    >
      <span className="flex items-center gap-2">
        <Icon className="size-4" aria-hidden />
        {/* Text and counter only from lg breakpoint up */}
        <span className="hidden lg:inline">{label}</span>
        {typeof count === "number" && (
          <span
            className="
              hidden lg:inline
              min-w-5 text-center rounded-full px-1.5 py-0.5
              text-[10px] leading-none font-semibold
              bg-secondary-50 text-secondary-400
            "
          >
            {count}
          </span>
        )}
      </span>
    </TabsTrigger>
  );
}
