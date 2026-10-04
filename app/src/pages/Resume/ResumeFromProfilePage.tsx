// src/pages/ResumeFromProfilePage.tsx
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES, resumeBuilderPath } from "@/constants/routes";
import {
  ArrowLeft,
  GripVertical,
  User,
  BookOpen,
  Briefcase,
  FileText,
  Award,
  Sparkles,
  Brain,
  Globe2,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useProfile } from "@/context/ProfileContext";
import { useResume } from "@/context/ResumeContext";
import { toast } from "sonner";

type SectionKey =
  | "basics"
  | "academics"
  | "experience"
  | "publications"
  | "projects"
  | "talks"
  | "honors"
  | "credentials"
  | "skills"
  | "languages"
  | "interests"
  | "extras";

type SectionMeta = {
  key: SectionKey;
  label: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  defaultSelected: boolean;
};

export default function ResumeFromProfilePage() {
  const navigate = useNavigate();
  const { profile, loading } = useProfile();
  const { createResume } = useResume();
  // Calculate counts from profile data
  const counts = React.useMemo(() => {
    if (!profile?.data) {
      return {
        basicsCount: 0,
        academicsCount: 0,
        experienceCount: 0,
        outputCount: 0,
        credentialsCount: 0,
        skillsCount: 0,
        interestsCount: 0,
        extrasCount: 0,
      };
    }

    const b = profile.data.basics;
    const basicsFields = [
      b?.first_name && b?.last_name,
      b?.email,
      b?.phone,
      b?.city || b?.country,
      b?.website,
    ].filter(Boolean);
    const basicsCount = basicsFields.length || 1;

    const academicsCount = profile.data.academics?.length || 0;
    const experienceCount = profile.data.experience?.length || 0;

    const publicationsCount = profile.data.output?.filter((o) => {
      const t = o.type?.toLowerCase() || "";
      return t === "paper" || t === "publication";
    })?.length ?? 0;

    const projectsCount = profile.data.output?.filter((o) => o.type?.toLowerCase() === "project")?.length ?? 0;

    const talksCount = profile.data.output?.filter((o) => o.type?.toLowerCase() === "talk")?.length ?? 0;

    const honorsCount = profile.data.output?.filter((o) => {
      const t = o.type?.toLowerCase() || "";
      return t === "honor and award" || t === "honor_and_award" || t === "honor";
    })?.length ?? 0;

    const credentialsCount = profile.data.credentials?.length || 0;
    const skillsCount =
      (profile.data.skill_groups?.length || 0) +
      (profile.data.links?.length || 0);
    const languagesCount = profile.data.languages?.length || 0;
    const interestsCount = profile.data.interests?.length || 0;
    const extrasCount = profile.data.extras?.length || 0;

    return {
      basicsCount,
      academicsCount,
      experienceCount,
      publicationsCount,
      projectsCount,
      talksCount,
      honorsCount,
      credentialsCount,
      skillsCount,
      languagesCount,
      interestsCount,
      extrasCount,
    };
  }, [profile]);

  // Define sections based on counts
  const RAW_SECTIONS: SectionMeta[] = React.useMemo(() => [
    {
      key: "basics",
      label: "Basics",
      description: "Name, contact details, location, and profile tags.",
      icon: <User className="size-4" />,
      count: counts.basicsCount,
      defaultSelected: true,
    },
    {
      key: "academics",
      label: "Academics",
      description: "Education history and research projects from your profile.",
      icon: <BookOpen className="size-4" />,
      count: counts.academicsCount,
      defaultSelected: true,
    },
    {
      key: "experience",
      label: "Experience",
      description: "Internships, jobs, and teaching roles you've added.",
      icon: <Briefcase className="size-4" />,
      count: counts.experienceCount,
      defaultSelected: true,
    },
    {
      key: "publications",
      label: "Publications",
      description: "Papers and research publications from your profile.",
      icon: <FileText className="size-4" />,
      count: counts.publicationsCount,
      defaultSelected: true,
    },
    {
      key: "projects",
      label: "Projects",
      description: "Personal and academic projects you've completed.",
      icon: <FileText className="size-4" />,
      count: counts.projectsCount,
      defaultSelected: true,
    },
    {
      key: "talks",
      label: "Talks",
      description: "Presentations and talks you've given.",
      icon: <FileText className="size-4" />,
      count: counts.talksCount,
      defaultSelected: true,
    },
    {
      key: "honors",
      label: "Honors & Awards",
      description: "Awards, honors, and recognitions you've received.",
      icon: <Award className="size-4" />,
      count: counts.honorsCount,
      defaultSelected: true,
    },
    {
      key: "credentials",
      label: "Credentials",
      description: "Certificates, exams, and other formal credentials.",
      icon: <Award className="size-4" />,
      count: counts.credentialsCount,
      defaultSelected: true,
    },
    {
      key: "skills",
      label: "Skills & Links",
      description: "Stacks, tools, and important external links.",
      icon: <Sparkles className="size-4" />,
      count: counts.skillsCount,
      defaultSelected: true,
    },
    {
      key: "languages",
      label: "Languages",
      description: "Languages you speak and your proficiency level.",
      icon: <Globe2 className="size-4" />,
      count: counts.languagesCount,
      defaultSelected: true,
    },
    {
      key: "interests",
      label: "Interests",
      description: "Interests that add personality and context.",
      icon: <Brain className="size-4" />,
      count: counts.interestsCount,
      defaultSelected: true,
    },
    {
      key: "extras",
      label: "Extras",
      description: "Any extra custom fields you've defined on your profile.",
      icon: <Globe2 className="size-4" />,
      count: counts.extrasCount,
      defaultSelected: true,
    },
  ], [counts]);

  const [sections, setSections] = React.useState<SectionMeta[]>([]);

  // Update sections when RAW_SECTIONS changes
  React.useEffect(() => {
    if (RAW_SECTIONS.length > 0) {
      setSections(RAW_SECTIONS);
    }
  }, [RAW_SECTIONS]);

  const [selected, setSelected] = React.useState<Record<SectionKey, boolean>>({});

  // Initialize selected state when sections are set
  React.useEffect(() => {
    if (sections.length > 0) {
      setSelected(
        sections.reduce(
          (acc, s) => {
            acc[s.key] = s.defaultSelected;
            return acc;
          },
          {} as Record<SectionKey, boolean>
        )
      );
    }
  }, [sections]);

  const [syncProfile, setSyncProfile] = React.useState(false);

  const dragKey = React.useRef<SectionKey | null>(null);

  const sectionsSelected = React.useMemo(
    () => sections.filter((s) => selected[s.key]).length,
    [sections, selected]
  );

  const totalItems = React.useMemo(
    () =>
      sections.reduce(
        (sum, s) => sum + (selected[s.key] ? s.count || 0 : 0),
        0
      ),
    [sections, selected]
  );

  const toggleSection = (key: SectionKey) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDragStart = (key: SectionKey, e: React.DragEvent) => {
    dragKey.current = key;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    dragKey.current = null;
  };

  const handleDrop = (targetKey: SectionKey) => {
    const sourceKey = dragKey.current;
    if (!sourceKey || sourceKey === targetKey) return;

    setSections((prev) => {
      const next = [...prev];
      const fromIndex = next.findIndex((s) => s.key === sourceKey);
      const toIndex = next.findIndex((s) => s.key === targetKey);
      if (fromIndex === -1 || toIndex === -1) return prev;

      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });

    dragKey.current = null;
  };

  const handleCancel = () => {
    navigate(ROUTES.DASHBOARD_RESUME_MAKER);
  };

  const handleContinue = async () => {
    if (!profile?.data) return;

    try {
      const filteredData = { ...profile.data };

      if (!selected.academics) filteredData.academics = [];
      if (!selected.experience) filteredData.experience = [];
      if (!selected.credentials) filteredData.credentials = [];
      if (!selected.languages) filteredData.languages = [];
      if (!selected.interests) filteredData.interests = [];
      if (!selected.extras) filteredData.extras = [];

      if (!selected.skills) {
        filteredData.skill_groups = [];
        filteredData.links = [];
      }

      if (!selected.publications && !selected.projects && !selected.talks && !selected.honors) {
        filteredData.output = [];
      } else if (filteredData.output) {
        filteredData.output = filteredData.output.filter((o) => {
          const t = o.type?.toLowerCase() || "";
          const isPub = t === "paper" || t === "publication";
          const isProj = t === "project";
          const isTalk = t === "talk";
          const isHonor = t === "honor and award" || t === "honor_and_award" || t === "honor";

          return (
            (isPub && selected.publications) ||
            (isProj && selected.projects) ||
            (isTalk && selected.talks) ||
            (isHonor && selected.honors) ||
            (!isPub && !isProj && !isTalk && !isHonor) // keep miscellaneous data (unmodified)
          );
        });
      }

      // 1. Add a calculator to extract the profile's original score
      const { profileToResumePayload, calculateCompleteness } = await import("@/lib/resumeAdapter");

      // 2. Calculate the exact percentage of the profile data (before converting to a resume)
      const exactProfileScore = calculateCompleteness(filteredData);

      const payload = profileToResumePayload(filteredData, "Resume from Profile");

      // 3. Force-inject the percentage into the tags and the resume's main field
      payload.completeness = exactProfileScore;
      payload.tags = payload.tags || [];
      payload.tags = payload.tags.filter((t: string) => !t.startsWith("completeness:"));
      payload.tags.push(`completeness:${exactProfileScore}`);

      const newResume = await createResume({
        ...payload,
        status: "draft"
      });

      toast.success("Resume created from profile successfully!");
      navigate(resumeBuilderPath(newResume.id));
    } catch (error: any) {
      console.error("Failed to create resume from profile:", error);
      toast.error(error.message || "Failed to create resume from profile");
    }
  };
  // Show loading state while profile is being fetched
  if (loading) {
    return (
      <div className="profejoo flex min-h-dvh flex-col items-center justify-center bg-muted/10">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profejoo flex min-h-dvh flex-col bg-muted/10">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden h-9 w-9 rounded-full border bg-background text-muted-foreground shadow-sm hover:bg-muted sm:inline-flex"
            onClick={() => navigate(-1)}
            aria-label="Back to resumes"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:bg-muted sm:hidden"
                onClick={() => navigate(-1)}
                aria-label="Back to resumes"
              >
                <ArrowLeft className="size-4" />
              </button>
              <h1 className="text-lg font-semibold sm:text-xl">
                Build from Profile
              </h1>
            </div>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Select which profile sections to include in your new resume. You
              can change this later in the editor.
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            {/* Left: sections list */}
            <Card className="rounded-[var(--radius-lg)] border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span
                    className="
                      inline-flex h-8 w-8 items-center justify-center
                      rounded-xl
                      bg-[var(--primary-50)]
                      text-[var(--primary-400)]
                    "
                  >
                    <User className="size-4" />
                  </span>
                  <span>Your Profile Sections</span>
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Toggle and reorder the sections you want to pull into this
                  resume.
                </p>
              </CardHeader>

              <CardContent className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  {sections.map((section) => (
                    <div
                      key={section.key}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={() => handleDrop(section.key)}
                      className="
                        group flex w-full items-center justify-between gap-3
                        rounded-xl border border-[var(--profejoo-border)]
                        bg-card px-3 py-3 text-left text-sm
                        transition-colors hover:bg-muted/70
                      "
                    >
                      <div className="flex items-center gap-3">
                        {/* Drag handle */}
                        <div
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(section.key, e)
                          }
                          onDragEnd={handleDragEnd}
                          className="
                            hidden h-6 w-6 cursor-grab items-center justify-center
                            rounded-full text-muted-foreground/70
                            hover:text-foreground active:cursor-grabbing
                            sm:inline-flex
                          "
                          aria-label="Reorder section"
                        >
                          <GripVertical className="size-4" />
                        </div>

                        <Checkbox
                          checked={Boolean(selected[section.key])}
                          onCheckedChange={() =>
                            toggleSection(section.key)
                          }
                          className="checkbox-primary"
                          aria-label={`Toggle ${section.label}`}
                        />

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            {/* Icon for all sections: secondary-style */}
                            <span
                              className="
                                inline-flex h-7 w-7 items-center justify-center
                                rounded-lg border bg-transparent
                                border-[var(--secondary-400)]
                                text-[var(--secondary-400)]
                                text-xs
                                group-hover:bg-[var(--secondary-50)]
                              "
                            >
                              {section.icon}
                            </span>
                            <span className="font-medium">
                              {section.label}
                            </span>
                          </div>
                          <p className="pl-9 text-xs text-muted-foreground">
                            {section.description}
                          </p>
                        </div>
                      </div>

                      {/* Count chip: outline in secondary color */}
                      <span
                        className="
                          inline-flex min-w-[2.2rem] items-center justify-center
                          rounded-full px-2 py-0.5 text-xs font-medium
                          profejoo-border-secondary
                        "
                      >
                        {section.count}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Sync toggle – we keep this as accent here so it stands out */}
                <div
                  className="
                    mt-4 rounded-xl border
                    border-muted
                    bg-muted/40 px-4 py-3 text-sm
                  "
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        Sync future profile changes
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Automatically update this resume when you edit your
                        profile. You can turn this off at any time.
                      </p>
                    </div>
                    <Switch
                      checked={syncProfile}
                      onCheckedChange={setSyncProfile}
                      aria-label="Toggle sync future profile changes"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right: preview */}
            <Card className="hidden min-h-[420px] items-center justify-center rounded-[var(--radius-lg)] bg-muted/60 p-4 shadow-sm sm:flex">
              <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border border-dashed border-muted-foreground/40 bg-background/60 px-6 py-10 text-center">
                <div
                  className="
                    flex h-14 w-14 items-center justify-center
                    rounded-2xl
                    bg-[var(--tertiary-50)]
                    text-[var(--tertiary-400)]
                  "
                >
                  <FileText className="size-6" />
                </div>
                <h2 className="mt-4 text-sm font-semibold">
                  Resume preview coming soon
                </h2>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  Profejoo will pre-fill your resume with the selected profile
                  sections. On the next step you’ll choose a template and tweak
                  every detail.
                </p>
              </div>
            </Card>
          </div>

          {/* Footer / summary */}
          <div className="mt-2 flex flex-col items-center justify-between gap-3 border-t pt-4 text-xs sm:flex-row sm:text-sm">
            <div className="flex flex-col gap-1 text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">
                  Sections selected:
                </span>{" "}
                {sectionsSelected} / {sections.length}
              </span>
              <span>
                <span className="font-medium text-foreground">
                  Total items:
                </span>{" "}
                {totalItems}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="btn btn--outline-accent btn--sm"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleContinue}
                className="btn btn--primary btn--sm"
              >
                Continue to template
                <ChevronRight className="ml-1.5 size-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
