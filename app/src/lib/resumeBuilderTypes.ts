// src/lib/resumeBuilderTypes.ts
//
// Shared types, constants, and small pure helpers for the visual Resume
// Builder (templates + the page + the adapter that converts to/from the
// backend's `sections` shape). Extracted out of ResumeBuilderPage.tsx,
// which used to define all of this — plus five full template components —
// in one 1,380-line file.
//
// This file is intentionally plain TypeScript (no JSX): SECTION_OPTIONS
// below references icons by name (a string) rather than as JSX elements,
// and the lookup to an actual icon component happens in ResumeBuilderPage.tsx,
// which is a .tsx file. A .ts file cannot contain JSX at all — the parser
// doesn't support it — so keeping icons as data here and rendering them
// only where JSX is valid is a correctness requirement, not just a style
// choice.
import * as React from "react";

export type SectionIconName = "User" | "Briefcase" | "BookOpen" | "FileText" | "Sparkles" | "Award" | "Globe2" | "Mic";

export type FontOption = { id: "nunito" | "serif" | "mono" | "calibri" | "garamond"; label: string; family: string; };
export type PaletteOption = { id: "primary" | "secondary" | "tertiary" | "accent" | "neutral"; label: string; accent: string; soft: string; line: string; };
export type BuilderTemplate = "academic" | "classic" | "modern" | "compact" | "milestone" | "minimal" | "executive" | "timeline" | "balanced" | "profile";

export type SectionVisibility = {
  basics: boolean; summary: boolean; experience: boolean; education: boolean;
  skills: boolean; publications: boolean; projects: boolean; talks: boolean;
  honors: boolean; credentials: boolean; additional: boolean;
};

export type SectionKey = Exclude<keyof SectionVisibility, "basics">;

// DisplayExperience/Education/Credential intentionally carry more fields
// than the visual editor currently exposes controls for (current,
// employment/work-arrangement type, professor, gpa, description, link,
// tags...). These used to be silently dropped every time a resume was
// saved from this page, because the reconstruction step only knew about
// the handful of fields the UI could edit. Keeping them here — populated
// on load, passed straight through on save unless the field itself is one
// the UI can edit — is what stops that data loss.
export type DisplayExperience = {
  title: string; org: string; dates: string; location: string; bullets: string[];
  current?: boolean;
  type?: "work" | "ra" | "ta";
  employmentType?: string;
  workArrangement?: string;
  professor?: string;
  tags?: string[];
};

export type DisplayEducation = {
  title: string; institution: string; dates: string; location: string;
  gpa?: string;
  gpaFormat?: string;
  description?: string;
};

// `type` now actually gets populated (see buildDisplayData) instead of
// being declared but always undefined — that was the root of talks and
// honors silently turning into "Projects" once a resume reached this page.
export type DisplayOutput = {
  title: string; venue: string; year: string; summary: string;
  type?: "publication" | "project" | "talk" | "honor_and_award";
  link?: string;
  tags?: string[];
};

export type DisplayCredential = {
  title: string; issuer: string; year: string;
  description?: string;
  link?: string;
};

export type DisplaySkillGroup = { name: string; items: string[]; };
export type DisplayLink = { title: string; url: string; };

// `detail` remains the single free-text field the visual editor exposes;
// organization/location/start/end/bullets/tags are preserved alongside it
// so they survive a save even though there's no dedicated control for them
// yet (previously bullets/tags were dropped entirely, and end date was
// silently merged into start / lost on every save).
export type DisplayExtra = {
  title: string;
  detail: string;
  organization?: string;
  location?: string;
  start?: string;
  end?: string;
  bullets?: string[];
  tags?: string[];
};

export type DisplayData = {
  name: string; headline: string; summary: string; contacts: string[];
  experience: DisplayExperience[]; education: DisplayEducation[];
  publications: DisplayOutput[]; projects: DisplayOutput[];
  talks: DisplayOutput[]; honors: DisplayOutput[];
  credentials: DisplayCredential[]; skills: DisplaySkillGroup[];
  languages: string[]; interests: string[]; links: DisplayLink[]; extras: DisplayExtra[];
  avatarUrl?: string;
  // Full basics.tags array. `headline` is just tags[0] for display/editing;
  // any further tags (Profile's Basics section supports a whole chip-list of
  // them) have no dedicated control here yet, so they're kept here and
  // passed straight through on save instead of being overwritten down to a
  // single value.
  tags: string[];
};

