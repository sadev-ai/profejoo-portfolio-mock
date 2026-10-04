// src/lib/resumeBuilderAdapter.ts
//
// Converts between the backend's `sections` shape (ProfileData-like) and
// the visual Resume Builder's DisplayData editor state, in both directions.
//
// Two bugs used to live in this file's previous, inline-only form (as
// `buildDisplayData` plus a `constructPayload` closure defined directly
// inside ResumeBuilderPage.tsx):
//
// 1. Output items were split only into "publication" vs "everything else",
//    so projects, talks, and honors/awards were all dumped into one
//    "Projects" bucket in the editor — and saving the resume then wrote
//    that bucket back with type "project" for every item in it, permanently
//    reclassifying any talk or honor/award the moment the resume was
//    opened here (this is the "problems when the resume is made from
//    Profile" the person hit, since a profile is far more likely than an
//    empty from-scratch resume to actually have talks/honors in it).
// 2. Several real fields on experience/academics/credentials/extras were
//    read on load but had nowhere to go in DisplayData, so they were
//    silently deleted on the next save: `current`, experience `type`
//    (work/ra/ta), `employment_type`, `work_arrangement`, `professor`,
//    experience tags, education `gpa`/`gpa_format`/`description`,
//    credential `description`/`link`, and an extra's `end` date, bullets,
//    and tags.
//
// Both are fixed here: output keeps its real type through the round trip,
// and every field above is preserved even though the visual editor doesn't
// expose a dedicated control for all of them yet.
import { filterByOutputType, normalizeOutputType } from "@/lib/outputType";
import {
  cleanText,
  formatDateRange,
  parseDateRange,
  type DisplayData,
  type DisplayExperience,
  type DisplayEducation,
  type DisplayOutput,
  type DisplayCredential,
  type DisplaySkillGroup,
  type DisplayLink,
  type DisplayExtra,
} from "@/lib/resumeBuilderTypes";

export const buildDisplayData = (sections?: any, fallbackAvatarUrl?: string): DisplayData => {
  const basics = sections?.basics || {};
  const combinedName = [basics.first_name, basics.last_name].filter(Boolean).join(" ");
  const name = basics.full_name || combinedName || "";
  const basicsTags: string[] = Array.isArray(basics.tags) ? basics.tags.map(cleanText).filter(Boolean) : [];
  const headline = basicsTags[0] || "";
  const location = basics.location || [basics.city, basics.country].filter(Boolean).join(", ");
  const contacts = [basics.email, basics.phone, location, basics.website, basics.linkedin].map(cleanText).filter(Boolean);

  const experience: DisplayExperience[] = (sections?.experience || []).map((item: any) => ({
    title: cleanText(item.title),
    org: cleanText(item.organization),
    dates: formatDateRange(item.start, item.end),
    location: cleanText(item.location),
    bullets: (item.bullets || []).map(cleanText).filter(Boolean),
    current: Boolean(item.current),
    type: item.type,
    employmentType: item.employment_type,
    workArrangement: item.work_arrangement,
    professor: cleanText(item.professor),
    tags: item.tags || [],
  }));

  const education: DisplayEducation[] = (sections?.academics || []).map((item: any) => ({
    title: cleanText(item.title),
    institution: cleanText(item.institution),
    dates: formatDateRange(item.start, item.end),
    location: cleanText(item.location),
    gpa: cleanText(item.gpa),
    gpaFormat: cleanText(item.gpa_format),
    description: cleanText(item.description),
  }));

  const outputItems: any[] = sections?.output || [];
  const toDisplayOutput = (item: any): DisplayOutput => ({
    title: cleanText(item.title),
    venue: cleanText(item.venue),
    year: cleanText(item.year),
    summary: cleanText(item.summary),
    type: normalizeOutputType(item.type),
    link: cleanText(item.link),
    tags: item.tags || [],
  });

  const publications = filterByOutputType(outputItems, "publication").map(toDisplayOutput);
  const projects = filterByOutputType(outputItems, "project").map(toDisplayOutput);
  const talks = filterByOutputType(outputItems, "talk").map(toDisplayOutput);
  const honors = filterByOutputType(outputItems, "honor_and_award").map(toDisplayOutput);

  const credentials: DisplayCredential[] = (sections?.credentials || []).map((item: any) => ({
    title: cleanText(item.title),
    issuer: cleanText(item.issuer),
    year: cleanText(item.year),
    description: cleanText(item.description),
    link: cleanText(item.link),
  }));

  const skills: DisplaySkillGroup[] = (sections?.skill_groups || []).map((group: any) => ({
    name: cleanText(group.name),
    items: (group.items || []).map(cleanText).filter(Boolean),
  }));

  const links: DisplayLink[] = (sections?.links || []).map((link: any) => ({
    title: cleanText(link.title),
    url: cleanText(link.url),
  }));

  const languages = (sections?.languages || []).map((l: any) => (typeof l === "string" ? cleanText(l) : cleanText(l.name))).filter(Boolean);
  const interests = (sections?.interests || []).map((i: any) => (typeof i === "string" ? cleanText(i) : cleanText(i.name))).filter(Boolean);

  const extras: DisplayExtra[] = (sections?.extras || []).map((extra: any) => {
    const detail = [cleanText(extra.organization), cleanText(extra.location), formatDateRange(extra.start, extra.end)].filter(Boolean).join(" | ");
    return {
      title: cleanText(extra.title),
      detail,
      organization: cleanText(extra.organization),
      location: cleanText(extra.location),
      start: cleanText(extra.start),
      end: cleanText(extra.end),
      bullets: extra.bullets || [],
      tags: extra.tags || [],
    };
  });

  return {
    name, headline, summary: cleanText(basics.summary), contacts,
    experience, education, publications, projects, talks, honors, credentials, skills,
    languages, interests, links, extras,
    avatarUrl: cleanText(basics.avatar_url) || fallbackAvatarUrl,
    tags: basicsTags,
  };
};

