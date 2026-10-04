// src/pages/Resume/ResumeBuilderPage.tsx
//
// Visual resume template editor. This file used to be ~1,380 lines and
// defined every shared type, all five templates, and the data adapter
// inline; those now live in src/lib/resumeBuilderTypes.ts,
// src/lib/resumeBuilderAdapter.ts, and src/components/resumes/templates/.
// This file is the page itself: state, load/save wiring, and the editor
// chrome (template/style/section picker + live preview).
import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import {
  ArrowLeft, Check, Download, Loader2, ImagePlus, X, Bold, Italic, Underline, Code,
  User, Briefcase, BookOpen, FileText, Sparkles, Award, Globe2, Mic,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useProfile } from "@/context/ProfileContext";
import { useResume } from "@/context/ResumeContext";
import { profileToResumePayload, resumeToProfileData } from "@/lib/resumeAdapter";
import { calculateCompleteness as calculateResumeCompleteness } from "@/lib/completeness";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { generateLatexString } from "@/lib/latexGenerator";

import type {
  FontOption, PaletteOption, BuilderTemplate, SectionVisibility, SectionKey,
  DisplayExperience, DisplayEducation, DisplayOutput, DisplayCredential,
  DisplaySkillGroup, DisplayLink, DisplayExtra, DisplayData, SectionIconName,
  SectionDragHandlers, TemplateEditHandlers,
} from "@/lib/resumeBuilderTypes";
import {
  FONT_OPTIONS, PALETTE_OPTIONS, TEMPLATE_OPTIONS, DEFAULT_VISIBILITY, SECTION_OPTIONS, SECTION_SEQUENCE,
  stripHtml, insertItem,
  createExperience, createEducation, createOutput, createCredential, createSkillGroup, createLink, createExtra,
} from "@/lib/resumeBuilderTypes";
import { buildDisplayData, constructBackendSections } from "@/lib/resumeBuilderAdapter";
import { TEMPLATE_COMPONENTS, TemplateSwatch } from "@/components/Resume/Templates";
import { PhotoBadge } from "@/components/Resume/Templates/shared";

// SECTION_OPTIONS (in resumeBuilderTypes.ts, a plain .ts file with no JSX)
// stores each row's icon as a name string; this is the one place that maps
// that name to the actual component, since rendering it requires JSX.
const SECTION_ICONS: Record<SectionIconName, React.ComponentType<{ className?: string }>> = {
  User, Briefcase, BookOpen, FileText, Sparkles, Award, Globe2, Mic,
};

// Reserved space at the top/bottom of every simulated page. Page 1 gets
// its top margin "for free" from the template's own heading padding, but
// pages 2+ are just a shifted window onto the same continuous content, so
// without this they'd start flush against the sheet edge — which is the
// inconsistent-spacing look this is meant to fix. Keeping one pair of
// constants for both the top gap and the page-break math below is what
// keeps the margins identical across every page.
const PAGE_TOP_INSET = 24;
const PAGE_BOTTOM_INSET = 32;
// A break landing exactly at a measured atom's top edge leaves zero margin
// for error between two independently-rendered copies of the same content
// (page 1's real copy and this page's shifted-and-clipped copy of it) — a
// sub-pixel measurement/rounding difference between the two is then enough
// to show a sliver of the previous page's last line again at the top of
// this one. Starting each page's window this many px past its computed
// break point costs nothing visible (breaks land at item boundaries, which
// already have their own margin/gap), and guarantees that sliver can never
// show.
const PAGE_BREAK_SAFETY_PX = 3;