export const FONT_OPTIONS: FontOption[] = [
  { id: "nunito", label: "Nunito (Default)", family: '"Nunito", "Trebuchet MS", sans-serif' },
  { id: "serif", label: "Georgia Serif", family: '"Georgia", "Times New Roman", serif' },
  { id: "mono", label: "Mono", family: '"Courier New", "Lucida Console", monospace' },
  { id: "calibri", label: "Calibri Modern", family: '"Calibri", "Segoe UI", sans-serif' },
  { id: "garamond", label: "Garamond Classic", family: '"Garamond", "Times New Roman", serif' },
];

export const PALETTE_OPTIONS: PaletteOption[] = [
  { id: "primary", label: "Profejoo Indigo", accent: "var(--primary-400)", soft: "var(--primary-50)", line: "var(--primary-300)" },
  { id: "secondary", label: "Calm Teal", accent: "var(--secondary-400)", soft: "var(--secondary-50)", line: "var(--secondary-300)" },
  { id: "tertiary", label: "Slate Text", accent: "var(--tertiary-400)", soft: "var(--tertiary-50)", line: "var(--tertiary-300)" },
  { id: "accent", label: "Warm Accent", accent: "var(--accent-400)", soft: "var(--accent-50)", line: "var(--accent-300)" },
  { id: "neutral", label: "Neutral Black/White", accent: "#111111", soft: "#f8f8f8", line: "#d1d5db" },
];

export const TEMPLATE_OPTIONS = [
  { id: "academic", name: "Academic", description: "Structured column with sidebar for contacts." },
  { id: "classic", name: "Classic", description: "Centered header with balanced two-column body." },
  { id: "modern", name: "Modern", description: "Bold header with balanced two-column body." },
  { id: "compact", name: "Compact", description: "Tight single-column layout for short resumes." },
  { id: "milestone", name: "Milestone", description: "Timeline cards arranged by priority." },
  { id: "minimal", name: "Minimal", description: "Spacious single column with light, rule-free typography." },
  { id: "executive", name: "Executive", description: "Bordered header card with a shaded sidebar on the right." },
  { id: "timeline", name: "Timeline", description: "Single column with a colored rail down each section." },
  { id: "balanced", name: "Balanced", description: "Even two-column spread split by a vertical divider." },
  { id: "profile", name: "Profile", description: "Photo-forward header with filled, pill-style section labels." },
];

export const DEFAULT_VISIBILITY: SectionVisibility = {
  basics: true, summary: true, experience: true, education: true, skills: true,
  publications: true, projects: true, talks: true, honors: true, credentials: true, additional: true,
};

export const SECTION_OPTIONS: Array<{ key: string; label: string; helper: string; icon: SectionIconName }> = [
  { key: "basics", label: "Basics", helper: "Name, headline, and contact details.", icon: "User" },
  { key: "summary", label: "Summary", helper: "Short intro at the top of the resume.", icon: "Sparkles" },
  { key: "experience", label: "Experience", helper: "Roles, internships, and positions.", icon: "Briefcase" },
  { key: "education", label: "Education", helper: "Academic history and degrees.", icon: "BookOpen" },
  { key: "skills", label: "Skills", helper: "Skill groups and tags.", icon: "Sparkles" },
  { key: "projects", label: "Projects", helper: "Personal and academic projects.", icon: "FileText" },
  { key: "publications", label: "Publications", helper: "Research papers and articles.", icon: "FileText" },
  { key: "talks", label: "Talks", helper: "Invited talks and conference presentations.", icon: "Mic" },
  { key: "honors", label: "Honors & Awards", helper: "Fellowships, awards, and honors.", icon: "Award" },
  { key: "credentials", label: "Credentials", helper: "Certificates and exams.", icon: "Award" },
  { key: "additional", label: "Additional", helper: "Languages, links, and extra items.", icon: "Globe2" },
];

export const SECTION_SEQUENCE: SectionKey[] = ["summary", "experience", "education", "skills", "projects", "publications", "talks", "honors", "credentials", "additional"];
export const SECTION_LABELS: Record<SectionKey, string> = {
  summary: "Summary", experience: "Experience", education: "Education", skills: "Skills",
  projects: "Projects", publications: "Publications", talks: "Talks", honors: "Honors & Awards",
  credentials: "Credentials", additional: "Additional",
};

export const cleanText = (value?: string) => (value || "").trim();
export const stripHtml = (value: string) => value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
export const normalizeUrl = (value?: string) => {
  const raw = cleanText(value);
  if (!raw) return "";
  if (/^(https?:|mailto:|tel:)/i.test(raw)) return raw;
  return `https://${raw}`;
};

export const formatDateRange = (start?: string, end?: string) => {
  const startValue = cleanText(start);
  const endValue = cleanText(end);
  if (startValue && endValue) return `${startValue} - ${endValue}`;
  return startValue || endValue || "";
};

