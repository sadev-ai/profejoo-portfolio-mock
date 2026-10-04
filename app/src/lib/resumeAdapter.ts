// src/lib/resumeAdapter.ts
import type { ProfileData } from "@/types/profile";
import type { BackendResumePayload } from "@/services/resume.service";
import { normalizeOutputType } from "@/lib/outputType";

// calculateCompleteness used to be implemented here (and re-exported a
// second and third time from resumeCompleteness.ts / profileCompleteness.ts).
// It now has exactly one implementation, in completeness.ts; re-exported
// here so existing `import { calculateCompleteness } from "@/lib/resumeAdapter"`
// call sites (including the dynamic import in ResumeFromProfilePage.tsx)
// keep working unchanged.
import { calculateCompleteness } from "@/lib/completeness";
export { calculateCompleteness };
import { SECTION_SEQUENCE } from "@/lib/resumeBuilderTypes";

/**
 * Dev-only helper: warns in the console if any key present on the source
 * object silently disappears on the mapped object. Use this to prove,
 * with evidence, whether the frontend is (or isn't) the one dropping data.
 * No-ops in production builds.
 */
function assertNoFieldLoss(label: string, source: any, mapped: any) {
  if (process.env.NODE_ENV === "production") return;
  if (!source || typeof source !== "object") return;

  const sourceKeys = Object.keys(source);
  const lost = sourceKeys.filter((k) => {
    const before = source[k];
    const stillHasKey = Object.prototype.hasOwnProperty.call(mapped, k);
    const isEmptyish =
      before === undefined ||
      before === null ||
      (typeof before === "string" && before.trim() === "") ||
      (Array.isArray(before) && before.length === 0);
    return !isEmptyish && !stillHasKey;
  });

  if (lost.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `[resumeAdapter] Field loss detected in "${label}": ${lost.join(", ")}`,
      { source, mapped }
    );
  }
}

export function profileToResumePayload(
  profile: any,
  title: string = "Untitled Resume",
  template: string = "academic",
  style: string = "nunito:primary"
): BackendResumePayload {
  const rawData = JSON.parse(JSON.stringify(profile));

  // Helper function to ensure the YYYY-MM format
  const formatYearMonth = (dateStr?: string) => {
    if (!dateStr) return dateStr;
    const match = dateStr.match(/^(\d{4}-\d{2})/);
    return match ? match[1] : dateStr;
  };

  const academics = (rawData.academics || []).map((a: any) => {
    const mapped = {
      ...a,
      start: formatYearMonth(a.start),
      end: formatYearMonth(a.end),
    };
    assertNoFieldLoss("academics", a, mapped);
    return mapped;
  });

  const experience = (rawData.experience || []).map((e: any) => {
    const mapped = {
      ...e,
      start: formatYearMonth(e.start),
      end: formatYearMonth(e.end),
    };
    assertNoFieldLoss("experience", e, mapped);
    return mapped;
  });

  // Uses the shared canonical output-type normalizer (src/lib/outputType.ts)
  // so publication/project/talk/honor_and_award always stay distinct — this
  // used to be a locally re-implemented copy of the same classification
  // logic that lived in profileAdapter.ts, with its own subtly different
  // default, which is exactly the kind of drift that caused talks/honors to
  // get silently reclassified in the first place.
  const output = (rawData.output || []).map((o: any) => {
    const mapped = {
      ...o,
      type: normalizeOutputType(o.type),
    };
    assertNoFieldLoss("output", o, mapped);
    return mapped;
  });

  const extras = (rawData.extras || []).map((ex: any) => {
    const mapped = {
      ...ex,
      start: formatYearMonth(ex.start),
      end: formatYearMonth(ex.end),
    };
    assertNoFieldLoss("extras", ex, mapped);
    return mapped;
  });

  // Final structuring and cleanup
  const sections: any = {
    basics: rawData.basics || {},
    academics,
    experience,
    output,
    credentials: rawData.credentials || [],
    skill_groups: rawData.skill_groups || [],
    links: rawData.links || [],
    interests: rawData.interests || [],
    languages: rawData.languages || [],
    extras,
  };

  if (sections.basics) {
    sections.basics.full_name = sections.basics.full_name ||
      `${sections.basics.first_name || ""} ${sections.basics.last_name || ""}`.trim();
  }

  // Calculate the score on the cleaned-up data
  const completenessScore = calculateCompleteness(sections);

  const payload: BackendResumePayload = {
    title,
    template,
    style,
    status: "draft",
    order: SECTION_SEQUENCE,
    tags: [`completeness:${completenessScore}`],
    sections,
    completeness: completenessScore,
  };

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[resumeAdapter] Outgoing payload:", JSON.parse(JSON.stringify(payload)));
  }

  return payload;
}

export function resumeToProfileData(resume: any): ProfileData {
  const sections = resume.sections || resume.data?.sections || {};
  return JSON.parse(JSON.stringify(sections));
}