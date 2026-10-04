// src/components/profile/credentialForm.tsx
import * as React from "react";
import { Button } from "@/components/ui/button";

export type Credential = { 
  id?: string; 
  title: string; 
  issuer: string; 
  year?: string;
  link?: string; // URL to the credential
  description?: string; // Additional context about the credential
};

const inputCls =
  "h-10 rounded-[var(--radius-md)] border bg-background px-3 text-sm " +
  "focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] " +
  "focus-visible:border-[var(--color-input)] transition-shadow " +
  "shadow-[var(--shadow-input)] focus-visible:shadow-[var(--shadow-input-focus)] " +
  "profejoo-input--primary";

export default function CredentialForm({
  initial,
  mode,
  onCancel,
  onSave,
}: {
  initial?: Partial<Credential>;
  mode: "add" | "edit";
  onCancel: () => void;
  onSave: (v: Credential) => void;
}) {
  const [v, setV] = React.useState<Credential>({
    id: initial?.id,
    title: initial?.title ?? "",
    issuer: initial?.issuer ?? "",
    year: initial?.year ?? "",
    link: initial?.link ?? "",
    description: initial?.description ?? "",
  });

  const [urlErr, setUrlErr] = React.useState<string>("");

  const canSubmit = v.title.trim() && v.issuer.trim() && !urlErr;

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

  const setYear = (val: string) => {
    // keep only digits, max 4 chars
    const onlyDigits = val.replace(/\D+/g, "").slice(0, 4);
    setV((s) => ({ ...s, year: onlyDigits }));
  };

  return (
    <form
      className="flex flex-col gap-5"
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
        <label className="text-sm font-medium" htmlFor="cred-title">
          Title *
        </label>
        <input
          id="cred-title"
          className={inputCls}
          value={v.title}
          onChange={(e) => setV({ ...v, title: e.target.value })}
          placeholder="e.g., AWS Certified Cloud Practitioner"
          autoFocus
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="cred-issuer">
          Issuer *
        </label>
        <input
          id="cred-issuer"
          className={inputCls}
          value={v.issuer}
          onChange={(e) => setV({ ...v, issuer: e.target.value })}
          placeholder="e.g., Amazon Web Services"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="cred-year">
          Year
        </label>
        <input
          id="cred-year"
          className={inputCls}
          inputMode="numeric"
          pattern="\d{4}"
          placeholder="YYYY"
          value={v.year ?? ""}
          onChange={(e) => setYear(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="cred-link">
          Link
        </label>
        <input
          id="cred-link"
          type="url"
          className={inputCls}
          value={v.link ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            setV({ ...v, link: val });
            validateUrl(val);
          }}
          onBlur={(e) => validateUrl(e.target.value)}
          aria-invalid={!!urlErr}
          placeholder="https://example.com/certificate"
        />
        {urlErr ? (
          <p className="text-xs text-destructive">{urlErr}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Include <span className="font-medium">https://</span> (we'll add it if missing).
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="cred-desc">
          Description
        </label>
        <textarea
          id="cred-desc"
          className={inputCls}
          value={v.description ?? ""}
          onChange={(e) => setV({ ...v, description: e.target.value })}
          placeholder="e.g., Cloud certification covering AWS fundamentals"
          rows={3}
        />
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button
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
