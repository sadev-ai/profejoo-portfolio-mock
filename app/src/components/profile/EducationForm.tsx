// src/components/profile/EducationForm.tsx
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export type Education = {
  id?: string;
  level?: string;
  major?: string;
  institution?: string;
  city?: string;
  country?: string;
  start?: string;      // YYYY-MM
  end?: string;        // YYYY-MM
  current?: boolean;
  gpa?: string;
  gpaFormat?: string;
  thesis?: string;
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

export default function EducationForm({
  initial,
  mode,
  onCancel,
  onSave,
}: {
  initial?: Partial<Education>;
  mode: "add" | "edit";
  onCancel: () => void;
  onSave: (values: Education) => void;
}) {
  const [v, setV] = React.useState<Education>({
    id: initial?.id,
    level: initial?.level || "BSc",
    major: initial?.major || "",
    institution: initial?.institution || "",
    city: initial?.city || "",
    country: initial?.country || "",
    start: initial?.start || "",
    end: initial?.end || "",
    current: initial?.current || false,
    gpa: initial?.gpa || "",
    gpaFormat: initial?.gpaFormat || "",
    thesis: initial?.thesis || "",
  });

  const dateRangeErr =
    !v.current && v.start && v.end && v.end < v.start
      ? "End date can't be before the start date."
      : "";

  const canSubmit =
    v.major?.trim() && v.institution?.trim() && Boolean(v.level) && !dateRangeErr;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSave(v);
      }}
    >
      {/* Level (Degree) */}
      <div className="grid gap-2">
        <Label className="text-sm font-medium" htmlFor="edu-level">
          Degree level *
        </Label>
        <Select
          value={v.level}
          onValueChange={(value) =>
            setV((prev) => ({ ...prev, level: value }))
          }
        >
          <SelectTrigger id="edu-level" className={inputCls}>
            <SelectValue placeholder="Select degree" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="High school">High School Diploma</SelectItem>
            <SelectItem value="BSc">Bachelor's (BSc/BA)</SelectItem>
            <SelectItem value="MSc">Master's (MSc/MA)</SelectItem>
            <SelectItem value="PhD">PhD</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Major / Field of Study */}
      <div className="grid gap-2">
        <Label className="text-sm font-medium" htmlFor="edu-major">
          Field of study / Major *
        </Label>
        <Input
          id="edu-major"
          className={inputCls}
          value={v.major}
          onChange={(e) => setV({ ...v, major: e.target.value })}
          placeholder="e.g., Computer Science"
          autoFocus
        />
      </div>

      {/* Institution */}
      <div className="grid gap-2">
        <Label className="text-sm font-medium" htmlFor="edu-institution">
          Institution / University *
        </Label>
        <Input
          id="edu-institution"
          className={inputCls}
          value={v.institution}
          onChange={(e) => setV({ ...v, institution: e.target.value })}
          placeholder="e.g., TU Berlin"
        />
      </div>

      {/* Location: City & Country */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label className="text-sm font-medium" htmlFor="edu-city">
            City (optional)
          </Label>
          <Input
            id="edu-city"
            className={inputCls}
            value={v.city}
            onChange={(e) => setV({ ...v, city: e.target.value })}
            placeholder="e.g., Berlin"
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-sm font-medium" htmlFor="edu-country">
            Country (optional)
          </Label>
          <Input
            id="edu-country"
            className={inputCls}
            value={v.country}
            onChange={(e) => setV({ ...v, country: e.target.value })}
            placeholder="e.g., Germany"
          />
        </div>
      </div>

      {/* Dates: Start & End */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label className="text-sm font-medium" htmlFor="edu-start">
            Start date
          </Label>
          <Input
            id="edu-start"
            type="month"
            className={inputCls}
            value={v.start}
            onChange={(e) => setV({ ...v, start: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-sm font-medium" htmlFor="edu-end">
            End date
          </Label>
          <Input
            id="edu-end"
            type="month"
            className={inputCls}
            value={v.end}
            disabled={!!v.current}
            aria-invalid={!!dateRangeErr}
            onChange={(e) => setV({ ...v, end: e.target.value })}
          />
          {dateRangeErr ? (
            <p className="text-xs text-destructive">{dateRangeErr}</p>
          ) : null}
        </div>
      </div>

      {/* Currently studying */}
      <div className="flex items-center justify-between gap-2">
        <Label
          htmlFor="edu-current"
          className="text-sm"
        >
          I currently study here
        </Label>
        <Switch
          id="edu-current"
          checked={!!v.current}
          onCheckedChange={(checked) => {
            const c = checked === true;
            setV((prev) => ({
              ...prev,
              current: c,
              end: c ? "" : prev.end,
            }));
          }}
        />
      </div>

      {/* GPA */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label className="text-sm font-medium" htmlFor="edu-gpa">
            GPA (optional)
          </Label>
          <Input
            id="edu-gpa"
            className={inputCls}
            value={v.gpa}
            onChange={(e) => setV({ ...v, gpa: e.target.value })}
            placeholder="e.g., 3.8"
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-sm font-medium" htmlFor="edu-gpa-format">
            GPA format (optional)
          </Label>
          <Input
            id="edu-gpa-format"
            className={inputCls}
            value={v.gpaFormat}
            onChange={(e) => setV({ ...v, gpaFormat: e.target.value })}
            placeholder="e.g., 4.0 scale or German (1.0-5.0)"
          />
        </div>
      </div>

      {/* Thesis / Description (optional) */}
      <div className="grid gap-2">
        <Label className="text-sm font-medium" htmlFor="edu-thesis">
          Thesis / Description (optional)
        </Label>
        <Textarea
          id="edu-thesis"
          rows={4}
          className={textareaCls}
          value={v.thesis ?? ""}
          onChange={(e) => setV({ ...v, thesis: e.target.value })}
          placeholder="Thesis title or brief description of your studies..."
        />
      </div>

      {/* Action buttons */}
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
