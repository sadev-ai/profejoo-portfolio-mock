// src/components/profile/InterestForm.tsx
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InterestForm({
  initial,
  mode,
  onCancel,
  onSave,
}: {
  initial?: string;
  mode: "add" | "edit";
  onCancel: () => void;
  onSave: (v: string) => void;
}) {
  const [value, setValue] = React.useState(initial ?? "");

  const canSubmit = value.trim().length > 0;

  const inputCls =
    "h-10 rounded-[var(--radius-md)] border bg-background px-3 text-sm " +
    "focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] " +
    "focus-visible:border-[var(--color-input)] transition-shadow " +
    "shadow-[var(--shadow-input)] focus-visible:shadow-[var(--shadow-input-focus)] " +
    "profejoo-input--primary";

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSave(value.trim());
      }}
    >
      <div className="grid gap-2">
        <Label className="text-sm font-medium" htmlFor="interest-input">
          Interest *
        </Label>
        <Input
          id="interest-input"
          className={inputCls}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g., Distributed Systems"
          autoFocus
        />
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button
          variant="outline"
          type="button"
          onClick={onCancel}
          className="btn btn--outline-secondary btn--sm"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!canSubmit}
          className="btn btn--primary btn--sm"
        >
          {mode === "add" ? "Save" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
