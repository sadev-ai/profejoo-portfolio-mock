// src/lib/completeness.ts
//
// Canonical "how complete is this profile/resume section data" scorer.
//
// This single function is used for both the Profile completeness bar and
// every Resume's completeness score, because a resume's `sections` payload
// is structurally the same shape as a profile's data (see
// BackendResumeSection in resume.service.ts vs ProfileData in types/profile.ts).
//
// Previously this logic lived in resumeAdapter.ts and was re-exported under
// three different names from three different files (resumeAdapter.ts,
// resumeCompleteness.ts, profileCompleteness.ts). It now lives in exactly
// one place; import it directly from here.

export function calculateCompleteness(data: any): number {
  if (!data) return 0;

  const target = data.sections || data.data?.sections || data.data || data;
  let score = 0;

  const isValid = (val: any) => {
    if (val === null || val === undefined) return false;
    if (typeof val === "string") return val.trim().length > 0;
    if (typeof val === "number") return true;
    if (typeof val === "boolean") return true;
    if (Array.isArray(val)) return val.length > 0;
    return false;
  };

  // 1. Basics (max 30)
  const basics = target.basics || {};
  let bScore = 0;
  if (isValid(basics.first_name) || isValid(basics.last_name) || isValid(basics.full_name)) bScore += 5;
  if (isValid(basics.email) && String(basics.email).includes("@")) bScore += 4;
  if (isValid(basics.phone)) bScore += 4;
  if (isValid(basics.city) || isValid(basics.country) || isValid(basics.location)) bScore += 3;
  if (isValid(basics.linkedin)) bScore += 4;
  if (isValid(basics.website)) bScore += 3;

  const sLen = typeof basics.summary === "string" ? basics.summary.trim().length : 0;
  if (sLen >= 100) bScore += 7;
  else if (sLen >= 30) bScore += 4;
  else if (sLen > 0) bScore += 2;
  score += Math.min(bScore, 30);

  // 2. Experience (max 25)
  let expScore = 0;
  const exps = Array.isArray(target.experience) ? target.experience : [];
  exps.forEach((e: any) => {
    if (isValid(e.title) && (isValid(e.organization) || isValid(e.org))) {
      let item = 5;
      if (isValid(e.start) || isValid(e.start_date) || isValid(e.end) || isValid(e.end_date)) item += 2;
      if (isValid(e.location)) item += 1;

      const dLen = typeof e.description === "string" ? e.description.trim().length :
                   (typeof e.summary === "string" ? e.summary.trim().length : 0);
      const bLen = Array.isArray(e.bullets) ? e.bullets.length : 0;

      if (dLen >= 50 || bLen >= 2) item += 4.5;
      else if (dLen > 0 || bLen === 1) item += 2;

      expScore += item;
    }
  });
  score += Math.min(expScore, 25);

  // 3. Education (max 15)
  let eduScore = 0;
  const edus = [...(Array.isArray(target.academics) ? target.academics : []),
                ...(Array.isArray(target.education) ? target.education : [])];
  edus.forEach((e: any) => {
    if (isValid(e.title) && (isValid(e.institution) || isValid(e.school))) {
      let item = 4;
      if (isValid(e.start) || isValid(e.start_date) || isValid(e.end) || isValid(e.end_date)) item += 2;
      if (isValid(e.location)) item += 0.5;
      if (isValid(e.gpa) || isValid(e.description) || isValid(e.thesis)) item += 1;
      eduScore += item;
    }
  });
  score += Math.min(eduScore, 15);

  // 4. Skills (max 10)
  let skScore = 0;
  const skills = [...(Array.isArray(target.skill_groups) ? target.skill_groups : []),
                  ...(Array.isArray(target.skills) ? target.skills : [])];
  skills.forEach((s: any) => {
    if (isValid(s.name) || isValid(s.title) || isValid(s.group)) {
      const items = Array.isArray(s.items) ? s.items : (Array.isArray(s.skills) ? s.skills : []);
      const valid = items.filter((i: any) => isValid(i));
      if (valid.length > 0) skScore += 2 + (valid.length * 0.5);
    }
  });
  score += Math.min(skScore, 10);

  // 5. Projects & publications (max 10)
  let outScore = 0;
  const outputs = [...(Array.isArray(target.output) ? target.output : []),
                   ...(Array.isArray(target.projects) ? target.projects : []),
                   ...(Array.isArray(target.publications) ? target.publications : [])];
  outputs.forEach((o: any) => {
    if (isValid(o.title)) {
      let item = 2;
      const dLen = typeof o.summary === "string" ? o.summary.trim().length :
                   (typeof o.description === "string" ? o.description.trim().length : 0);
      if (dLen > 30) item += 2;
      else if (dLen > 0) item += 1;
      if (isValid(o.venue) || isValid(o.year) || isValid(o.date) || isValid(o.link)) item += 1;
      outScore += item;
    }
  });
  score += Math.min(outScore, 10);

  // 6. Languages (max 4)
  const langs = Array.isArray(target.languages) ? target.languages : [];
  const validLangs = langs.filter((l: any) => isValid(l) || isValid(l?.name) || isValid(l?.language));
  score += Math.min(validLangs.length * 2, 4);

  // 7. Credentials (max 4)
  let credScore = 0;
  const creds = Array.isArray(target.credentials) ? target.credentials : [];
  creds.forEach((c: any) => { if (isValid(c.title)) credScore += 2; });
  score += Math.min(credScore, 4);

  // 8. Misc: links & interests (max 2)
  let extScore = 0;
  if (Array.isArray(target.interests) && target.interests.length > 0) extScore += 1;
  if (Array.isArray(target.extras) && target.extras.length > 0) extScore += 1;
  if (Array.isArray(target.links) && target.links.length > 0) extScore += 1;
  score += Math.min(extScore, 2);

  return Math.max(0, Math.min(Math.round(score), 100));
}
