// src/components/profile/OutputForm.tsx
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TagInput from "@/components/profile/TagInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type OutputItem = {
  id?: string;
  title: string;
  type: string; // Paper | Project | Talk | Honor and Award
  venue?: string;
  summary?: string; 
  link?: string;
  tags?: string[];
  year?: string; // <--- the year field, which had been completely forgotten, was added here
};

// This function fixes the backend/frontend case (upper/lower) mismatch for the dropdown
const normalizeType = (t?: string) => {
  if (!t) return "";
  const lower = t.toLowerCase();
  if (lower === "paper" || lower === "publication") return "Paper";
  if (lower === "project") return "Project";
  if (lower === "talk") return "Talk";
  if (lower.includes("honor")) return "Honor and Award";
  return t; 
};

export default function OutputForm({
  initial,
  mode,
  onCancel,
  onSave,
}: {
  initial?: Partial<OutputItem>;
  mode: "add" | "edit";
  onCancel: () => void;
  onSave: (v: OutputItem) => void;
}) {
  const [v, setV] = React.useState<OutputItem>({
    id: initial?.id,
    title: initial?.title ?? "",
    type: normalizeType(initial?.type), // <--- gets standardized to one of the known types
    venue: initial?.venue ?? "",
    summary: initial?.summary ?? "",
    link: initial?.link ?? "",
    tags: initial?.tags ?? [],
    year: initial?.year ?? "", // <--- year was added to the state
  });

  const [urlErr, setUrlErr] = React.useState<string>("");

  const canSubmit = v.title.trim().length > 0 && v.type.trim().length > 0 && !urlErr;

  const validateUrl = (val: string) => {
    if (!val.trim()) {
      setUrlErr("");
      return;
    }
    try {
      const normalized = val.match(/^https?:\/\//i) ? val : `https://${val}`;
      const u = new URL(normalized);
      if (!/^https?:$/.test(u.protocol)) throw new Error("Only http(s) allowed");
      setUrlErr("");
    } catch {
      setUrlErr("Enter a valid URL (e.g., https://example.com)");
    }
  };


  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSave({
          ...v,
          link: v.link
            ? v.link.match(/^https?:\/\//i)
              ? v.link
              : `https://${v.link}`
            : "",
        });
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="out-title">Title *</Label>
        <Input
          id="out-title"
          value={v.title}
          onChange={(e) => setV((s) => ({ ...s, title: e.target.value }))}
          placeholder="e.g., Real-Time TPMS Decoder"
          className="transition-shadow shadow-[var(--shadow-input)] focus-visible:shadow-[var(--shadow-input-focus)]"
        />
      </div>

      <div className="grid gap-2">
        <Label>Type *</Label>
        <Select
          value={v.type || undefined}
          onValueChange={(x) => setV((s) => ({ ...s, type: x }))}
          disabled={mode === "edit" || !!initial?.type}
        >
          <SelectTrigger className="transition-shadow focus-visible:shadow-[var(--shadow-input-focus)]">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Paper">Paper</SelectItem>
            <SelectItem value="Project">Project</SelectItem>
            <SelectItem value="Talk">Talk</SelectItem>
            <SelectItem value="Honor and Award">Honor and Award</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="out-venue">Venue / Issuer</Label>
          <Input
            id="out-venue"
            value={v.venue}
            onChange={(e) => setV((s) => ({ ...s, venue: e.target.value }))}
            placeholder="e.g., Profejoo"
            className="transition-shadow shadow-[var(--shadow-input)] focus-visible:shadow-[var(--shadow-input-focus)]"
          />
        </div>

        {/* Year field added here */}
        <div className="grid gap-2">
          <Label htmlFor="out-year">Year</Label>
          <Input
            id="out-year"
            inputMode="numeric"
            pattern="\d{4}"
            value={v.year}
            onChange={(e) => setV((s) => ({ ...s, year: e.target.value.replace(/\D+/g, "").slice(0, 4) }))}
            placeholder="e.g., 2024"
            className="transition-shadow shadow-[var(--shadow-input)] focus-visible:shadow-[var(--shadow-input-focus)]"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="out-summary">Summary</Label>
        <Input
          id="out-summary"
          value={v.summary}
          onChange={(e) => setV((s) => ({ ...s, summary: e.target.value }))}
          placeholder="Brief description of the work"
          className="transition-shadow shadow-[var(--shadow-input)] focus-visible:shadow-[var(--shadow-input-focus)]"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="out-link">Link</Label>
        <Input
          id="out-link"
          type="url"
          value={v.link}
          onChange={(e) => {
            const val = e.target.value;
            setV((s) => ({ ...s, link: val }));
            validateUrl(val);
          }}
          onBlur={(e) => validateUrl(e.target.value)}
          aria-invalid={!!urlErr}
          placeholder="https://example.com/paper"
          className="transition-shadow shadow-[var(--shadow-input)] focus-visible:shadow-[var(--shadow-input-focus)]"
        />
        {urlErr ? (
          <p className="text-xs text-destructive">{urlErr}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Include <span className="font-medium">https://</span> (we’ll add it if missing).
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="out-tags">Tags</Label>
        <TagInput
          id="out-tags"
          value={v.tags ?? []}
          onChange={(tags) => setV((s) => ({ ...s, tags }))}
          placeholder="Type a tag and press Enter..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" onClick={onCancel} className="btn btn--outline-secondary btn--sm" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit} className="btn btn--primary btn--sm disabled:opacity-60">
          {mode === "add" ? "Save" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}