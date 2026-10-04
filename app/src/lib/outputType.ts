// src/lib/outputType.ts
//
// Single source of truth for classifying "output" entries (the profile's
// combined Publications / Projects / Talks / Honors & Awards list).
//
// Backend schema (see src/types/profile.ts, OutputEntry.type) only ever
// stores one of these four lowercase/snake_case values:
//   "publication" | "project" | "talk" | "honor_and_award"
//
// The UI historically re-implemented this classification in ~7 different
// places (profileAdapter.ts, resumeAdapter.ts, Profile.tsx, ResumeFromProfilePage.tsx,
// ResumeScratchPageNew.tsx, ResumeBuilderPage.tsx, and each of the four
// Publications/Projects/Talks/Honors section components) with inconsistent
// casing, which caused Projects/Talks/Honors to be silently saved to the
// backend as "publication". Every call site should import from here instead
// of writing another ad hoc string comparison.

export const OUTPUT_TYPES = [
  "publication",
  "project",
  "talk",
  "honor_and_award",
] as const;

export type OutputType = (typeof OUTPUT_TYPES)[number];

// Human-facing label used by the Add/Edit form's Select dropdown and by
// anywhere else that needs to show the type to the user.
export type OutputTypeLabel = "Paper" | "Project" | "Talk" | "Honor and Award";

const TYPE_TO_LABEL: Record<OutputType, OutputTypeLabel> = {
  publication: "Paper",
  project: "Project",
  talk: "Talk",
  honor_and_award: "Honor and Award",
};

/**
 * Normalizes ANY variant we might encounter — backend snake_case, UI Title
 * Case, stray casing/spacing from hand-written overrides, legacy "paper" —
 * into the canonical backend OutputType. Falls back to "publication" only
 * when nothing else matches (this mirrors the pre-existing default behavior
 * so unclassified/legacy rows still show up somewhere instead of vanishing).
 */
export function normalizeOutputType(raw?: string | null): OutputType {
  const t = (raw || "").trim().toLowerCase().replace(/[\s_]+/g, " ");

  if (t.includes("honor") || t.includes("award")) return "honor_and_award";
  if (t.includes("talk")) return "talk";
  if (t === "project") return "project";
  // "paper", "publication", "", and anything unrecognized:
  return "publication";
}

/** True if `raw` (in any casing/format) classifies as `type`. */
export function isOutputType(raw: string | undefined | null, type: OutputType): boolean {
  return normalizeOutputType(raw) === type;
}

/** Canonical backend value -> the label the form/UI should display. */
export function outputTypeToLabel(type?: string | null): OutputTypeLabel {
  return TYPE_TO_LABEL[normalizeOutputType(type)];
}

/** Convenience: filter a list of `{ type }` items down to one bucket. */
export function filterByOutputType<T extends { type?: string | null }>(
  items: T[] | undefined,
  type: OutputType
): T[] {
  return (items || []).filter((item) => isOutputType(item.type, type));
}

/** Convenience: count, per type, in one pass over the list. */
export function countByOutputType(
  items: Array<{ type?: string | null }> | undefined
): Record<OutputType, number> {
  const counts: Record<OutputType, number> = {
    publication: 0,
    project: 0,
    talk: 0,
    honor_and_award: 0,
  };
  for (const item of items || []) {
    counts[normalizeOutputType(item.type)] += 1;
  }
  return counts;
}