export const ResumeBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("id") || searchParams.get("resumeId");
  const { profile, loading: profileLoading } = useProfile();
  const { getResume, updateResume } = useResume();
  const [resumeLoading, setResumeLoading] = React.useState(false);
  const [resumeError, setResumeError] = React.useState<string | null>(null);
  const [resumeSections, setResumeSections] = React.useState<any | null>(null);

  // Keeps the resume's real saved name (used in the "Data source" label).
  const [resumeTitle, setResumeTitle] = React.useState<string>("");

  const [activeTemplate, setActiveTemplate] = React.useState<BuilderTemplate>("academic");
  const [activeFont, setActiveFont] = React.useState<FontOption["id"]>("nunito");
  const [activePalette, setActivePalette] = React.useState<PaletteOption["id"]>("primary");
  const [visibleSections, setVisibleSections] = React.useState<SectionVisibility>(DEFAULT_VISIBILITY);
  const [sectionOrder, setSectionOrder] = React.useState<SectionKey[]>(SECTION_SEQUENCE);
  const [draggingSection, setDraggingSection] = React.useState<SectionKey | null>(null);
  const [includePhoto, setIncludePhoto] = React.useState(true);
  const [photoOverride, setPhotoOverride] = React.useState<string | null>(null);
  const [photoError, setPhotoError] = React.useState<string | null>(null);
  const photoInputId = React.useId();
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);
  const syncTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewRef = React.useRef<HTMLDivElement | null>(null);
  // The visible "page 1" frame is deliberately height-locked (see preview
  // markup below) to create the windowed, one-sheet-per-page look. A
  // locked-height box's own size stops changing as content grows, which
  // would starve a ResizeObserver watching it directly. This inner ref
  // instead wraps the actual template output at its natural, unclamped
  // height, so it keeps reporting true content growth for measurement.
  const contentMeasureRef = React.useRef<HTMLDivElement | null>(null);
  const [showRichToolbar, setShowRichToolbar] = React.useState(false);
  // The preview used to live inside a box hard-locked to one A4 page's
  // aspect ratio with overflow hidden, so any content past page 1 was
  // simply clipped off (invisible, not scrollable). We now let the
  // preview grow to its natural content height and instead measure how
  // tall one printed page is (in on-screen px) so we can report/show
  // page 2, 3, etc. as the content actually grows.
  // breakOffsets[i] is the vertical offset (px, into the full unclamped
  // content) where page i begins; breakOffsets[0] is always 0. Length is
  // the page count.
  const [pageMetrics, setPageMetrics] = React.useState<{ pageHeightPx: number; breakOffsets: number[] }>({ pageHeightPx: 0, breakOffsets: [0] });

  React.useEffect(() => {
    const handleFocus = () => {
      const active = document.activeElement;
      if (active && active.classList.contains('rich-text')) setShowRichToolbar(true);
      else setShowRichToolbar(false);
    };
    const handleBlur = () => {
      setTimeout(() => {
        const active = document.activeElement;
        if (!(active && active.classList.contains('rich-text'))) setShowRichToolbar(false);
      }, 10);
    };
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    return () => { document.removeEventListener('focusin', handleFocus); document.removeEventListener('focusout', handleBlur); };
  }, []);

  React.useEffect(() => {
    if (!resumeId) { setResumeSections(null); setResumeError(null); setResumeLoading(false); return; }
    let isMounted = true;
    setResumeLoading(true); setResumeError(null);

    getResume(resumeId)
      .then((data: any) => {
        if (isMounted) {
          if (data.title) setResumeTitle(data.title);

          const loadedSections = data.data?.sections || data.sections || null;
          setResumeSections(loadedSections);

          const backendOrder = data.data?.section_order || data.data?.order || data.order;
          if (backendOrder?.length) {
            const nextOrder = backendOrder.filter((item: string) => SECTION_SEQUENCE.includes(item as SectionKey)) as SectionKey[];
            SECTION_SEQUENCE.forEach(key => { if (!nextOrder.includes(key)) nextOrder.push(key); });
            setSectionOrder(nextOrder);
          }
          const backendTemplate = data.data?.template || data.template;
          if (backendTemplate) setActiveTemplate(backendTemplate as BuilderTemplate);

          const backendStyle = data.data?.style || data.style;
          if (backendStyle && backendStyle.includes(':')) {
            const [savedFont, savedPalette] = backendStyle.split(':');
            setActiveFont(savedFont as FontOption["id"]);
            setActivePalette(savedPalette as PaletteOption["id"]);
          }

          const backendTags = data.data?.tags || data.tags;
          if (backendTags && backendTags.length > 0) {
            try {
              const visibilityStr = backendTags.find((t: string) => t.startsWith("visibility:"));
              if (visibilityStr) {
                const parsedVisibility = JSON.parse(visibilityStr.replace("visibility:", ""));
                if (typeof parsedVisibility === 'object' && parsedVisibility !== null) {
                  setVisibleSections(prev => ({ ...prev, ...parsedVisibility }));
                }
              }
              const photoStr = backendTags.find((t: string) => t.startsWith("photo:"));
              if (photoStr) {
                setIncludePhoto(photoStr.replace("photo:", "") === "true");
              }
            } catch (e) { /* ignore */ }
          }
        }
      })
      .catch((err: any) => {
        if (isMounted) { setResumeError(err?.message || "Failed to load resume data."); setResumeSections(null); }
      })
      .finally(() => { if (isMounted) setResumeLoading(false); });

    return () => { isMounted = false; };
  }, [resumeId, getResume]);

  const profileSections = React.useMemo(() => {
    if (!profile?.data) return null;
    return profileToResumePayload(profile.data as any).sections;
  }, [profile]);

  const profileAvatarUrl = profile?.data?.basics?.avatar_url;
  const sections = resumeSections || profileSections || undefined;

  const displayData = React.useMemo(() => buildDisplayData(sections, profileAvatarUrl), [sections, profileAvatarUrl]);

  const [editableData, setEditableData] = React.useState<DisplayData>(displayData);

  React.useEffect(() => { setEditableData(displayData); }, [displayData]);

  const palette = PALETTE_OPTIONS.find((item) => item.id === activePalette)!;
  const font = FONT_OPTIONS.find((item) => item.id === activeFont)!;
  const previewStyle = React.useMemo(() => {
    return { fontFamily: font.family, "--resume-accent": palette.accent, "--resume-soft": palette.soft, "--resume-line": palette.line } as React.CSSProperties;
  }, [palette, font]);

  const handleDragStart = (key: SectionKey) => (event: React.DragEvent) => { event.dataTransfer.setData("text/plain", key); event.dataTransfer.effectAllowed = "move"; setDraggingSection(key); };
  const handleDragOver = (event: React.DragEvent) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; };
  const handleDrop = (targetKey: SectionKey) => (event: React.DragEvent) => {
    event.preventDefault();
    const sourceKey = draggingSection || (event.dataTransfer.getData("text/plain") as SectionKey);
    if (!sourceKey || sourceKey === targetKey) { setDraggingSection(null); return; }
    setSectionOrder((prev) => {
      const next = [...prev];
      const fromIndex = next.indexOf(sourceKey);
      const toIndex = next.indexOf(targetKey);
      if (fromIndex === -1 || toIndex === -1) return prev;
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, sourceKey);
      return next;
    });
    setDraggingSection(null);
  };
  const handleDragEnd = () => setDraggingSection(null);

  const updateBasics = (patch: Partial<DisplayData>) => setEditableData((prev) => ({ ...prev, ...patch }));
  const updateContact = (index: number, value: string) => setEditableData((prev) => { const contacts = [...prev.contacts]; contacts[index] = value; return { ...prev, contacts }; });
  const updateExperience = (index: number, patch: Partial<DisplayExperience>) => setEditableData((prev) => { const experience = prev.experience.map((item, i) => i === index ? { ...item, ...patch } : item); return { ...prev, experience }; });
  const updateExperienceBullet = (index: number, bulletIndex: number, value: string) => setEditableData((prev) => { const experience = prev.experience.map((item, i) => { if (i !== index) return item; const bullets = [...item.bullets]; bullets[bulletIndex] = value; return { ...item, bullets }; }); return { ...prev, experience }; });
  const updateEducation = (index: number, patch: Partial<DisplayEducation>) => setEditableData((prev) => { const education = prev.education.map((item, i) => i === index ? { ...item, ...patch } : item); return { ...prev, education }; });
  const updatePublication = (index: number, patch: Partial<DisplayOutput>) => setEditableData((prev) => { const publications = prev.publications.map((item, i) => i === index ? { ...item, ...patch } : item); return { ...prev, publications }; });
  const updateProject = (index: number, patch: Partial<DisplayOutput>) => setEditableData((prev) => { const projects = prev.projects.map((item, i) => i === index ? { ...item, ...patch } : item); return { ...prev, projects }; });
  const updateTalk = (index: number, patch: Partial<DisplayOutput>) => setEditableData((prev) => { const talks = prev.talks.map((item, i) => i === index ? { ...item, ...patch } : item); return { ...prev, talks }; });
  const updateHonor = (index: number, patch: Partial<DisplayOutput>) => setEditableData((prev) => { const honors = prev.honors.map((item, i) => i === index ? { ...item, ...patch } : item); return { ...prev, honors }; });
  const updateCredential = (index: number, patch: Partial<DisplayCredential>) => setEditableData((prev) => { const credentials = prev.credentials.map((item, i) => i === index ? { ...item, ...patch } : item); return { ...prev, credentials }; });
  const updateSkillGroup = (index: number, patch: Partial<DisplaySkillGroup>) => setEditableData((prev) => { const skills = prev.skills.map((item, i) => i === index ? { ...item, ...patch } : item); return { ...prev, skills }; });
  const updateLanguage = (index: number, value: string) => setEditableData((prev) => { const languages = [...prev.languages]; languages[index] = value; return { ...prev, languages }; });
  const updateInterest = (index: number, value: string) => setEditableData((prev) => { const interests = [...prev.interests]; interests[index] = value; return { ...prev, interests }; });
  const updateLink = (index: number, patch: Partial<DisplayLink>) => setEditableData((prev) => { const links = prev.links.map((item, i) => i === index ? { ...item, ...patch } : item); return { ...prev, links }; });
  const updateExtra = (index: number, patch: Partial<DisplayExtra>) => setEditableData((prev) => { const extras = prev.extras.map((item, i) => i === index ? { ...item, ...patch } : item); return { ...prev, extras }; });

  const addContact = (index?: number) => setEditableData((prev) => ({ ...prev, contacts: insertItem(prev.contacts, index, "") }));
  const removeContact = (index: number) => setEditableData((prev) => ({ ...prev, contacts: prev.contacts.filter((_, i) => i !== index) }));
  const addExperience = (index?: number) => setEditableData((prev) => ({ ...prev, experience: insertItem(prev.experience, index, createExperience()) }));
  const removeExperience = (index: number) => setEditableData((prev) => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
  const addExperienceBullet = (index: number, bulletIndex?: number) => setEditableData((prev) => { const experience = prev.experience.map((item, i) => { if (i !== index) return item; const bullets = insertItem(item.bullets, bulletIndex, ""); return { ...item, bullets }; }); return { ...prev, experience }; });
  const removeExperienceBullet = (index: number, bulletIndex: number) => setEditableData((prev) => { const experience = prev.experience.map((item, i) => { if (i !== index) return item; const bullets = item.bullets.filter((_, bi) => bi !== bulletIndex); return { ...item, bullets }; }); return { ...prev, experience }; });
  const addEducation = (index?: number) => setEditableData((prev) => ({ ...prev, education: insertItem(prev.education, index, createEducation()) }));
  const removeEducation = (index: number) => setEditableData((prev) => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
  const addPublication = (index?: number) => setEditableData((prev) => ({ ...prev, publications: insertItem(prev.publications, index, createOutput("publication")) }));
  const removePublication = (index: number) => setEditableData((prev) => ({ ...prev, publications: prev.publications.filter((_, i) => i !== index) }));
  const addProject = (index?: number) => setEditableData((prev) => ({ ...prev, projects: insertItem(prev.projects, index, createOutput("project")) }));
  const removeProject = (index: number) => setEditableData((prev) => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
  const addTalk = (index?: number) => setEditableData((prev) => ({ ...prev, talks: insertItem(prev.talks, index, createOutput("talk")) }));
  const removeTalk = (index: number) => setEditableData((prev) => ({ ...prev, talks: prev.talks.filter((_, i) => i !== index) }));
  const addHonor = (index?: number) => setEditableData((prev) => ({ ...prev, honors: insertItem(prev.honors, index, createOutput("honor_and_award")) }));
  const removeHonor = (index: number) => setEditableData((prev) => ({ ...prev, honors: prev.honors.filter((_, i) => i !== index) }));
  const addCredential = (index?: number) => setEditableData((prev) => ({ ...prev, credentials: insertItem(prev.credentials, index, createCredential()) }));
  const removeCredential = (index: number) => setEditableData((prev) => ({ ...prev, credentials: prev.credentials.filter((_, i) => i !== index) }));
  const addSkillGroup = (index?: number) => setEditableData((prev) => ({ ...prev, skills: insertItem(prev.skills, index, createSkillGroup()) }));
  const removeSkillGroup = (index: number) => setEditableData((prev) => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  const addLanguage = (index?: number) => setEditableData((prev) => ({ ...prev, languages: insertItem(prev.languages, index, "") }));
  const removeLanguage = (index: number) => setEditableData((prev) => ({ ...prev, languages: prev.languages.filter((_, i) => i !== index) }));
  const addInterest = (index?: number) => setEditableData((prev) => ({ ...prev, interests: insertItem(prev.interests, index, "") }));
  const removeInterest = (index: number) => setEditableData((prev) => ({ ...prev, interests: prev.interests.filter((_, i) => i !== index) }));
  const addLink = (index?: number) => setEditableData((prev) => ({ ...prev, links: insertItem(prev.links, index, createLink()) }));
  const removeLink = (index: number) => setEditableData((prev) => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));
  const addExtra = (index?: number) => setEditableData((prev) => ({ ...prev, extras: insertItem(prev.extras, index, createExtra()) }));
  const removeExtra = (index: number) => setEditableData((prev) => ({ ...prev, extras: prev.extras.filter((_, i) => i !== index) }));

  const handlePhotoUpload = (file?: File) => {
    if (!file) return;
    if (!/image\/(jpeg|png|webp)/.test(file.type)) { setPhotoError("Only JPG, PNG, or WebP files are allowed."); return; }
    if (file.size > 2 * 1024 * 1024) { setPhotoError("Max file size is 2MB."); return; }
    setPhotoError(null);
    const reader = new FileReader();
    reader.onload = () => setPhotoOverride(String(reader.result));
    reader.readAsDataURL(file);
  };

  const previewData = React.useMemo(() => ({
    ...editableData,
    avatarUrl: photoOverride || editableData.avatarUrl,
  }), [editableData, photoOverride]);

  // The preview used to sit inside a box hard-locked to one A4 page's
  // aspect ratio with overflow hidden, so any content past page 1 was
  // simply clipped off (invisible, not scrollable). It's now shown as
  // real, separate page sheets (see preview markup below) — this effect
  // measures the template's true, unclamped content height against one
  // printed page's height so we know how many sheets to render, and
  // re-measures automatically whenever that content's own size changes
  // (typing, toggling sections, swapping template/font/palette, etc.).
  React.useEffect(() => {
    const node = contentMeasureRef.current;
    if (!node) return;

    const A4_HEIGHT_OVER_WIDTH = 297 / 210; // A4 sheet, height/width

    const measure = () => {
      const containerRect = node.getBoundingClientRect();
      if (!containerRect.width) return;
      const pageHeightPx = containerRect.width * A4_HEIGHT_OVER_WIDTH;
      const totalHeight = containerRect.height;
      const usableHeight = Math.max(40, pageHeightPx - PAGE_TOP_INSET - PAGE_BOTTOM_INSET);

      // Every experience/education/output/credential entry, section
      // heading, and milestone card carries data-resume-atom (see the
      // templates) marking it as a block a page break must never cut
      // through. Positions are measured relative to the content
      // container so this works the same for single- and two-column
      // templates alike.
      const atomEls = Array.from(node.querySelectorAll<HTMLElement>("[data-resume-atom]"));
      const rectOf = (el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        return { top: rect.top - containerRect.top, bottom: rect.bottom - containerRect.top };
      };

      // A section heading immediately followed by its first entry must
      // never land on one page while that entry lands on the next — that
      // orphans the heading with nothing under it, and (since the entry
      // then opens the following page) makes the heading appear to repeat
      // there too. Building one merged span per heading+first-entry pair
      // — covering the heading, the entry, and the gap between them —
      // means the break search below treats them as a single unit no
      // matter which part of that span a naive break would fall in.
      const pairedFirstItems = new Set<HTMLElement>();
      const spans: { top: number; bottom: number }[] = [];
      atomEls
        .filter((el) => el.dataset.resumeAtom === "heading")
        .forEach((headingEl) => {
          const headingRect = rectOf(headingEl);
          const contentWrap = headingEl.nextElementSibling as HTMLElement | null;
          // Only an actual item can be "the first entry" here — some
          // sections (Additional: Languages/Interests/Links/Extras) nest
          // their own data-resume-atom="heading" labels one level in, and
          // without this filter querySelector's first-match-wins search
          // would grab one of THOSE instead, building the wrong span for
          // this section and leaving that nested heading to get matched
          // (and orphan-paired) a second time on its own below.
          const firstItem = contentWrap?.querySelector<HTMLElement>('[data-resume-atom]:not([data-resume-atom="heading"])');
          if (firstItem) {
            pairedFirstItems.add(firstItem);
            const itemRect = rectOf(firstItem);
            spans.push({ top: headingRect.top, bottom: itemRect.bottom });
          } else {
            // An empty section (or one whose content has no atoms of its
            // own, e.g. a plain summary paragraph) still shouldn't have
            // its heading split from itself.
            spans.push(headingRect);
          }
        });
      atomEls
        .filter((el) => el.dataset.resumeAtom !== "heading" && !pairedFirstItems.has(el))
        .forEach((el) => spans.push(rectOf(el)));

      // Walk the content in usableHeight-sized slices; whenever a slice
      // boundary would land inside a span, pull the boundary back to
      // that span's top instead of cutting through (or past the start
      // of) it.
      const offsets = [0];
      let pageStart = 0;
      let guard = 0;
      while (pageStart + usableHeight < totalHeight - 0.5 && guard < 300) {
        guard++;
        const naiveBreak = pageStart + usableHeight;
        let candidate = naiveBreak;

        // Re-check the full span list against the (possibly already
        // adjusted) candidate, repeatedly, instead of a single pass.
        // In a two-column template (Academic/Balanced/...), the spans
        // from each column have entirely independent boundaries. Pulling
        // the candidate back to clear a straddling span in one column
        // can slide it earlier into a *different* span — in the other
        // column — that didn't straddle the original naive break point
        // at all, so never got checked against it. Without this loop,
        // that second collision goes undetected: the candidate ends up
        // mid-item in the other column, which is exactly what makes
        // that item's tail (e.g. its "Summary" line) get clipped off the
        // bottom of one page and then reappear at the top of the next.
        let movedBack = true;
        let safety = 0;
        while (movedBack && safety < spans.length + 4) {
          movedBack = false;
          safety++;
          for (const span of spans) {
            if (span.top < candidate - 0.5 && span.bottom > candidate + 0.5 && span.top < candidate) {
              candidate = span.top;
              movedBack = true;
            }
          }
        }

        // Guarantee forward progress (e.g. spans in different columns
        // whose ranges can never both be satisfied on one page) so this
        // can never loop without advancing or collapse a page to ~0.
        if (candidate <= pageStart + 1) candidate = naiveBreak;
        offsets.push(candidate);
        pageStart = candidate;
      }

      setPageMetrics((prev) => {
        const unchanged =
          prev.pageHeightPx === pageHeightPx &&
          prev.breakOffsets.length === offsets.length &&
          prev.breakOffsets.every((value, index) => Math.abs(value - offsets[index]) < 0.5);
        return unchanged ? prev : { pageHeightPx, breakOffsets: offsets };
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [previewData, visibleSections, sectionOrder, activeTemplate, activeFont, activePalette, includePhoto]);

  const sectionCounts = React.useMemo(() => ({
    basics: editableData.contacts.filter((item) => stripHtml(item).length > 0).length,
    summary: stripHtml(editableData.summary).length > 0 ? 1 : 0,
    experience: editableData.experience.length,
    education: editableData.education.length,
    skills: editableData.skills.length,
    publications: editableData.publications.length,
    projects: editableData.projects.length,
    talks: editableData.talks.length,
    honors: editableData.honors.length,
    credentials: editableData.credentials.length,
    additional: editableData.languages.length + editableData.interests.length + editableData.links.length + editableData.extras.length,
  }), [editableData]);

  const generatePdf = useReactToPrint({
    contentRef: previewRef,
    content: () => previewRef.current,
    documentTitle: editableData.name ? `${editableData.name.trim().replace(/\s+/g, "_")}_Resume` : "Resume",
  });

  const handleDownloadPdf = React.useCallback(() => {
    setIsExporting(true);
    setTimeout(async () => {
      try {
        if (generatePdf) await generatePdf();
      } catch (error) {
        console.error("Print failed:", error);
      } finally {
        setIsExporting(false);
      }
    }, 150);
  }, [generatePdf]);

  const handleDownloadLatex = React.useCallback(() => {
    try {
      const latexCode = generateLatexString(editableData);
      const blob = new Blob([latexCode], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${editableData.name?.trim().replace(/\s+/g, "_") || "resume"}.tex`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      setExportError("LaTeX export failed.");
    }
  }, [editableData]);

  const dragHandlers: SectionDragHandlers = { draggingSection, onDragStart: handleDragStart, onDragOver: handleDragOver, onDrop: handleDrop, onDragEnd: handleDragEnd };
  const editHandlers: TemplateEditHandlers = {
    updateBasics, updateContact, updateExperience, updateExperienceBullet, updateEducation, updatePublication, updateProject, updateTalk, updateHonor, updateCredential, updateSkillGroup, updateLanguage, updateInterest, updateLink, updateExtra,
    addContact, removeContact, addExperience, removeExperience, addExperienceBullet, removeExperienceBullet, addEducation, removeEducation, addPublication, removePublication, addProject, removeProject, addTalk, removeTalk, addHonor, removeHonor, addCredential, removeCredential,
    addSkillGroup, removeSkillGroup, addLanguage, removeLanguage, addInterest, removeInterest, addLink, removeLink, addExtra, removeExtra,
  };

  // Builds the payload sent to the backend on every autosave / manual save.
  // The actual sections object comes from constructBackendSections (see
  // resumeBuilderAdapter.ts) — previously this whole payload was built
  // inline and it hardcoded output items down to just "publication"/
  // "project" and dropped several experience/education/credential fields.
  const constructPayload = React.useCallback(() => {
    const updatedSections = constructBackendSections(editableData, resumeSections, photoOverride);

    const payloadForCalc = { sections: updatedSections };
    const profileDataForCalc = resumeToProfileData(payloadForCalc as any);
    const completenessScore = calculateResumeCompleteness(profileDataForCalc);

    return {
      status: "draft",
      pages: 1,
      order: sectionOrder,
      template: activeTemplate,
      style: `${activeFont}:${activePalette}`,
      tags: [
        `visibility:${JSON.stringify(visibleSections)}`,
        `completeness:${completenessScore}`,
        `photo:${includePhoto}`
      ],
      sections: updatedSections
    };
  }, [editableData, resumeSections, sectionOrder, activeTemplate, activeFont, activePalette, visibleSections, includePhoto, photoOverride]);

  React.useEffect(() => {
    if (!resumeId) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

    syncTimerRef.current = setTimeout(() => {
      updateResume(resumeId, constructPayload()).catch((error) => console.error("[ResumeBuilder] Sync failed:", error));
    }, 1000);

    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
  }, [resumeId, constructPayload, updateResume]);

  const handleSaveDraft = async () => {
    if (resumeId) {
      try {
        await updateResume(resumeId, constructPayload());
        toast.success("Draft saved successfully!");
      } catch (e) {
        console.warn("Failed to manually save draft", e);
        toast.error("Failed to save draft.");
      }
    }
  };

  const dataSourceLabel = resumeId ? (resumeError ? "Resume not found" : (resumeTitle || "Saved Resume")) : (profile?.data ? "Profile" : "Placeholders");
  const ActiveTemplateComponent = TEMPLATE_COMPONENTS[activeTemplate];

  return (
    <div className="profejoo min-h-dvh bg-muted/10">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate(ROUTES.DASHBOARD_RESUME_MAKER)} className="btn btn--ghost btn--sm">
              <ArrowLeft className="size-4" /> Back
            </button>
            <div>
              <h1 className="text-lg font-semibold">Resume Templates</h1>
              <p className="text-xs text-muted-foreground">Choose a layout, palette, and milestones to keep your resume focused.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Data source: <span className="font-medium text-foreground">{dataSourceLabel}</span></span>
            {resumeId && (
              <button type="button" onClick={handleSaveDraft} className="btn btn--outline-tertiary btn--sm">
                <Check className="size-4" /> Save draft
              </button>
            )}
            <button type="button" onClick={handleDownloadLatex} className="btn btn--outline-secondary btn--sm gap-1">
              <Code className="size-4" /> LaTeX (.tex)
            </button>
            <button type="button" onClick={handleDownloadPdf} disabled={isExporting} className="btn btn--accent btn--sm">
              {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />} Export PDF
            </button>
          </div>
        </div>
      </header>

      <div className="bg-background border-b px-4 py-2">
        <div className="mx-auto max-w-7xl flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rich text formatting:</span>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => document.execCommand('bold')} title="Bold (Ctrl+B)" tabIndex={-1}><Bold className="h-4 w-4" /></Button>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => document.execCommand('italic')} title="Italic (Ctrl+I)" tabIndex={-1}><Italic className="h-4 w-4" /></Button>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => document.execCommand('underline')} title="Underline (Ctrl+U)" tabIndex={-1}><Underline className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <aside className="space-y-4">
            <Card className="rounded-2xl border bg-card">
              <CardHeader className="pb-2"><CardTitle className="text-base">Templates</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {TEMPLATE_OPTIONS.map((template) => (
                  <button
                    key={template.id} type="button" onClick={() => setActiveTemplate(template.id as BuilderTemplate)}
                    className={cn("group flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition hover:bg-muted/40", template.id === activeTemplate ? "border-[color:var(--primary-400)] bg-[var(--primary-50)]" : "border-border bg-background")}
                  >
                    <TemplateSwatch templateId={template.id as BuilderTemplate} palette={palette} active={template.id === activeTemplate} />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{template.name}</div>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </div>
                    {template.id === activeTemplate && <Check className="size-4 text-[var(--primary-400)]" />}
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border bg-card">
              <CardHeader className="pb-2"><CardTitle className="text-base">Style</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Typography</p>
                  <Select value={activeFont} onValueChange={(value) => setActiveFont(value as FontOption["id"])}>
                    <SelectTrigger><SelectValue placeholder="Select font" /></SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((option) => <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Palette</p>
                  <div className="flex flex-wrap gap-2">
                    {PALETTE_OPTIONS.map((option) => (
                      <button
                        key={option.id} type="button" onClick={() => setActivePalette(option.id as PaletteOption["id"])}
                        className={cn("flex h-9 w-9 items-center justify-center rounded-full border-2 transition", option.id === activePalette ? "border-foreground" : "border-transparent")}
                      >
                        <span className="block h-7 w-7 rounded-full" style={{ backgroundColor: option.accent }} />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border bg-card">
              <CardHeader className="pb-2"><CardTitle className="text-base">Sections & photo</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {SECTION_OPTIONS.map((item) => {
                    const Icon = SECTION_ICONS[item.icon];
                    return (
                    <div key={item.key} className="flex items-center justify-between gap-3 rounded-xl border border-muted bg-muted/30 px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-muted bg-background text-[var(--primary-400)]"><Icon className="size-4" /></div>
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.helper}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-muted bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                          {sectionCounts[item.key as keyof typeof sectionCounts]}
                        </span>
                        <Switch checked={visibleSections[item.key as keyof SectionVisibility]} onCheckedChange={(checked) => setVisibleSections((prev) => ({ ...prev, [item.key]: Boolean(checked) }))} />
                      </div>
                    </div>
                    );
                  })}
                </div>
                <Separator />
                <div className="space-y-3 rounded-xl border border-muted bg-muted/30 px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Show photo</p>
                      <p className="text-xs text-muted-foreground">Use your profile photo by default or replace it here.</p>
                    </div>
                    <Switch checked={includePhoto} onCheckedChange={(checked) => setIncludePhoto(Boolean(checked))} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <PhotoBadge name={editableData.name} avatarUrl={photoOverride || editableData.avatarUrl} className="h-10 w-10 text-[9px]" />
                    <div className="flex flex-wrap items-center gap-2">
                      <label htmlFor={photoInputId}>
                        <Button type="button" variant="outline" size="sm" className="h-8 gap-1 rounded-lg px-2 text-[11px]" asChild>
                          <span><ImagePlus className="size-3.5" /> Replace</span>
                        </Button>
                      </label>
                      {photoOverride && (
                        <Button type="button" variant="ghost" size="sm" className="h-8 gap-1 rounded-lg px-2 text-[11px]" onClick={() => setPhotoOverride(null)}>
                          <X className="size-3.5" /> Use profile
                        </Button>
                      )}
                      <input id={photoInputId} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => handlePhotoUpload(event.target.files?.[0])} />
                    </div>
                  </div>
                  {photoError && <p className="text-xs text-destructive">{photoError}</p>}
                </div>
              </CardContent>
            </Card>
          </aside>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Preview</h2>
                <p className="text-xs text-muted-foreground">A4 layout with live placeholders. Toggle sections, swap templates, and export the result as a PDF.</p>
              </div>
              {(resumeLoading || profileLoading) && <span className="text-xs text-muted-foreground">Loading data...</span>}
            </div>
            {resumeError && <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">{resumeError}</div>}
            {exportError && <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">{exportError}</div>}
            <div className="rounded-3xl border border-muted/60 bg-white p-4 shadow-sm">
              <div className="mx-auto w-full max-w-2xl space-y-4">

                <style type="text/css" media="print">
                  {`
                    @page { size: A4 portrait; margin: 0; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .resume-preview { width: 210mm !important; height: auto !important; min-height: 297mm !important; overflow: visible !important; box-shadow: none !important; border: none !important; }
                    .resume-page-window { height: auto !important; overflow: visible !important; }
                    .pdf-hidden { display: none !important; }
                  `}
                </style>

                {/* Page 1 — also the real export source. Its height/overflow
                    lock on screen only, to show exactly one sheet's worth of
                    content; the print stylesheet above unlocks both (the
                    outer .resume-preview box AND the inner .resume-page-window
                    clip below), so the browser's native print pagination
                    takes over for any content past this page when
                    printing/exporting. */}
                <div className="relative overflow-hidden rounded-2xl border border-muted/50 bg-white shadow-sm">
                  <div
                    ref={previewRef}
                    className="resume-preview relative w-full bg-white"
                    style={{
                      height: pageMetrics.pageHeightPx ? `${pageMetrics.pageHeightPx}px` : "auto",
                      overflow: pageMetrics.pageHeightPx ? "hidden" : "visible",
                    }}
                  >
                    {/* A second, tighter clip sized to exactly this page's
                        slice of content (rather than the full sheet height).
                        Without it, whatever content starts right after this
                        page's break point would still be tall enough to peek
                        into the blank margin at the bottom of the sheet —
                        the same "next page bleeding into this one" look this
                        rework is meant to get rid of. */}
                    <div
                      className="resume-page-window w-full"
                      style={
                        pageMetrics.pageHeightPx && pageMetrics.breakOffsets.length > 1
                          ? { height: `${pageMetrics.breakOffsets[1]}px`, overflow: "hidden" }
                          : { height: "auto", overflow: "visible" }
                      }
                    >
                      <div ref={contentMeasureRef} className="w-full" style={previewStyle}>
                        <ActiveTemplateComponent data={previewData} visibleSections={visibleSections} showPhoto={includePhoto} sectionOrder={sectionOrder} dragHandlers={dragHandlers} onEdit={editHandlers} />
                      </div>
                    </div>
                  </div>
                  {pageMetrics.breakOffsets.length > 1 && (
                    <span className="pdf-hidden pointer-events-none absolute bottom-2 right-3 rounded-full bg-foreground/70 px-2 py-0.5 text-[10px] font-medium text-white">
                      Page 1 of {pageMetrics.breakOffsets.length}
                    </span>
                  )}
                </div>

                {/* Extra sheets for page 2, 3, ... as many as the content
                    actually needs. Each is a same-size window onto the
                    same content, shifted up to reveal its slice — a real
                    separated page, not a line drawn through live text.
                    They're display:none during print/export (pdf-hidden)
                    since the un-clipped page above already holds the full
                    content for the print engine to paginate. */}
                {pageMetrics.pageHeightPx > 0 && Array.from({ length: Math.max(0, pageMetrics.breakOffsets.length - 1) }).map((_, i) => {
                  const pageIndex = i + 1;
                  const rawStart = pageMetrics.breakOffsets[pageIndex];
                  const isLastPage = pageIndex === pageMetrics.breakOffsets.length - 1;
                  // See PAGE_BREAK_SAFETY_PX above: nudge the window's start
                  // forward slightly so this page can never re-show a sliver
                  // of what the previous page already displayed up to
                  // rawStart. The buffer only applies going forward (never
                  // to the previous page's own clip height), so it can only
                  // ever trim a hair off the top of this page's blank
                  // pre-item margin — never off the previous page's content.
                  const windowStart = Math.min(
                    rawStart + PAGE_BREAK_SAFETY_PX,
                    isLastPage ? Infinity : pageMetrics.breakOffsets[pageIndex + 1]
                  );
                  // Same tighter inner clip as page 1 above, so the start of
                  // the following page can't show through this page's
                  // bottom margin. The last page has nothing after it, so
                  // it's left unclipped (beyond the sheet itself).
                  const innerHeight = isLastPage ? null : pageMetrics.breakOffsets[pageIndex + 1] - windowStart;
                  return (
                    <div
                      key={i}
                      className="pdf-hidden relative overflow-hidden rounded-2xl border border-muted/50 bg-white shadow-sm"
                      style={{ height: `${pageMetrics.pageHeightPx}px` }}
                    >
                      {/* Page 1 gets its top margin for free from the
                          template's own heading padding; every later page
                          is just a window onto the same content, so this
                          spacer reproduces that same margin here. It's a
                          genuine empty block — not part of the shifted
                          content below — specifically so nothing from the
                          end of the previous page (or the start of this
                          one) can show through it. */}
                      <div style={{ height: `${PAGE_TOP_INSET}px` }} />
                      <div
                        className="w-full"
                        style={innerHeight !== null ? { height: `${innerHeight}px`, overflow: "hidden" } : { height: "auto", overflow: "visible" }}
                      >
                        <div
                          className="w-full"
                          style={{ ...previewStyle, transform: `translateY(-${windowStart}px)` }}
                        >
                          <ActiveTemplateComponent data={previewData} visibleSections={visibleSections} showPhoto={includePhoto} sectionOrder={sectionOrder} dragHandlers={dragHandlers} onEdit={editHandlers} />
                        </div>
                      </div>
                      <span className="pointer-events-none absolute bottom-2 right-3 rounded-full bg-foreground/70 px-2 py-0.5 text-[10px] font-medium text-white">
                        Page {i + 2} of {pageMetrics.breakOffsets.length}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ResumeBuilderPage;
