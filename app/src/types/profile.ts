// Profile API Types - Based on Backend Schema

export const SECTIONS = [
  "basics",
  "academics",
  "experience",
  "output",
  "credentials",
  "skills",
  "interests",
  "languages",
  "extras",
] as const;

export type SectionKey = (typeof SECTIONS)[number];

/* ====================== Main Profile Response ====================== */

export interface ProfileResponse {
  profile_id: number;
  completeness: number;
  data: ProfileData;
  updated_at: string;
}

/* ====================== Complete Profile Data ====================== */

export interface ProfileData {
  basics?: ProfileBasics;
  academics?: AcademicEntry[];
  experience?: ExperienceEntry[];
  output?: OutputEntry[];
  credentials?: CredentialEntry[];
  skill_groups?: SkillGroup[];
  links?: ProfileLink[];
  interests?: string[];
  languages?: string[];
  extras?: ExtraEntry[];
}

/* ====================== Profile Basics ====================== */

export interface ProfileBasics {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  avatar_url?: string;
  birthday?: string; // ISO date
  gender?: string;
  summary?: string;
  tags?: string[];
}

/* ====================== Academic Entry ====================== */

export interface AcademicEntry {
  title?: string;
  institution?: string;
  location?: string;
  start?: string; // YYYY-MM format
  end?: string; // YYYY-MM format
  gpa?: string;
  gpa_format?: string;
  description?: string;
}

/* ====================== Experience Entry ====================== */

export interface ExperienceEntry {
  type?: "work" | "ra" | "ta";
  title?: string;
  organization?: string;
  location?: string;
  start?: string; // YYYY-MM format
  end?: string; // YYYY-MM format
  current?: boolean;
  employment_type?: string;
  work_arrangement?: string;
  professor?: string; // For RA/TA
  description?: string;
  bullets?: string[];
  tags?: string[];
}

/* ====================== Output Entry ====================== */

export interface OutputEntry {
  title?: string;
  type?: "publication" | "project" | "talk" | "honor_and_award";
  venue?: string;
  year?: string;
  link?: string;
  summary?: string;
  tags?: string[];
}

/* ====================== Credential Entry ====================== */

export interface CredentialEntry {
  title?: string;
  issuer?: string;
  year?: string;
  link?: string;
  description?: string;
}

/* ====================== Skill Group ====================== */

export interface SkillGroup {
  name?: string;
  items?: string[];
}

/* ====================== Profile Link ====================== */

export interface ProfileLink {
  title?: string;
  url?: string;
}

/* ====================== Extra Entry ====================== */

export interface ExtraEntry {
  title?: string;
  organization?: string;
  location?: string;
  start?: string;
  end?: string;
  bullets?: string[];
  tags?: string[];
}
