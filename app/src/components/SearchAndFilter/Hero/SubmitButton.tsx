import React from "react";
type SubmitButtonProps = {
  label: string;
  loadingLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
};

/**
 * Reusable submit button for the SearchForm.
 * - Uses Tailwind + your CSS variables.
 * - Easily extend with icons/spinners later.
 */
const SubmitButton: React.FC<SubmitButtonProps> = ({
  label,
  loadingLabel = "Searching...",
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className = "",
}) => {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={[
        "inline-flex items-center justify-center",
        "px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200",
        "bg-(--primary-400) text-(--better-white)",
        "hover:shadow-lg hover:brightness-105 hover:-translate-y-0.5",
        "active:scale-95",
        "cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-2 focus:ring-(--primary-400)/60",
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      aria-busy={isLoading || undefined}
      aria-disabled={disabled || isLoading || undefined}
    >
      {isLoading ? loadingLabel : label}
    </button>
  );
};

export default SubmitButton;
