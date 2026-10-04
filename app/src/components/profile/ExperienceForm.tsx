// src/components/profile/ExperienceForm.tsx
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import TagInput from "@/components/profile/TagInput";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export type ExperienceType = "work" | "ra" | "ta";

export type Experience = {
  id?: string;
  experienceType: ExperienceType;

  title: string;
  org: string;
  location?: string; // e.g., "Berlin, Germany"

  start?: string;
  end?: string;
  currently?: boolean;

  description?: string;
  bullets?: string[];
  tags?: string[];

  // Only for work
  workType?: string; // Full-time, Part-time, Internship, Freelance, Contract
  workArrangement?: string; // On-site, Hybrid, Remote

  // For RA/TA
  professor?: string;
};

const inputCls =
  "h-10 rounded-[var(--radius-md)] border bg-background px-3 text-sm " +
  "focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] " +
  "focus-visible:border-[var(--color-input)] transition-shadow " +
  "shadow-[var(--shadow-input)] focus-visible:shadow-[var(--shadow-input-focus)] " +
  "profejoo-input--primary";

const textareaCls =
  "min-h-28 rounded-[var(--radius-md)] border bg-background px-3 py-2 text-sm " +
  "focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] " +
  "focus-visible:border-[var(--color-input)] transition-shadow " +
  "shadow-[var(--shadow-input)] focus-visible:shadow-[var(--shadow-input-focus)] " +
  "profejoo-input--primary";

