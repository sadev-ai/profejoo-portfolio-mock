// src/components/profile/Pill.tsx
import * as React from "react";

type PillVariant = "muted" | "outline" | "primary" | "secondary" | "tertiary";
type PillSize = "sm" | "md";

export default function Pill({
  children,
  variant = "muted",
  size = "md",
  className = "",
  ...rest
}: React.PropsWithChildren<{
  variant?: PillVariant;
  size?: PillSize;
  className?: string;
}> & React.HTMLAttributes<HTMLSpanElement>) {
  const base =
    "text-[var(--secondary-400)] bg-[var(--secondary-50)]" +
    "text-[var(--secondary-400)] bg-[var(--secondary-50)]";

  const sizeCls =
    size === "sm"
      ? "px-2 py-0.5 text-[11px] leading-4"
      : "px-2.5 py-0.5 text-xs leading-5";

  const variantCls: Record<PillVariant, string> = {
    muted: "bg-muted text-foreground/80 border-border",
    outline: "bg-transparent text-foreground/80 border-border",
    primary:
      "border-transparent bg-[var(--profejoo-primary)] text-[var(--profejoo-primary-foreground)]",
    secondary:
      "border-transparent bg-[var(--profejoo-secondary)] text-[var(--profejoo-secondary-foreground)]",
    tertiary:
      "border-transparent bg-[var(--profejoo-tertiary)] text-[var(--profejoo-primary-foreground)]",
  };

  return (
    <span
      className={`${base} ${sizeCls} ${variantCls[variant]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
