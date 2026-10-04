// src/hooks/useProfileSectionCounts.ts
import * as React from "react";
import type { ProfileData } from "@/types/profile";
import type { Counts } from "@/lib/profileCompleteness";
import { countByOutputType } from "@/lib/outputType";

const EMPTY_COUNTS: Counts = {
  education: 0,
  experience: 0,
  publications: 0,
  projects: 0,
  talks: 0,
  honors: 0,
  credentials: 0,
  skillGroups: 0,
  links: 0,
  languages: 0,
  interests: 0,
  extras: 0,
};

function computeCounts(data?: ProfileData | null): Counts {
  if (!data) return EMPTY_COUNTS;

  const outputCounts = countByOutputType(data.output);

  return {
    education: data.academics?.length ?? 0,
    experience: data.experience?.length ?? 0,
    publications: outputCounts.publication,
    projects: outputCounts.project,
    talks: outputCounts.talk,
    honors: outputCounts.honor_and_award,
    credentials: data.credentials?.length ?? 0,
    skillGroups: data.skill_groups?.length ?? 0,
    links: data.links?.length ?? 0,
    languages: data.languages?.length ?? 0,
    interests: data.interests?.length ?? 0,
    extras: data.extras?.length ?? 0,
  };
}

/**
 * Derives the Profile-tab item counts (education, experience, publications,
 * projects, talks, honors, ...) straight from ProfileData, using the
 * canonical output-type classifier. Recomputes whenever `data` changes.
 *
 * Sections that manage their own sub-list (e.g. the four output-type
 * sections) can still report a locally-adjusted count upward via the
 * `applyOverride` callback returned here — this only reconciles what the
 * initial/steady-state numbers should be from the profile itself.
 */
export function useProfileSectionCounts(data?: ProfileData | null): {
  counts: Counts;
  setCounts: React.Dispatch<React.SetStateAction<Counts>>;
  applyOverride: (update: Partial<Counts>) => void;
} {
  const [counts, setCounts] = React.useState<Counts>(() => computeCounts(data));

  React.useEffect(() => {
    setCounts(computeCounts(data));
  }, [data]);

  const applyOverride = React.useCallback((update: Partial<Counts>) => {
    setCounts((prev) => ({ ...prev, ...update }));
  }, []);

  return { counts, setCounts, applyOverride };
}