/**
 * The reverse of buildDisplayData: turns the editor's DisplayData back into
 * a backend `sections` object, ready to send via updateResume/createResume.
 * `resumeSections` (the last-loaded backend sections, if any) is spread
 * first so any backend-only fields this editor never touches are kept.
 */
export const constructBackendSections = (
  editableData: DisplayData,
  resumeSections: any,
  photoOverride?: string | null
): any => {
  const email = editableData.contacts.find((c) => c.includes("@")) || "";
  const phone = editableData.contacts.find((c) => /[\d+\-]{7,}/.test(c)) || "";
  const linkedin = editableData.contacts.find((c) => c.toLowerCase().includes("linkedin")) || "";

  const remainingContacts = editableData.contacts.filter((c) => c !== email && c !== phone && c !== linkedin);
  const website = remainingContacts.find((c) => c.includes("http") || c.includes("www")) || "";
  const location = remainingContacts.filter((c) => c !== website).join(" | ");

  const outputEntry = (out: DisplayOutput, fallbackType: DisplayOutput["type"]) => ({
    title: out.title,
    venue: out.venue,
    year: out.year,
    summary: out.summary,
    type: out.type || fallbackType,
    link: out.link,
    tags: out.tags,
  });

  // Each bucket keeps its own type instead of being merged into one and
  // stamped with a single hardcoded type on the way out.
  const combinedOutput = [
    ...editableData.publications.map((out) => outputEntry(out, "publication")),
    ...editableData.projects.map((out) => outputEntry(out, "project")),
    ...editableData.talks.map((out) => outputEntry(out, "talk")),
    ...editableData.honors.map((out) => outputEntry(out, "honor_and_award")),
  ];

  const nameParts = (editableData.name || "").trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  return {
    ...resumeSections,
    basics: {
      ...(resumeSections?.basics || {}),
      avatar_url: photoOverride || editableData.avatarUrl || "",
      full_name: editableData.name,
      first_name: firstName,
      last_name: lastName,
      summary: editableData.summary,
      email,
      phone,
      linkedin,
      location,
      website,
      tags: [editableData.headline, ...editableData.tags.slice(1)].map(cleanText).filter(Boolean),
    },
    experience: editableData.experience.map((exp) => {
      const { start, end } = parseDateRange(exp.dates);
      return {
        title: exp.title,
        organization: exp.org,
        location: exp.location,
        start,
        end,
        bullets: exp.bullets,
        current: exp.current ?? (Boolean(start) && !end),
        type: exp.type,
        employment_type: exp.employmentType,
        work_arrangement: exp.workArrangement,
        professor: exp.professor,
        tags: exp.tags,
      };
    }),
    academics: editableData.education.map((edu) => {
      const { start, end } = parseDateRange(edu.dates);
      return {
        title: edu.title,
        institution: edu.institution,
        location: edu.location,
        start,
        end,
        gpa: edu.gpa,
        gpa_format: edu.gpaFormat,
        description: edu.description,
      };
    }),
    output: combinedOutput,
    credentials: editableData.credentials.map((cred) => ({
      title: cred.title,
      issuer: cred.issuer,
      year: cred.year,
      description: cred.description,
      link: cred.link,
    })),
    skill_groups: editableData.skills.map((skill) => ({ name: skill.name, items: skill.items })),
    languages: editableData.languages,
    interests: editableData.interests,
    links: editableData.links.map((link) => ({ title: link.title, url: link.url })),
    extras: editableData.extras.map((ex) => {
      // `detail` is the only field the visual editor currently exposes for
      // an extra. If it still matches what buildDisplayData originally
      // derived from organization/location/start/end, prefer the preserved
      // structured fields (this is what keeps bullets/tags and a correct
      // end date alive). If the person edited the combined line directly,
      // fall back to re-parsing it so that edit isn't lost.
      const expectedDetail = [ex.organization, ex.location, formatDateRange(ex.start, ex.end)].filter(Boolean).join(" | ");
      if (cleanText(ex.detail) !== cleanText(expectedDetail)) {
        const parts = (ex.detail || "").split(" | ");
        const { start, end } = parseDateRange(parts[2]?.trim());
        return {
          title: ex.title,
          organization: parts[0]?.trim() || "",
          location: parts[1]?.trim() || "",
          start,
          end,
          bullets: ex.bullets,
          tags: ex.tags,
        };
      }
      return {
        title: ex.title,
        organization: ex.organization || "",
        location: ex.location || "",
        start: ex.start || "",
        end: ex.end || "",
        bullets: ex.bullets,
        tags: ex.tags,
      };
    }),
  };
};