export default function ExperienceForm({
  initial,
  mode,
  onCancel,
  onSave,
}: {
  initial?: Partial<Experience>;
  mode: "add" | "edit";
  onCancel: () => void;
  onSave: (values: Experience) => void;
}) {
  const [v, setV] = React.useState<Experience>({
    id: initial?.id,
    experienceType: initial?.experienceType ?? "work",
    title: initial?.title ?? "",
    org: initial?.org ?? "",
    location: initial?.location ?? "",
    start: initial?.start ?? "",
    end: initial?.end ?? "",
    currently: initial?.currently ?? false,
    description: initial?.description ?? "",
    bullets: initial?.bullets ?? [],
    tags: initial?.tags ?? [],
    workType: initial?.workType,
    workArrangement: initial?.workArrangement,
    professor: initial?.professor ?? "",
  });

  const [bullets, setBullets] = React.useState<string>(
    (v.bullets ?? []).join("\n")
  );

  const dateRangeErr =
    !v.currently && v.start && v.end && v.end < v.start
      ? "End date can't be before the start date."
      : "";

  const canSubmit =
    v.title.trim() && v.org.trim() && Boolean(v.experienceType) && !dateRangeErr;

  const normalizeBullets = (s: string) =>
    s
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

  const isWork = v.experienceType === "work";
  const isRa = v.experienceType === "ra";
  const isTa = v.experienceType === "ta";

  const orgLabel = isTa ? "Academy / University *" : "Organization *";

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSave({
          ...v,
          bullets: normalizeBullets(bullets),
        });
      }}
    >
      {/* Experience type */}
      <div className="grid gap-2">
        <Label className="text-sm font-medium" htmlFor="exp-type">
          Type *
        </Label>
        <Select
          value={v.experienceType}
          onValueChange={(value) =>
            setV((prev) => ({
              ...prev,
              experienceType: value as ExperienceType,
            }))
          }
        >
          <SelectTrigger id="exp-type" className={inputCls}>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="work">Work experience</SelectItem>
            <SelectItem value="ra">Research assistantship</SelectItem>
            <SelectItem value="ta">Teaching assistantship</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div className="grid gap-2">
        <Label className="text-sm font-medium" htmlFor="exp-title">
          Title *
        </Label>
        <Input
          id="exp-title"
          className={inputCls}
          value={v.title}
          onChange={(e) => setV({ ...v, title: e.target.value })}
          placeholder={
            isWork
              ? "e.g., Machine Learning Intern"
              : isRa
              ? "e.g., Research Assistant in NLP"
              : "e.g., Teaching Assistant – Algorithms"
          }
          autoFocus
        />
      </div>

      {/* Organization / University */}
      <div className="grid gap-2">
        <Label className="text-sm font-medium" htmlFor="exp-org">
          {orgLabel}
        </Label>
        <Input
          id="exp-org"
          className={inputCls}
          value={v.org}
          onChange={(e) => setV({ ...v, org: e.target.value })}
          placeholder={
            isTa ? "e.g., TU Berlin, Faculty of CS" : "e.g., ACME AI Lab"
          }
        />
      </div>

      {/* Location */}
      <div className="grid gap-2">
        <Label className="text-sm font-medium" htmlFor="exp-location">
          Location
        </Label>
        <Input
          id="exp-location"
          className={inputCls}
          value={v.location}
          onChange={(e) => setV({ ...v, location: e.target.value })}
          placeholder="e.g., Berlin, Germany"
        />
      </div>

      {/* Dates + currently */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label className="text-sm font-medium" htmlFor="exp-start">
            Start
          </Label>
          <Input
            id="exp-start"
            type="month"
            className={inputCls}
            value={v.start}
            onChange={(e) => setV({ ...v, start: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-sm font-medium" htmlFor="exp-end">
            End
          </Label>
          <Input
            id="exp-end"
            type="month"
            className={inputCls}
            value={v.end}
            disabled={!!v.currently}
            aria-invalid={!!dateRangeErr}
            onChange={(e) => setV({ ...v, end: e.target.value })}
          />
          {dateRangeErr ? (
            <p className="text-xs text-destructive">{dateRangeErr}</p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Label
          htmlFor="exp-current"
          className="text-sm"
        >
          I currently work here / hold this position
        </Label>
        <Switch
          id="exp-current"
          checked={!!v.currently}
          onCheckedChange={(checked) => {
            const c = checked === true;
            setV((prev) => ({
              ...prev,
              currently: c,
              end: c ? "" : prev.end,
            }));
          }}
        />
      </div>

      {/* Professor, for RA and TA */}
      {(isRa || isTa) && (
        <div className="grid gap-2">
          <Label className="text-sm font-medium" htmlFor="exp-prof">
            Professor / Supervisor {isRa ? "" : "(optional)"}
          </Label>
          <Input
            id="exp-prof"
            className={inputCls}
            value={v.professor}
            onChange={(e) => setV({ ...v, professor: e.target.value })}
            placeholder="e.g., Prof. Müller"
          />
        </div>
      )}

      {/* Employment type and work arrangement, for work */}
      {isWork && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label className="text-sm font-medium">
              Employment type (optional)
            </Label>
            <Select
              value={v.workType ?? ""}
              onValueChange={(val) =>
                setV((prev) => ({ ...prev, workType: val }))
              }
            >
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
                <SelectItem value="Freelance">Freelance</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium">
              Work arrangement (optional)
            </Label>
            <Select
              value={v.workArrangement ?? ""}
              onValueChange={(val) =>
                setV((prev) => ({ ...prev, workArrangement: val }))
              }
            >
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder="Select arrangement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="On-site">On-site</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Description, for everyone (optional) */}
      <div className="grid gap-2">
        <Label className="text-sm font-medium" htmlFor="exp-desc">
          Description (optional)
        </Label>
        <Textarea
          id="exp-desc"
          rows={4}
          className={textareaCls}
          value={v.description ?? ""}
          onChange={(e) => setV({ ...v, description: e.target.value })}
          placeholder={
            isRa
              ? "Short description of your research assistantship..."
              : isTa
              ? "Short description of your teaching responsibilities..."
              : "Short description of your role and impact..."
          }
        />
      </div>

      {/* Bullets / Tasks, only for work and TA */}
      {(isWork || isTa) && (
        <div className="grid gap-2">
          <Label className="text-sm font-medium" htmlFor="exp-bullets">
            {isTa
              ? "Tasks (one per line, optional)"
              : "Bullets (one per line, optional)"}
          </Label>
          <Textarea
            id="exp-bullets"
            rows={4}
            className={textareaCls}
            value={bullets}
            onChange={(e) => setBullets(e.target.value)}
            placeholder={
              isTa
                ? "• Led weekly tutorials\n• Graded assignments"
                : "• Implemented data pipelines\n• Optimized training loops"
            }
          />
        </div>
      )}

      {/* Tags — same chip input used across all sections */}
      <div className="grid gap-2">
        <Label className="text-sm font-medium" htmlFor="exp-tags">
          Tags (optional)
        </Label>
        <TagInput
          id="exp-tags"
          value={v.tags ?? []}
          onChange={(tags) => setV((prev) => ({ ...prev, tags }))}
          placeholder="Python, PyTorch, Teaching..."
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
