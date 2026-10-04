// src/components/profile/BasicsSection.tsx
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit } from "lucide-react";
import RightSheet from "@/components/profile/RightSheet";
import TagInput from "@/components/profile/TagInput";
import { useProfile } from "@/context/ProfileContext";
import { toast } from "sonner";
import { getInitials, getAvatarColorFromEmail } from "@/lib/avatarUtils";

export type Basics = {
  avatar_url?: string;
  birthday?: string;
  city?: string;
  country?: string;
  email: string;
  first_name: string;
  full_name?: string;
  gender?: string;
  last_name: string;
  linkedin?: string;
  location?: string;
  phone?: string;
  summary?: string;
  tags?: string[];
  website?: string;
};

type BasicsPresence = {
  firstName?: boolean;
  lastName?: boolean;
  email?: boolean;
  city?: boolean;
  country?: boolean;
  phone?: boolean;
  tags?: number;
};

const toPresence = (v: Basics): BasicsPresence => ({
  firstName: !!v.first_name,
  lastName: !!v.last_name,
  email: !!v.email,
  city: !!v.city,
  country: !!v.country,
  phone: !!v.phone,
  tags: v.tags?.length ?? 0,
});

const normalizeGender = (value?: string) => {
  const normalized = (value || "").toLowerCase();
  if (normalized === "male" || normalized === "female") return normalized;
  return "";
};

const inputCls =
  "h-10 rounded-[var(--radius-md)] border bg-background px-3 text-sm " +
  "focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] " +
  "focus-visible:border-[var(--color-input)] transition-shadow " +
  "shadow-[var(--shadow-input)] focus-visible:shadow-[var(--shadow-input-focus)]";

