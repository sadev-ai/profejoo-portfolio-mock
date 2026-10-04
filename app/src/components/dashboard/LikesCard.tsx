// src/components/dashboard/LikesCard.tsx
import * as React from "react";
import { Heart } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { Badge } from "@/components/ui/badge";

export type LikeItem = {
  id: string;
  title: string;
  subtitle: string;
  chips: string[];
  kind: "professor" | "university";
};

type LikeRowProps = {
  item: LikeItem;
  liked: boolean;
  onToggleLike: () => void;
};

function LikeRow({ item, liked, onToggleLike }: LikeRowProps) {
  return (
    <div
      className="
        flex items-center gap-3
        rounded-3xl bg-secondary-50
        px-4 py-3
        shadow-[0_12px_30px_rgba(15,23,42,0.08)]
      "
    >
      {/* Round avatar – you can add a photo later */}
      <div
        className="
          flex h-14 w-14 shrink-0 items-center justify-center
          overflow-hidden rounded-full
          bg-tertiary-400 text-sm font-bold text-white
        "
      >
        {item.kind === "professor" ? "P" : "U"}
      </div>

      {/* Text and chips */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-primary-400 truncate">
          {item.title}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {item.subtitle}
        </p>

        <div className="mt-1 flex flex-wrap gap-1.5">
          {item.chips.map((chip) => {
            const isUniversity = chip.toLowerCase() === "university";
            const isProfessor = chip.toLowerCase() === "professor";

            // University → accent (orange), Professor → secondary (blue)
            const colorClass = isUniversity
              ? "profejoo-bg-accent"
              : isProfessor
              ? "profejoo-bg-secondary"
              : "profejoo-bg-secondary";

            return (
              <Badge
                key={chip}
                variant="secondary"
                className={`
                  border-0
                  rounded-md px-3 py-1
                  text-[11px] font-semibold leading-none
                  ${colorClass}
                `}
              >
                {chip}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Like button – orange from the accent palette */}
      <button
        type="button"
        onClick={onToggleLike}
        className="btn btn--ghost btn--sm rounded-full p-2"
        aria-pressed={liked}
        aria-label={liked ? "Remove from likes" : "Add to likes"}
      >
        <Heart
          className="h-5 w-5"
          style={{ color: "var(--profejoo-accent)" }}
          fill={liked ? "currentColor" : "none"}
        />
      </button>
    </div>
  );
}

export function LikesCard({ items }: { items: LikeItem[] }) {
  // Assumption: all items start out liked
  const [likedIds, setLikedIds] = React.useState<Set<string>>(
    () => new Set(items.map((i) => i.id))
  );

  const toggleLike = React.useCallback((id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <DashboardCard
      title="Your New Likes"
      actionLabel="View all"
      className="h-full"
    >
      <div className="space-y-3">
        {items.map((l) => (
          <LikeRow
            key={l.id}
            item={l}
            liked={likedIds.has(l.id)}
            onToggleLike={() => toggleLike(l.id)}
          />
        ))}
      </div>
    </DashboardCard>
  );
}
