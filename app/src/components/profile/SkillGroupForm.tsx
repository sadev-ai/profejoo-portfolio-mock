// src/components/profile/SkillGroupForm.tsx
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TagInput from "@/components/profile/TagInput";

export type SkillGroup = { id?: string; group: string; items: string[] };

export default function SkillGroupForm({
  initial,
  mode,
  onCancel,
  onSave,
}: {
  initial?: Partial<SkillGroup>;
  mode: "add" | "edit";
  onCancel: () => void;
  onSave: (v: SkillGroup) => void;
}) {
  const [group, setGroup] = React.useState(initial?.group ?? "");
  const [items, setItems] = React.useState<string[]>(initial?.items ?? []);

  const canSubmit = group.trim().length > 0 && items.length > 0;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSave({
          id: initial?.id,
          group: group.trim(),
          items,
        });
      }}
    >
      <div className="grid gap-2">
        <Label className="profejoo-body-medium">Group *</Label>
        <Input
          placeholder="e.g., Frontend, Data Science, DevOps"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label className="profejoo-body-medium">Items *</Label>
        <TagInput value={items} onChange={setItems} placeholder="React, TypeScript, Tailwind..." />
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {mode === "add" ? "Save" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