/** Reverses formatDateRange: "2020-01 - 2022-05" -> { start, end }. */
export const parseDateRange = (dates?: string): { start: string; end: string } => {
  const raw = cleanText(dates);
  if (!raw) return { start: "", end: "" };
  const parts = raw.split(" - ");
  return { start: cleanText(parts[0]), end: cleanText(parts[1]) };
};

export const buildPreviewStyle = (palette: PaletteOption, font: FontOption) => ({
  fontFamily: font.family,
  "--resume-accent": palette.accent,
  "--resume-soft": palette.soft,
  "--resume-line": palette.line,
} as React.CSSProperties);

export const insertItem = <T,>(items: T[], index: number | undefined, item: T) => {
  const next = [...items];
  const targetIndex = index === undefined ? next.length : Math.max(0, Math.min(index, next.length));
  next.splice(targetIndex, 0, item);
  return next;
};

export const createExperience = (): DisplayExperience => ({ title: "", org: "", dates: "", location: "", bullets: [""] });
export const createEducation = (): DisplayEducation => ({ title: "", institution: "", dates: "", location: "" });
export const createOutput = (type: DisplayOutput["type"]): DisplayOutput => ({ title: "", venue: "", year: "", summary: "", type });
export const createCredential = (): DisplayCredential => ({ title: "", issuer: "", year: "" });
export const createSkillGroup = (): DisplaySkillGroup => ({ name: "", items: [] });
export const createLink = (): DisplayLink => ({ title: "", url: "" });
export const createExtra = (): DisplayExtra => ({ title: "", detail: "" });

export type SectionDragHandlers = { draggingSection: SectionKey | null; onDragStart: (key: SectionKey) => (event: React.DragEvent) => void; onDragOver: (event: React.DragEvent) => void; onDrop: (key: SectionKey) => (event: React.DragEvent) => void; onDragEnd: () => void; };

export type TemplateEditHandlers = {
  updateBasics: (patch: Partial<DisplayData>) => void;
  updateContact: (index: number, value: string) => void;
  updateExperience: (index: number, patch: Partial<DisplayExperience>) => void;
  updateExperienceBullet: (index: number, bulletIndex: number, value: string) => void;
  updateEducation: (index: number, patch: Partial<DisplayEducation>) => void;
  updatePublication: (index: number, patch: Partial<DisplayOutput>) => void;
  updateProject: (index: number, patch: Partial<DisplayOutput>) => void;
  updateTalk: (index: number, patch: Partial<DisplayOutput>) => void;
  updateHonor: (index: number, patch: Partial<DisplayOutput>) => void;
  updateCredential: (index: number, patch: Partial<DisplayCredential>) => void;
  updateSkillGroup: (index: number, patch: Partial<DisplaySkillGroup>) => void;
  updateLanguage: (index: number, value: string) => void;
  updateInterest: (index: number, value: string) => void;
  updateLink: (index: number, patch: Partial<DisplayLink>) => void;
  updateExtra: (index: number, patch: Partial<DisplayExtra>) => void;
  addContact: (index?: number) => void; removeContact: (index: number) => void;
  addExperience: (index?: number) => void; removeExperience: (index: number) => void;
  addExperienceBullet: (index: number, bulletIndex?: number) => void; removeExperienceBullet: (index: number, bulletIndex: number) => void;
  addEducation: (index?: number) => void; removeEducation: (index: number) => void;
  addPublication: (index?: number) => void; removePublication: (index: number) => void;
  addProject: (index?: number) => void; removeProject: (index: number) => void;
  addTalk: (index?: number) => void; removeTalk: (index: number) => void;
  addHonor: (index?: number) => void; removeHonor: (index: number) => void;
  addCredential: (index?: number) => void; removeCredential: (index: number) => void;
  addSkillGroup: (index?: number) => void; removeSkillGroup: (index: number) => void;
  addLanguage: (index?: number) => void; removeLanguage: (index: number) => void;
  addInterest: (index?: number) => void; removeInterest: (index: number) => void;
  addLink: (index?: number) => void; removeLink: (index: number) => void;
  addExtra: (index?: number) => void; removeExtra: (index: number) => void;
};

export type TemplateProps = { data: DisplayData; visibleSections: SectionVisibility; showPhoto: boolean; sectionOrder: SectionKey[]; dragHandlers: SectionDragHandlers; onEdit: TemplateEditHandlers; };

export const getInitials = (name: string) => name.split(" ").filter(Boolean).map((segment) => segment[0]).slice(0, 2).join("").toUpperCase();
