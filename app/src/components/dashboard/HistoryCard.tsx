// src/components/dashboard/HistoryCard.tsx
import * as React from "react";
import { FileText, Search, ArrowUpRight, DollarSign } from "lucide-react";
import { DashboardCard } from "./DashboardCard";

export type HistoryItem = {
  id: string;
  title: string;
  type: "document" | "search" | "profile" | "payment";
  timeAgo: string;
  /** Optional override for the subtitle line; falls back to a generic label per `type` when omitted. */
  subtitle?: string;
};

function iconForType(t: HistoryItem["type"]) {
  switch (t) {
    case "document":
      return <FileText className="h-4 w-4" />;
    case "search":
      return <Search className="h-4 w-4" />;
    case "profile":
      return <ArrowUpRight className="h-4 w-4" />;
    case "payment":
      return <DollarSign className="h-4 w-4" />;
    default:
      return null;
  }
}

function HistoryRow({ item }: { item: HistoryItem }) {
  return (
    <div
      className="
        flex items-stretch w-full
        rounded-[14px] overflow-hidden
        profejoo-border-primary
        text-xs md:text-sm
      "
    >
      {/* Text section (left) */}
      <div className="flex-1 px-4 py-3 flex flex-col justify-center gap-0.5">
        <p className="text-[15px] font-semibold text-foreground leading-tight">
          {item.title}
        </p>
        <p className="text-[13px] text-muted-foreground leading-tight">
          {item.subtitle ?? (
            <>
              {item.type === "document" && "CV Make"}
              {item.type === "search" && "Professor Search"}
              {item.type === "profile" && "Profile Upgrade"}
              {item.type === "payment" && "Professor Search"}
            </>
          )}
        </p>
      </div>

      {/* Middle icon */}
      <div
        className="
          flex items-center justify-center
          px-4
          border-l border-[color:var(--profejoo-primary)]
          text-[color:var(--profejoo-primary)]
        "
      >
        {iconForType(item.type)}
      </div>

      {/* Time (right), without a separate background */}
      <div
        className="
          flex items-center justify-center
          px-4 min-w-[70px]
          border-l border-[color:var(--profejoo-primary)]
          text-[11px] text-muted-foreground
        "
      >
        {item.timeAgo}
      </div>
    </div>
  );
}

export function HistoryCard({ items }: { items: HistoryItem[] }) {
  return (
    <DashboardCard title="History" actionLabel="View all">
      <div className="space-y-3">
        {items.map((h) => (
          <HistoryRow key={h.id} item={h} />
        ))}
      </div>
    </DashboardCard>
  );
}
