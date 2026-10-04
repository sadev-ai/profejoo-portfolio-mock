// src/components/profile/ExtraForm.tsx
//
// This file previously contained a copy-pasted duplicate of
// ExperienceForm.tsx's content (wrong `Experience` type, no `ExtraKV`
// export at all, and an `org` field instead of `organization`). That meant
// ExtrasSection.tsx's `import ExtraForm, { ExtraKV } from "./ExtraForm"`
// pointed at a module with no such export, and even setting that aside, the
// organization a user typed was written to a property (`org`) nothing ever
// read back — it was silently discarded on every save, and there was no
// field for `location` at all. Rewritten to match what ExtrasSection.tsx
// and profileAdapter.ts's UIExtra/apiExtrasToUI/uiExtrasToAPI actually use.
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TagInput from "@/components/profile/TagInput";

export type ExtraKV = {
  id?: string;
  title?: string;
  organization?: string;
  location?: string;
  start?: string;
  end?: string;
  bullets?: string[];
  tags?: string[];
  /** Derived display label (title). Recomputed on save; not user-edited directly. */
  k?: string;
  /** Derived display value (bullets joined). Recomputed on save; not user-edited directly. */
  v?: string;
};

const inputCls =
  "h-10 rounded-[var(--radius-md)] border bg-background px-3 text-sm " +
  "focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] " +
  "focus-visible:border-[var(--color-input)] transition-shadow " +
  "shadow-[var(--shadow-input)] focus-visible:shadow-[var(--shadow-input-focus)] " +
  "profejoo-input--primary";

export default function ExtraForm({
  initial,
  mode,
  onCancel,
  onSave,
}: {
  initial?: ExtraKV;
  mode: "add" | "edit";
  onCancel: () => void;
  onSave: (v: ExtraKV) => void;
}) {
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [organization, setOrganization] = React.useState(initial?.organization ?? "");
  const [location, setLocation] = React.useState(initial?.location ?? "");
  const [start, setStart] = React.useState(initial?.start ?? "");
  const [end, setEnd] = React.useState(initial?.end ?? "");
  const [details, setDetails] = React.useState(
    (initial?.bullets && initial.bullets.length > 0 ? initial.bullets.join("\n") : "") || ""
  );
  const [tags, setTags] = React.useState<string[]>(initial?.tags ?? []);

  const dateRangeErr = start && end && end < start ? "End date can't be before the start date." : "";

  const canSubmit = title.trim().length > 0 && !dateRangeErr;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const bullets = details
      .split("\n")
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    onSave({
      id: initial?.id,
      title: title.trim(),
      organization: organization.trim(),
      location: location.trim(),
      start: start.trim(),
      end: end.trim(),
      bullets,
      tags,
      k: title.trim(),
      v: bullets.join(", "),
    });
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label className="text-sm font-medium" htmlFor="extra-title">
          Title *
        </Label>
        <Input
          id="extra-title"
          className={inputCls}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Volunteer Coordinator"
          autoFocus
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label className="text-sm font-medium" htmlFor="extra-organization">
            Organization
          </Label>
          <Input
            id="extra-organization"
            className={inputCls}
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="e.g., Red Cross"
          />
        </div>

        <div className="grid gap-2">
          <Label className="text-sm font-medium" htmlFor="extra-location">
            Location
          </Label>
          <Input
            id="extra-location"
            className={inputCls}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Hamburg, Germany"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label className="text-sm font-medium" htmlFor="extra-start">
            Start date
          </Label>
          <Input
            id="extra-start"
            type="month"
            className={inputCls}
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label className="text-sm font-medium" htmlFor="extra-end">
            End date
          </Label>
          <Input
            id="extra-end"
            type="month"
            className={inputCls}
            value={end}
            aria-invalid={!!dateRangeErr}
            onChange={(e) => setEnd(e.target.value)}
            placeholder="Leave blank if ongoing"
          />
          {dateRangeErr ? (
            <p className="text-xs text-destructive">{dateRangeErr}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        <Label className="text-sm font-medium" htmlFor="extra-details">
          Details
        </Label>
        <Textarea
          id="extra-details"
          className="min-h-24 rounded-[var(--radius-md)] border bg-background px-3 py-2 text-sm profejoo-input--primary"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder={"One point per line, e.g.:\nOrganized weekly blood-drive events\nTrained 12 new volunteers"}
        />
        <p className="text-xs text-muted-foreground">One line per bullet point.</p>
      </div>

      <div className="grid gap-2">
        <Label className="text-sm font-medium" htmlFor="extra-tags">
          Tags
        </Label>
        <TagInput
          id="extra-tags"
          value={tags}
          onChange={setTags}
          placeholder="Leadership, Community..."
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
        <Button type="submit" disabled={!canSubmit} className="btn btn--primary btn--sm">
          {mode === "add" ? "Save" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
