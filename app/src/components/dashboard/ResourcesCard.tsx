// src/components/dashboard/ResourcesCard.tsx
import * as React from "react";
import { Bot, FileText, Search, BookOpen } from "lucide-react";
import { DashboardCard } from "./DashboardCard";

export type ResourceItem = {
  id: string;
  title: string;
  description: string;
  variant: "primary" | "secondary" | "tertiary" | "accent";
  url?: string;
};

const iconByVariant: Record<ResourceItem["variant"], React.ReactNode> = {
  primary: <Bot className="h-6 w-6" />,
  secondary: <FileText className="h-6 w-6" />,
  tertiary: <Search className="h-6 w-6" />,
  accent: <BookOpen className="h-6 w-6" />,
};

// Background class for the icon block (from the Profejoo palette)
const iconBgClassByVariant: Record<ResourceItem["variant"], string> = {
  primary: "profejoo-bg-primary",
  secondary: "profejoo-bg-secondary",
  tertiary: "profejoo-bg-tertiary",
  accent: "profejoo-bg-accent",
};

// Border color (also from the design tokens)
const borderColorByVariant: Record<ResourceItem["variant"], string> = {
  primary: "var(--profejoo-primary)",
  secondary: "var(--profejoo-secondary)",
  tertiary: "var(--profejoo-tertiary)",
  accent: "var(--profejoo-accent)",
};

function ResourceRow({ item }: { item: ResourceItem }) {
  const borderColor = borderColorByVariant[item.variant];
  const iconBgClass = iconBgClassByVariant[item.variant];

  const Component = item.url ? 'a' : 'div';
  const linkProps = item.url ? { href: item.url } : {};

  return (
    <Component {...linkProps} className="group w-full block">
      <div
        className="
          flex items-stretch
          rounded-3xl overflow-hidden
          bg-background
          shadow-[0_12px_30px_rgba(15,23,42,0.08)]
          border
          transition-all duration-200
          group-hover:bg-secondary/10
          group-hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]
          group-hover:scale-[1.02]
          cursor-pointer
        "
        style={{ borderColor }}
      >
        {/* Colored icon block on the left */}
        <div
          className={`
            ${iconBgClass}
            flex w-14 items-center justify-center
            text-white
          `}
        >
          {iconByVariant[item.variant]}
        </div>

        {/* Text */}
        <div className="flex flex-1 flex-col justify-center gap-1 px-4 py-3">
          <span className="text-sm font-semibold text-foreground">
            {item.title}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {item.description}
          </span>
        </div>
      </div>
    </Component>
  );
}

export function ResourcesCard({ items }: { items: ResourceItem[] }) {
  return (
    <DashboardCard title="Resources" className="h-full">
      <div className="space-y-3">
        {items.map((r) => (
          <ResourceRow key={r.id} item={r} />
        ))}
      </div>

    </DashboardCard>
  );
}
