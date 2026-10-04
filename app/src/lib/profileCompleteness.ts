// src/lib/profileCompleteness.ts
//
// Shared "how many items are in each Profile tab" shape, used by
// Profile.tsx, ProfileTabs.tsx, ResumeScratchPageNew.tsx and
// useProfileSectionCounts.ts.
//
// For the completeness *percentage*, see calculateCompleteness in
// ./completeness.ts — this file only holds the per-section item counts.

export type Counts = {
  education: number;
  experience: number;
  publications: number;
  projects: number;
  talks: number;
  honors: number;
  credentials: number;
  skillGroups: number;
  links: number;
  languages: number;
  interests: number;
  extras: number;
};