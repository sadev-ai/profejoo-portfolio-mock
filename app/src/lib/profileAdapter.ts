// src/lib/profileAdapter.ts
// Adapter functions to convert between API format and UI format

import type {
  ProfileData,
  ProfileBasics,
  AcademicEntry,
  ExperienceEntry,
  OutputEntry,
  CredentialEntry,
  SkillGroup,
  ProfileLink,
  ExtraEntry,
} from "@/types/profile";
import { normalizeOutputType, outputTypeToLabel, type OutputTypeLabel } from "@/lib/outputType";

/* ====================== Basics Adapter ====================== */

export interface UIBasics {
  firstName: string;
  lastName: string;
  email: string;
  city?: string;
  country?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  chips?: string[];
  gender?: string;
  birthday?: string;
  avatarDataUrl?: string;
  summary?: string;
}

const normalizeGender = (value?: string) => {
  const normalized = (value || "").toLowerCase();
  if (normalized === "male" || normalized === "female") return normalized;
  return "";
};

export function apiBasicsToUI(basics?: ProfileBasics): UIBasics {
  return {
    firstName: basics?.first_name || "",
    lastName: basics?.last_name || "",
    email: basics?.email || "",
    city: basics?.city || "",
    country: basics?.country || "",
    phone: basics?.phone || "",
    website: basics?.website || "",
    linkedin: basics?.linkedin || "",
    chips: basics?.tags || [],
    gender: normalizeGender(basics?.gender),
    birthday: basics?.birthday || "",
    avatarDataUrl: basics?.avatar_url || "",
    summary: basics?.summary || "",
  };
}

export function uiBasicsToAPI(ui: UIBasics): ProfileBasics {
  return {
    first_name: ui.firstName,
    last_name: ui.lastName,
    full_name: `${ui.firstName} ${ui.lastName}`.trim(),
    email: ui.email,
    city: ui.city,
    country: ui.country,
    location: [ui.city, ui.country].filter(Boolean).join(", "),
    phone: ui.phone,
    website: ui.website,
    linkedin: ui.linkedin,
    tags: ui.chips,
    gender: ui.gender || undefined,
    birthday: ui.birthday,
    avatar_url: ui.avatarDataUrl,
    summary: ui.summary,
  };
}

/* ====================== Academic Adapter ====================== */

export interface UIEducation {
  id: string;
  level?: string;
  major?: string;
  institution?: string;
  city?: string;
  country?: string;
  start?: string;
  end?: string;
  current?: boolean;
  gpa?: string;
  gpaFormat?: string;
  thesis?: string;
}

export function apiAcademicsToUI(academics?: AcademicEntry[]): UIEducation[] {
  if (!academics) return [];
  
  return academics.map((entry, idx) => ({
    id: String(idx + 1),
    level: entry.title?.match(/MSc|BSc|PhD|High school/i)?.[0] || "Other",
    major: entry.title?.replace(/^(MSc|BSc|PhD|High school) in\s*/i, "").trim() || entry.title || "",
    institution: entry.institution || "",
    city: entry.location?.split(",")[0]?.trim() || "",
    country: entry.location?.split(",")[1]?.trim() || "",
    start: entry.start?.substring(0, 7) || "",
    end: entry.end?.substring(0, 7) || "",
    current: !entry.end,
    gpa: entry.gpa || "",
    gpaFormat: entry.gpa_format || "",
    thesis: entry.description || "",
  }));
}

export function uiAcademicsToAPI(education: UIEducation[]): AcademicEntry[] {
  return education.map((edu) => ({
    title: edu.major ? `${edu.level || ""} in ${edu.major}`.trim() : edu.level || "",
    institution: edu.institution,
    location: [edu.city, edu.country].filter(Boolean).join(", "),
    start: edu.start?.substring(0, 7), // YYYY-MM format
    end: edu.current ? undefined : edu.end?.substring(0, 7),
    gpa: edu.gpa,
    gpa_format: edu.gpaFormat,
    description: edu.thesis,
  }));
}

/* ====================== Experience Adapter ====================== */

export interface UIExperience {
  id: string;
  experienceType: "work" | "ra" | "ta";
  title?: string;
  org?: string;
  location?: string;
  start?: string;
  end?: string;
  currently?: boolean;
  professor?: string;
  description?: string;
  bullets?: string[];
  tags?: string[];
  workType?: string;
  workArrangement?: string;
}

export function apiExperienceToUI(experience?: ExperienceEntry[]): UIExperience[] {
  if (!experience) return [];
  
  return experience.map((entry, idx) => ({
    id: String(idx + 1),
    experienceType: (entry.type as "work" | "ra" | "ta") || "work",
    title: entry.title || "",
    org: entry.organization || "",
    location: entry.location || "",
    start: entry.start?.substring(0, 7) || "",
    end: entry.end?.substring(0, 7) || "",
    currently: entry.current || false,
    professor: entry.professor || "",
    description: entry.description || "",
    bullets: entry.bullets || [],
    tags: entry.tags || [],
    workType: entry.employment_type || "",
    workArrangement: entry.work_arrangement || "",
  }));
}

export function uiExperienceToAPI(experience: UIExperience[]): ExperienceEntry[] {
  return experience.map((exp) => ({
    type: exp.experienceType,
    title: exp.title,
    organization: exp.org,
    location: exp.location,
    start: exp.start?.substring(0, 7), // YYYY-MM format
    end: exp.currently ? undefined : exp.end?.substring(0, 7),
    current: exp.currently,
    professor: exp.professor,
    description: exp.description,
    bullets: exp.bullets,
    tags: exp.tags,
    employment_type: exp.workType,
    work_arrangement: exp.workArrangement,
  }));
}

