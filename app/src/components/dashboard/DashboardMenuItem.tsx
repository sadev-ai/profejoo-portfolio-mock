// src/components/dashboard/DashboardMenuItem.tsx
import { useId, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import type { IconType } from "react-icons";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";
import "@/index.css";

type Child = {
  label: string;
  to: string;
  icon?: IconType;
};

type Count = number | { value: number; variant?: "neutral" | "red" };

export type DashboardMenuItemProps = {
  label: string;
  icon: IconType;
  to?: string;
  active?: boolean;
  disabled?: boolean;
  count?: Count;
  childrenItems?: Child[];
  expanded?: boolean;
  onToggle?: (next: boolean) => void;
  onClick?: () => void;
  className?: string;
  childrenPlacement?: "below" | "above";
  layout?: "vertical" | "horizontal";
  hideText?: boolean;
  dropdownAlign?: "left" | "right";
};

export default function DashboardMenuItem({
  label,
  icon: Icon,
  to,
  active = false,
  disabled = false,
  count,
  childrenItems,
  expanded = false,
  onToggle,
  onClick,
  className = "",
  childrenPlacement = "below",
  layout = "vertical",
  hideText = false,
  dropdownAlign = "right",
}: DashboardMenuItemProps) {
  const hasChildren = !!childrenItems?.length;
  const id = useId();
  const { pathname } = useLocation();
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  const badge =
    typeof count === "number"
      ? { value: count, variant: "neutral" as const }
      : count;

  const shouldHover = !active && !expanded;
  const showText = !hideText;

  const baseWidth = layout === "vertical" ? "w-full" : "w-auto";
  const base = `relative group flex ${baseWidth} items-center justify-between gap-3 rounded-2xl px-3 py-3 my-0.5 text-sm transition-colors outline-none border border-transparent`;

  const hoverPart = shouldHover
    ? " hover:bg-[var(--secondary-50)] hover:text-[var(--secondary-400)]"
    : "";

  const expandedFrame = expanded
    ? " text-[var(--secondary-400)] shadow-[inset_0_0_0_2px_var(--secondary-400)] bg-[color-mix(in_oklab,var(--secondary-50)_65%,white)]"
    : "";

  const activeFrame =
    active && !expanded
      ? "shadow-[inset_0_0_0_2px_var(--secondary-400)] bg-[var(--secondary-50)] text-[var(--secondary-400)]"
      : "";

  const leftAccent =
    active && !expanded && hasChildren && layout === "vertical"
      ? "border-l-[3px] border-l-[var(--secondary-400)] pl-2.5"
      : "";

  const misc =
    (disabled ? " opacity-60 pointer-events-none" : "") +
    " ring-offset-0 focus-visible:ring-2 focus-visible:ring-[var(--profejoo-tertiary)]";

  const rootClass = `${base}${hoverPart} ${expandedFrame} ${activeFrame} ${leftAccent} ${misc}${
    className ? ` ${className}` : ""
  }`;

  const iconClass = [
    "h-5 w-5 shrink-0 text-[var(--profejoo-primary)]",
    shouldHover && "group-hover:text-[var(--secondary-400)]",
  ].filter(Boolean).join(" ");

  const labelClass = [
    "min-w-0 flex-1 text-left text-[14px] leading-5 truncate text-[var(--profejoo-primary)]",
    shouldHover && "group-hover:text-[var(--secondary-400)]",
  ].filter(Boolean).join(" ");

  const chevronRotation =
    expanded && hasChildren
      ? layout === "horizontal"
        ? "rotate-180"
        : childrenPlacement === "above"
        ? "-rotate-90"
        : "rotate-90"
      : "";

  const ChevronIcon = layout === "horizontal" ? FiChevronDown : FiChevronRight;

  const chevronClass = [
    "h-4 w-4 shrink-0 transition-transform text-[var(--primary-100)]",
    shouldHover && "group-hover:text-[var(--secondary-400)]",
    chevronRotation,
  ].filter(Boolean).join(" ");

  const badgeExpandedClass = [
    "ml-2 inline-flex min-w-[22px] h-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
    badge?.variant === "red"
      ? "bg-[var(--accent-400)] text-white"
      : [
          "bg-[var(--tertiary-100)] text-[var(--profejoo-foreground)]",
          shouldHover &&
            "group-hover:text-[var(--secondary-400)] group-hover:bg-[color-mix(in_oklab,var(--secondary-50)_55%,white)]",
        ].filter(Boolean).join(" "),
  ].join(" ");

  const handleMouseEnter = () => {
    if (!disabled && hasChildren && layout === "horizontal") {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
      onToggle?.(true); 
    }
  };

  const handleMouseLeave = () => {
    if (!disabled && hasChildren && layout === "horizontal") {
      closeTimeout.current = setTimeout(() => {
        onToggle?.(false); 
      }, 300);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    
    if (hasChildren) {
      if (layout === "horizontal" && expanded) {
        onToggle?.(false);
      } else {
        onToggle?.(!expanded);
      }
      e.preventDefault();
      return;
    }
    
    onClick?.();
  };

  const isButton = hasChildren || !to;

  const dropdownPosition = dropdownAlign === "left" ? "left-0" : "right-0";

const childrenBlock = hasChildren ? (
    <div
      id={`menu-${id}`}
      role="menu"
      aria-hidden={!expanded}
      className={
        layout === "horizontal"
          // 🔹 The main change is here: bg-white/70 and backdrop-blur were removed and
          // replaced with bg-[var(--sidebar)] (or bg-white) so it's fully solid and
          // nothing shows through from behind. z-index was also set to 999.
          ? `absolute ${dropdownPosition} top-full mt-2 w-48 rounded-2xl bg-[var(--sidebar)] p-2 shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-[var(--sidebar-border)] z-[999] transition-all origin-top-right flex flex-col gap-1.5 before:absolute before:-top-4 before:left-0 before:w-full before:h-4 ${
              expanded
                ? "opacity-100 scale-100 visible"
                : "opacity-0 scale-95 invisible"
            }`
          : `overflow-hidden pl-9 flex flex-col ${
              expanded
                ? childrenPlacement === "above"
                  ? "mb-1 space-y-1.5 animate-[slideDownFade_0.16s_ease-out]"
                  : "mt-1 space-y-1.5 animate-[slideDownFade_0.16s_ease-out]"
                : "h-0"
            }`
      }
    >
      {childrenItems!.map((c) => {
        const ChildIcon = c.icon;
        const childActive =
          pathname === c.to || pathname.startsWith(c.to + "/");

        const childClass = `
          flex items-center gap-2
          rounded-2xl px-3 py-2.5 text-[13px]
          transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--profejoo-tertiary)]
          ${
            childActive
              ? "shadow-[inset_0_0_0_2px_var(--secondary-400)] bg-[color-mix(in_oklab,var(--secondary-50)_70%,white)] text-[var(--secondary-500)]"
              : "text-[var(--primary-100)] hover:bg-black/5 hover:text-[var(--secondary-400)]"
          }
        `;

        return (
          <Link key={c.to} to={c.to} className={childClass} onClick={() => {
            if (closeTimeout.current) clearTimeout(closeTimeout.current);
            onToggle?.(false);
          }}>
            {ChildIcon && (
              <ChildIcon className="h-4 w-4 shrink-0 text-[inherit]" />
            )}
            <span className="truncate">{c.label}</span>
          </Link>
        );
      })}
    </div>
  ) : null;

  return (
    <div 
      className={layout === "horizontal" ? "relative shrink-0 flex items-center justify-center" : "w-full"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {layout === "vertical" && childrenPlacement === "above" && childrenBlock}

      {isButton ? (
        <button
          type="button"
          role="menuitem"
          aria-expanded={hasChildren ? expanded : undefined}
          aria-controls={hasChildren ? `menu-${id}` : undefined}
          disabled={disabled}
          onClick={handleClick}
          className={rootClass}
        >
          <span className="flex items-center gap-3 min-w-0">
            <Icon className={iconClass} />
            {showText && <span className={labelClass}>{label}</span>}
          </span>
          
          {showText && (
            <span className="flex items-center gap-2">
              {badge && badge.value > 0 && (
                <span className={badgeExpandedClass}>{badge.value}</span>
              )}
              {hasChildren && <ChevronIcon className={chevronClass} />}
            </span>
          )}
        </button>
      ) : (
        <Link
          to={to!}
          role="menuitem"
          className={rootClass}
          onClick={onClick}
        >
          <span className="flex items-center gap-3 min-w-0">
            <Icon className={iconClass} />
            {showText && <span className={labelClass}>{label}</span>}
          </span>
          {showText && (
            <span className="flex items-center gap-2">
              {badge && badge.value > 0 && (
                <span className={badgeExpandedClass}>{badge.value}</span>
              )}
              {hasChildren && <ChevronIcon className={chevronClass} />}
            </span>
          )}
        </Link>
      )}

      {(layout === "horizontal" || childrenPlacement !== "above") && childrenBlock}
    </div>
  );
}