export default function BasicsSection({
  attachRef,
  onBasicsPresenceChange,
  enableEmailEdit = false,
  fixedAvatarColor,
}: {
  attachRef: (el: HTMLElement | null) => void;
  onBasicsPresenceChange?: (p: BasicsPresence) => void;
  enableEmailEdit?: boolean;
  fixedAvatarColor?: string;
}) {
  const { profile, updateProfile } = useProfile();
  const basics = profile?.data?.basics;

  const [data, setData] = React.useState<Basics>({
    first_name: basics?.first_name || "",
    last_name: basics?.last_name || "",
    full_name: basics?.full_name || "",
    email: basics?.email || "",
    city: basics?.city || "",
    country: basics?.country || "",
    location: basics?.location || "",
    phone: basics?.phone || "",
    tags: basics?.tags ?? [],
    gender: normalizeGender(basics?.gender),
    birthday: basics?.birthday || "",
    avatar_url: basics?.avatar_url || "",
    linkedin: basics?.linkedin || "",
    website: basics?.website || "",
    summary: basics?.summary || "",
  });

  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (basics) {
      setData({
        first_name: basics.first_name || "",
        last_name: basics.last_name || "",
        full_name: basics.full_name || "",
        email: basics.email || "",
        city: basics.city || "",
        country: basics.country || "",
        location: basics.location || "",
        phone: basics.phone || "",
        tags: basics.tags ?? [],
        gender: normalizeGender(basics.gender),
        birthday: basics.birthday || "",
        avatar_url: basics.avatar_url || "",
        linkedin: basics.linkedin || "",
        website: basics.website || "",
        summary: basics.summary || "",
      });
    }
  }, [basics]);

  React.useEffect(() => {
    onBasicsPresenceChange?.(toPresence(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName = data.full_name || `${data.first_name} ${data.last_name}`.trim();
  const displayLocation = data.location || [data.city, data.country].filter(Boolean).join(", ");

  return (
    <section
      id="basics"
      data-key="basics"
      ref={(el) => attachRef(el)}
      className="scroll-mt-28 h-full"
    >
      <Card className="h-full shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
            <div className="flex items-center gap-4">
              <Avatar className="size-14 sm:size-16 border">
                {data.avatar_url ? (
                  <AvatarImage src={data.avatar_url} alt="Profile image" />
                ) : null}
                <AvatarFallback 
                  style={{ backgroundColor: fixedAvatarColor || getAvatarColorFromEmail(data.email) }}
                  className="text-white font-semibold"
                >
                  {getInitials(data.first_name, data.last_name, data.email)}
                </AvatarFallback>
              </Avatar>

              <div className="sm:hidden">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold">{displayName}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 !px-0"
                    onClick={() => setOpen(true)}
                    aria-label="Edit basics"
                  >
                    <Edit className="size-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs mt-1">
                  {displayLocation}
                  {data.email ? (displayLocation ? " • " : "") + data.email : ""}
                </p>
              </div>
            </div>

            <div className="flex-1">
              <div className="hidden sm:flex items-center gap-2">
                <h2 className="text-lg font-semibold">{displayName}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 !px-0"
                  onClick={() => setOpen(true)}
                  aria-label="Edit basics"
                >
                  <Edit className="size-4" />
                </Button>
              </div>

              <p className="hidden sm:block text-muted-foreground text-sm mt-1">
                {displayLocation}
                {data.email ? (displayLocation ? " • " : "") + data.email : ""}
              </p>

              {data.summary && (
                <p className="text-sm mt-3 text-foreground/90 leading-relaxed">
                  {data.summary}
                </p>
              )}

              {!!data.tags?.length && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.tags.map((c) => (
                    <Badge
                      key={c}
                      variant="secondary"
                      className="text-[var(--secondary-400)] bg-[var(--secondary-50)]"
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              )}

              <Separator className="my-4" />

              <div className="grid gap-2 sm:gap-3 text-sm md:grid-cols-2 lg:grid-cols-3">
                <div>
                  Phone: <span className="text-foreground/80">{data.phone || "—"}</span>
                </div>
                <div className="min-w-0">
                  Email: <span className="text-foreground/80 break-all">{data.email || "—"}</span>
                </div>
                {(data.linkedin || data.website) && (
                  <div className="flex flex-col gap-1">
                    {data.linkedin && (
                      <div>
                        LinkedIn: <a href={data.linkedin} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline break-all">Link</a>
                      </div>
                    )}
                    {data.website && (
                      <div>
                        Website: <a href={data.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline break-all">Link</a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <RightSheet
        open={open}
        onOpenChange={setOpen}
        title="Edit Basics"
        description="Update your basic information"
        widthClass="sm:max-w-2xl"
      >
        <BasicsForm
          initial={data}
          onCancel={() => setOpen(false)}
          enableEmailEdit={enableEmailEdit}
          fixedAvatarColor={fixedAvatarColor}
          onSave={async (v) => {
            try {
              await updateProfile({ basics: v });
              setData(v);
              setOpen(false);
              onBasicsPresenceChange?.(toPresence(v));
              toast.success("Basics updated successfully");
            } catch (error: any) {
              console.error("Failed to update basics:", error);
              toast.error(error.message || "Failed to update basics");
            }
          }}
        />
      </RightSheet>
    </section>
  );
}

/* ---------- inline BasicsForm ---------- */
/* ---------- Just replace this component ---------- */
function BasicsForm({
  initial,
  onCancel,
  onSave,
  enableEmailEdit = false,
  fixedAvatarColor,
}: {
  initial: Basics;
  onCancel: () => void;
  onSave: (v: Basics) => void;
  enableEmailEdit?: boolean;
  fixedAvatarColor?: string;
}) {
  const [v, setV] = React.useState<Basics>(initial);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [emailErr, setEmailErr] = React.useState("");
  const [phoneErr, setPhoneErr] = React.useState("");
  const [linkedinErr, setLinkedinErr] = React.useState("");
  const [websiteErr, setWebsiteErr] = React.useState("");

  const canSubmit =
    v.first_name?.trim() &&
    v.last_name?.trim() &&
    v.email?.trim() &&
    !emailErr &&
    !phoneErr &&
    !linkedinErr &&
    !websiteErr;

  const computeEmailError = (val: string) => {
    if (!val.trim()) return "Email is required.";
    // simple, permissive RFC5322-ish check — good enough to catch typos
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return "Enter a valid email address.";
    return "";
  };
  const validateEmail = (val: string) => setEmailErr(computeEmailError(val));

  const computePhoneError = (val: string) => {
    if (!val.trim()) return "";
    const cleaned = val.trim();
    const onlyAllowedChars = /^\+?[\d\s().-]+$/.test(cleaned);
    const digitCount = cleaned.replace(/\D/g, "").length;
    if (!onlyAllowedChars || digitCount < 6 || digitCount > 15) {
      return "Enter a valid phone number (6–15 digits).";
    }
    return "";
  };
  const validatePhone = (val: string) => setPhoneErr(computePhoneError(val));

  const computeUrlError = (val: string) => {
    if (!val.trim()) return "";
    try {
      const normalized = val.match(/^https?:\/\//i) ? val : `https://${val}`;
      const u = new URL(normalized);
      if (!/^https?:$/.test(u.protocol)) throw new Error("Only http(s) allowed");
      return "";
    } catch {
      return "Enter a valid URL (e.g., https://example.com)";
    }
  };
  const validateUrlField = (val: string, setter: (msg: string) => void) => setter(computeUrlError(val));

  const normalizeUrl = (val?: string) =>
    val && val.trim() ? (val.match(/^https?:\/\//i) ? val.trim() : `https://${val.trim()}`) : "";

  const onFilePick = (file?: File) => {
    if (!file) return;
    if (!/image\/(jpeg|png|webp)/.test(file.type)) {
      setErrorMsg("Only JPG, PNG, or WebP files are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Max file size is 2MB.");
      return;
    }
    setErrorMsg("");
    const reader = new FileReader();
    reader.onload = () =>
      setV((s) => ({ ...s, avatar_url: String(reader.result) }));
    reader.readAsDataURL(file);
  };


  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();

        // Compute fresh (state set here wouldn't be visible until the next
        // render, so the canSubmit check below would otherwise use stale
        // error values from before this submit attempt).
        const freshEmailErr = enableEmailEdit ? computeEmailError(v.email || "") : "";
        const freshPhoneErr = computePhoneError(v.phone || "");
        const freshLinkedinErr = computeUrlError(v.linkedin || "");
        const freshWebsiteErr = computeUrlError(v.website || "");

        setEmailErr(freshEmailErr);
        setPhoneErr(freshPhoneErr);
        setLinkedinErr(freshLinkedinErr);
        setWebsiteErr(freshWebsiteErr);

        if (
          !v.first_name?.trim() ||
          !v.last_name?.trim() ||
          !v.email?.trim() ||
          freshEmailErr ||
          freshPhoneErr ||
          freshLinkedinErr ||
          freshWebsiteErr
        ) {
          return;
        }

        onSave({
          ...v,
          linkedin: normalizeUrl(v.linkedin),
          website: normalizeUrl(v.website),
        });
      }}
    >
      {/* ...other parts of the form remain unchanged... */}
      {/* Avatar, Name, Summary, etc. */}
      
      {/* To keep this shorter, only the tags-related section is included here. */}
      {/* Copy-paste the whole function. */}
      
      {/* ... other inputs ... */}

      <div className="flex items-center gap-4">
        <Avatar className="size-20 border">
          {v.avatar_url ? (
            <AvatarImage src={v.avatar_url} alt="Preview" />
          ) : null}
          <AvatarFallback 
            style={{ backgroundColor: fixedAvatarColor || getAvatarColorFromEmail(v.email) }}
            className="text-xl text-white font-semibold"
          >
            {getInitials(v.first_name, v.last_name, v.email)}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2">
          <label htmlFor="profile-upload" className="inline-flex">
            <Button type="button" variant="outline" asChild className="btn btn--md">
              <span>
                <svg
                  className="me-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload Image
              </span>
            </Button>
          </label>
          <input
            id="profile-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => onFilePick(e.target.files?.[0])}
          />
          <p className="text-xs text-muted-foreground">
            Square image, up to 2MB. JPG, PNG, or WebP.
          </p>
          {errorMsg ? (
            <p className="text-xs text-destructive">{errorMsg}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">First name *</label>
          <input
            className={`${inputCls} profejoo-input--primary`}
            value={v.first_name || ""}
            onChange={(e) => setV({ 
              ...v, 
              first_name: e.target.value,
              full_name: `${e.target.value} ${v.last_name || ""}`.trim()
            })}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Last name *</label>
          <input
            className={`${inputCls} profejoo-input--primary`}
            value={v.last_name || ""}
            onChange={(e) => setV({ 
              ...v, 
              last_name: e.target.value,
              full_name: `${v.first_name || ""} ${e.target.value}`.trim()
            })}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Summary</label>
        <textarea
          className={`${inputCls} profejoo-input--primary py-2 min-h-[80px] resize-y`}
          value={v.summary || ""}
          onChange={(e) => setV({ ...v, summary: e.target.value })}
          placeholder="A brief professional summary..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Gender</label>
          <select
            className={`${inputCls} profejoo-input--tertiary`}
            value={v.gender || ""}
            onChange={(e) => setV({ ...v, gender: e.target.value })}
          >
            <option value="" disabled>Select gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Birthday</label>
          <input
            type="date"
            className={`${inputCls} profejoo-input--primary`}
            value={v.birthday || ""}
            onChange={(e) => setV({ ...v, birthday: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">City</label>
          <input
            className={`${inputCls} profejoo-input--primary`}
            value={v.city || ""}
            onChange={(e) => setV({ ...v, city: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Country</label>
          <input
            className={`${inputCls} profejoo-input--primary`}
            value={v.country || ""}
            onChange={(e) => setV({ ...v, country: e.target.value })}
          />
        </div>
        <div className="grid gap-2 md:col-span-2">
          <label className="text-sm font-medium">Location (Full text)</label>
          <input
            className={`${inputCls} profejoo-input--primary`}
            value={v.location || ""}
            placeholder="e.g. Remote, Worldwide"
            onChange={(e) => setV({ ...v, location: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Email *</label>
          <input
            type="email"
            disabled={!enableEmailEdit}
            className={
              enableEmailEdit
                ? `${inputCls} profejoo-input--primary`
                : "h-10 rounded-[var(--radius-md)] border bg-muted px-3 text-sm cursor-not-allowed"
            }
            value={v.email}
            readOnly={!enableEmailEdit}
            aria-invalid={enableEmailEdit && !!emailErr}
            onChange={
              enableEmailEdit
                ? (e) => {
                    setV({ ...v, email: e.target.value });
                    validateEmail(e.target.value);
                  }
                : undefined
            }
            onBlur={enableEmailEdit ? (e) => validateEmail(e.target.value) : undefined}
          />
          {enableEmailEdit && emailErr ? (
            <p className="text-xs text-destructive">{emailErr}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Phone</label>
          <input
            className={`${inputCls} profejoo-input--primary`}
            value={v.phone || ""}
            aria-invalid={!!phoneErr}
            onChange={(e) => {
              setV({ ...v, phone: e.target.value });
              validatePhone(e.target.value);
            }}
            onBlur={(e) => validatePhone(e.target.value)}
            placeholder="e.g., +49 151 2345 6789"
          />
          {phoneErr ? <p className="text-xs text-destructive">{phoneErr}</p> : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">LinkedIn</label>
          <input
            className={`${inputCls} profejoo-input--primary`}
            value={v.linkedin || ""}
            placeholder="https://linkedin.com/in/..."
            aria-invalid={!!linkedinErr}
            onChange={(e) => {
              setV({ ...v, linkedin: e.target.value });
              validateUrlField(e.target.value, setLinkedinErr);
            }}
            onBlur={(e) => validateUrlField(e.target.value, setLinkedinErr)}
          />
          {linkedinErr ? <p className="text-xs text-destructive">{linkedinErr}</p> : null}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Website</label>
          <input
            className={`${inputCls} profejoo-input--primary`}
            value={v.website || ""}
            placeholder="https://yourdomain.com"
            aria-invalid={!!websiteErr}
            onChange={(e) => {
              setV({ ...v, website: e.target.value });
              validateUrlField(e.target.value, setWebsiteErr);
            }}
            onBlur={(e) => validateUrlField(e.target.value, setWebsiteErr)}
          />
          {websiteErr ? <p className="text-xs text-destructive">{websiteErr}</p> : null}
        </div>
      </div>
      
      {/* Tags / Skills — shared chip-style input, same component used everywhere else */}
      <div className="grid gap-2">
        <label className="text-sm font-medium">Tags / Skills</label>
        <TagInput
          value={v.tags ?? []}
          onChange={(tags) => setV((prev) => ({ ...prev, tags }))}
          placeholder="Type a skill and press Enter..."
        />
      </div>

      <div className="mt-2 flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
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
          Save
        </Button>
      </div>
    </form>
  );
}
