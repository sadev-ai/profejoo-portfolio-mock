// src/components/dashboard/DashboardCard.tsx
import * as React from "react";

type DashboardCardProps = {
  title?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function DashboardCard({
  title,
  actionLabel,
  onActionClick,
  headerRight,
  children,
  className,
}: DashboardCardProps) {
  return (
    <section
      className={`bg-card border border-border rounded-2xl shadow-sm px-4 py-3 md:px-5 md:py-4 ${className ?? ""}`}
    >
      {(title || actionLabel || headerRight) && (
        <header className="mb-3 flex items-center justify-between gap-2">
          {title ? (
            <h2 className="fnt-h5 text-primary-400">{title}</h2>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-3 text-xs md:text-sm">
            {headerRight}
            {actionLabel && (
              <button
                type="button"
                onClick={onActionClick}
                className="btn btn--link btn--sm"
              >
                {actionLabel}
              </button>
            )}
          </div>
        </header>
      )}

      {children}
    </section>
  );
}
