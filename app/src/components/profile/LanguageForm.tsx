// src/components/profile/LanguageForm.tsx
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LanguageForm({
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
  // Parse initial value if editing: "English (C1)" -> language: "English", level: "C1"
  const parseLanguage = (val?: string) => {
    if (!val) return { language: "", level: "" };
    const match = val.match(/^(.+?)\s*\((.+?)\)$/);
    if (match) {
      return { language: match[1].trim(), level: match[2].trim() };
    }
    return { language: val, level: "" };
  };

  const parsed = parseLanguage(initial);
  const [language, setLanguage] = React.useState(parsed.language);
  const [level, setLevel] = React.useState(parsed.level);

  const canSubmit = language.trim().length > 0 && level.trim().length > 0;

  const inputCls =
    "h-10 rounded-[var(--radius-md)] border bg-background px-3 text-sm " +
    "focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] " +
    "focus-visible:border-[var(--color-input)] transition-shadow " +
    "shadow-[var(--shadow-input)] focus-visible:shadow-[var(--shadow-input-focus)] " +
    "profejoo-input--primary";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // Combine: "English (C1)"
    const combined = `${language.trim()} (${level.trim()})`;
    onSave(combined);
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label className="text-sm font-medium" htmlFor="language-input">
          Language *
        </Label>
        <Input
          id="language-input"
          className={inputCls}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          placeholder="e.g., English, Persian, German"
          autoFocus
        />
      </div>

      <div className="grid gap-2">
        <Label className="text-sm font-medium" htmlFor="level-select">
          Proficiency Level *
        </Label>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger
            id="level-select"
            className="h-10 transition-shadow focus-visible:shadow-[var(--shadow-input-focus)]"
          >
            <SelectValue placeholder="Select proficiency level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="native">Native</SelectItem>
            <SelectItem value="fluent">Fluent</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="elementary">Elementary</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Select your proficiency level for this language
        </p>
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
