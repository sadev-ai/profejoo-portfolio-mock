// src/components/profile/TagInput.tsx
//
// Shared chip-style tag input. Before this, there were three different
// implementations of "enter a list of short strings" across the Profile
// forms: Basics had a polished chip UI, OutputForm had its own separate
// (visually different) chip UI, and Experience/Extras/SkillGroup just used
// a single-line "comma separated" text input with no chips at all — so
// removing one tag meant editing raw text, and there was no visual
// confirmation of what had been added. This is now the one implementation;
// every section that collects a list of tags/skills/items renders this.
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter...",
  id,
  className,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}) {
  const [draft, setDraft] = React.useState("");
  const reactId = React.useId();
  const inputId = id ?? reactId;

  const commitDraft = () => {
    const newTag = draft.trim().replace(/,/g, "");
    if (newTag && !value.includes(newTag)) {
      onChange([...value, newTag]);
    }
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      // Convenient, expected tag-input behavior: backspace on an empty
      // field removes the last chip instead of doing nothing.
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div>
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 min-h-[40px] rounded-[var(--radius-md)] border bg-background px-3 py-1.5 text-sm transition-shadow shadow-[var(--shadow-input)] focus-within:ring-2 focus-within:ring-[var(--color-ring)] focus-within:border-[var(--color-input)] focus-within:shadow-[var(--shadow-input-focus)] cursor-text",
          className
        )}
        onClick={() => document.getElementById(inputId)?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-[var(--accent-50)] text-[var(--accent-800)] rounded-[var(--radius-md)] border border-[var(--accent-800)]"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="text-[var(--accent-800)] hover:text-[var(--destructive)] focus:outline-none transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3.5 w-3.5" strokeWidth={3} />
            </button>
          </span>
        ))}
        <input
          id={inputId}
          type="text"
          className="flex-1 min-w-[120px] bg-transparent outline-none py-1 text-sm text-foreground placeholder:text-muted-foreground"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          placeholder={value.length ? "" : placeholder}
        />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Press <kbd className="px-1 py-0.5 rounded-md bg-muted border">Enter</kbd> or{" "}
        <kbd className="px-1 py-0.5 rounded-md bg-muted border">,</kbd> to add.
      </p>
    </div>
  );
}
