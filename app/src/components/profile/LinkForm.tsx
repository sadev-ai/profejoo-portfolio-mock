// src/components/profile/LinkForm.tsx
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type LinkItem = { id?: string; title: string; href: string };

export default function LinkForm({
  initial,
  mode,
  onCancel,
  onSave,
}: {
  initial?: Partial<LinkItem>;
  mode: "add" | "edit";
  onCancel: () => void;
  onSave: (v: LinkItem) => void;
}) {
  const [v, setV] = React.useState<LinkItem>({
    id: initial?.id,
    title: initial?.title ?? "",
    href: initial?.href ?? "",
  });
  const [urlErr, setUrlErr] = React.useState<string>("");

  const canSubmit = v.title.trim().length > 0 && v.href.trim().length > 0 && !urlErr;

  const validateUrl = (val: string) => {
    if (!val.trim()) {
      setUrlErr("");
      return;
    }
    try {
      // Accepts http(s) and bare domains when the browser can coerce
      const u = new URL(val.match(/^https?:\/\//i) ? val : `https://${val}`);
      if (!/^https?:$/.test(u.protocol)) throw new Error("Only http(s) is allowed");
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
          // Normalize to https:// if user omitted protocol
          href: v.href.match(/^https?:\/\//i) ? v.href : `https://${v.href}`,
        });
      }}
    >
      {/* Title */}
      <div className="grid gap-2">
        <Label htmlFor="link-title">Title *</Label>
        <Input
          id="link-title"
          value={v.title}
          onChange={(e) => setV((s) => ({ ...s, title: e.target.value }))}
          className="transition-shadow shadow-[var(--shadow-input)] focus-visible:shadow-[var(--shadow-input-focus)]"
          placeholder="Portfolio, GitHub, LinkedIn…"
        />
      </div>

      {/* URL */}
      <div className="grid gap-2">
        <Label htmlFor="link-url">URL *</Label>
        <Input
          id="link-url"
          type="url"
          value={v.href}
          onChange={(e) => {
            const val = e.target.value;
            setV((s) => ({ ...s, href: val }));
            validateUrl(val);
          }}
          onBlur={(e) => validateUrl(e.target.value)}
          aria-invalid={!!urlErr}
          className="transition-shadow shadow-[var(--shadow-input)] focus-visible:shadow-[var(--shadow-input-focus)]"
          placeholder="https://example.com"
        />
        {urlErr ? (
          <p className="text-xs text-destructive">{urlErr}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Include <span className="font-medium">https://</span> (we’ll add it if missing).
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          onClick={onCancel}
          className="btn btn--outline-secondary btn--sm"
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!canSubmit}
          className="btn btn--primary btn--sm disabled:opacity-60"
        >
          {mode === "add" ? "Save" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