/* ====================== Output Adapter ====================== */

export interface UIOutput {
  id: string;
  title?: string;
  type: OutputTypeLabel;
  venue?: string;
  year?: string;
  link?: string;
  summary?: string;
  tags?: string[];
}

export function apiOutputToUI(output?: OutputEntry[]): UIOutput[] {
  if (!output) return [];

  return output.map((entry, idx) => ({
    id: String(idx + 1),
    title: entry.title || "",
    type: outputTypeToLabel(entry.type),
    venue: entry.venue || "",
    year: entry.year || "",
    link: entry.link || "",
    summary: entry.summary || "",
    tags: entry.tags || [],
  }));
}

export function uiOutputToAPI(output: UIOutput[]): OutputEntry[] {
  return output.map((item) => ({
    title: item.title,
    type: normalizeOutputType(item.type),
    venue: item.venue,
    year: item.year,
    link: item.link,
    summary: item.summary,
    tags: item.tags,
  }));
}

/* ====================== Credentials Adapter ====================== */

export interface UICredential {
  id: string;
  title?: string;
  issuer?: string;
  year?: string;
  link?: string;
  description?: string;
}

export function apiCredentialsToUI(credentials?: CredentialEntry[]): UICredential[] {
  if (!credentials) return [];
  
  return credentials.map((entry, idx) => ({
    id: String(idx + 1),
    title: entry.title || "",
    issuer: entry.issuer || "",
    year: entry.year || "",
    link: entry.link || "",
    description: entry.description || "",
  }));
}

export function uiCredentialsToAPI(credentials: UICredential[]): CredentialEntry[] {
  return credentials.map((cred) => ({
    title: cred.title,
    issuer: cred.issuer,
    year: cred.year,
    link: cred.link,
    description: cred.description,
  }));
}

/* ====================== Skills Adapter ====================== */

export interface UISkillStack {
  id: string;
  group?: string;
  items?: string[];
}

export interface UISkillLink {
  id: string;
  title?: string;
  href?: string;
}

export function apiSkillsToUI(
  skillGroups?: SkillGroup[],
  links?: ProfileLink[]
): { stacks: UISkillStack[]; links: UISkillLink[] } {
  const stacks = (skillGroups || []).map((group, idx) => ({
    id: String(idx + 1),
    group: group.name || "",
    items: group.items || [],
  }));

  const uiLinks = (links || []).map((link, idx) => ({
    id: String(idx + 1),
    title: link.title || "",
    href: link.url || "",
  }));

  return { stacks, links: uiLinks };
}

export function uiSkillsToAPI(
  stacks: UISkillStack[],
  links: UISkillLink[]
): { skill_groups: SkillGroup[]; links: ProfileLink[] } {
  const skill_groups = stacks.map((stack) => ({
    name: stack.group,
    items: stack.items,
  }));

  const profileLinks = links.map((link) => ({
    title: link.title,
    url: link.href,
  }));

  return { skill_groups, links: profileLinks };
}

/* ====================== Extras Adapter ====================== */

export interface UIExtra {
  id: string;
  k?: string;
  v?: string;
  title?: string;
  organization?: string;
  location?: string;
  start?: string;
  end?: string;
  bullets?: string[];
  tags?: string[];
}

export function apiExtrasToUI(extras?: ExtraEntry[]): UIExtra[] {
  if (!extras) return [];
  
  return extras.map((entry, idx) => ({
    id: String(idx + 1),
    title: entry.title || "",
    organization: entry.organization || "",
    location: entry.location || "",
    start: entry.start?.substring(0, 7) || "",
    end: entry.end?.substring(0, 7) || "",
    bullets: entry.bullets || [],
    tags: entry.tags || [],
    k: entry.title,
    v: entry.bullets?.join(", ") || "",
  }));
}

export function uiExtrasToAPI(extras: UIExtra[]): ExtraEntry[] {
  return extras.map((extra) => ({
    title: extra.title || extra.k,
    organization: extra.organization,
    location: extra.location,
    // Fix for the extras date issue: added a substring
    start: extra.start?.substring(0, 7),
    end: extra.end?.substring(0, 7),
    bullets: extra.bullets,
    tags: extra.tags,
  }));
}

/* ====================== Complete Profile Adapter ====================== */

export interface UIProfileData {
  basics: UIBasics;
  academics: {
    education: UIEducation[];
  };
  experience: UIExperience[];
  output: UIOutput[];
  credentials: UICredential[];
  skills: {
    stacks: UISkillStack[];
    links: UISkillLink[];
  };
  interests: string[];
  languages: string[];
  extras: UIExtra[];
}

export function apiProfileToUI(data?: ProfileData): UIProfileData {
  const skills = apiSkillsToUI(data?.skill_groups, data?.links);
  
  return {
    basics: apiBasicsToUI(data?.basics),
    academics: {
      education: apiAcademicsToUI(data?.academics),
    },
    experience: apiExperienceToUI(data?.experience),
    output: apiOutputToUI(data?.output),
    credentials: apiCredentialsToUI(data?.credentials),
    skills,
    interests: data?.interests || [],
    languages: data?.languages || [],
    extras: apiExtrasToUI(data?.extras),
  };
}