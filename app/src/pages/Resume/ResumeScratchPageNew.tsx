// src/pages/Resume/ResumeScratchPageNew.tsx
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar/Navbar";
import useScrollSpy from "@/hooks/useScrollSpy";
import { ROUTES, resumeEditPath, resumeBuilderPath } from "@/constants/routes";
import { ProfileContext, useProfile, type ProfileContextType } from "@/context/ProfileContext";
import { useResume } from "@/context/ResumeContext";
import { toast } from "sonner";
import type { ProfileData, ProfileResponse } from "@/types/profile";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { profileToResumePayload, calculateCompleteness } from "@/lib/resumeAdapter";
import { getAvatarColorFromEmail } from "@/lib/avatarUtils";
import { Progress } from "@/components/ui/progress";
import { useProfileSectionCounts } from "@/hooks/useProfileSectionCounts";

import BasicsSection from "@/components/profile/BasicsSection";
import EducationsSection from "@/components/profile/EducationsSection";
import ExperienceSection from "@/components/profile/ExperienceSection";
import PublicationsSection from "@/components/profile/PublicationsSection";
import ProjectsSection from "@/components/profile/ProjectsSection";
import TalksSection from "@/components/profile/TalksSection";
import HonorsSection from "@/components/profile/HonorsSection";
import CredentialsSection from "@/components/profile/CredentialSection";
import SkillsLinksSection from "@/components/profile/SkillsLinksSection";
import LanguagesSection from "@/components/profile/LanguagesSection";
import InterestsSection from "@/components/profile/InterestsSection";
import ExtrasSection from "@/components/profile/ExtrasSection";

const emptyProfileData: any = {
  basics: { first_name: "", last_name: "", full_name: "", email: "", phone: "", city: "", country: "", location: "", website: "", linkedin: "", summary: "", avatar_url: "", birthday: "", gender: "", tags: [] },
  academics: [], experience: [], output: [], credentials: [], skill_groups: [], links: [], languages: [], interests: [], extras: [],
};

function LocalProfileProvider({ children, initialData, onDataChange, onCompletenessChange }: { children: React.ReactNode; initialData: ProfileData; onDataChange?: (data: ProfileData) => void; onCompletenessChange?: (completeness: number) => void; }) {
  const [profileData, setProfileData] = React.useState<ProfileData>(initialData);
  const prevInitialDataRef = React.useRef<ProfileData>(initialData);

  React.useEffect(() => {
    if (initialData !== prevInitialDataRef.current) { setProfileData(initialData); prevInitialDataRef.current = initialData; }
  }, [initialData]);

  const completeness = React.useMemo(() => calculateCompleteness(profileData), [profileData]);
  React.useEffect(() => { if (onCompletenessChange) onCompletenessChange(completeness); }, [completeness, onCompletenessChange]);

  const profile: ProfileResponse = { profile_id: 0, completeness, data: profileData, updated_at: new Date().toISOString() };

  const updateProfile = async (updates: Partial<ProfileData>): Promise<ProfileResponse> => {
    const newData = { ...profileData, ...updates };
    setProfileData(newData);
    if (onDataChange) onDataChange(newData);
    return { profile_id: 0, completeness: calculateCompleteness(newData), data: newData, updated_at: new Date().toISOString() };
  };

  const value: ProfileContextType = { profile, loading: false, error: null, refreshProfile: async () => { }, updateProfile, clearError: () => { } };
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

function ResumeContent({ resumeId: initialResumeId, currentStatus }: { resumeId?: string; currentStatus?: string }) {
  const navigate = useNavigate();
  const spy = useScrollSpy();
  const [isAutoSaving, setIsAutoSaving] = React.useState(false);
  const [resumeStatus, setResumeStatus] = React.useState<string>(currentStatus || "draft");
  const [resumeId, setResumeId] = React.useState<string | undefined>(initialResumeId);
  const [lastSavedData, setLastSavedData] = React.useState<ProfileData | null>(null);

  const { profile } = useProfile();
  const fixedAvatarColor = React.useMemo(
    () =>
      profile?.data?.basics?.email
        ? getAvatarColorFromEmail(profile.data.basics.email)
        : "hsl(200, 70%, 50%)",
    [profile?.data?.basics?.email],
  );
  const { createResume, updateResume: updateResumeAPI } = useResume();

  React.useEffect(() => {
    if (currentStatus) setResumeStatus(currentStatus);
  }, [currentStatus]);

  React.useEffect(() => {
    if (resumeId && profile?.data && !lastSavedData) setLastSavedData(profile.data);
  }, [resumeId, profile?.data, lastSavedData]);

  React.useEffect(() => {
    if (!profile?.data) return;
    if (lastSavedData && JSON.stringify(profile.data) === JSON.stringify(lastSavedData)) return;

    const timeoutId = setTimeout(async () => {
      try {
        setIsAutoSaving(true);
        const title =
          profile.data.basics?.first_name || profile.data.basics?.last_name
            ? `${profile.data.basics.first_name || ""} ${profile.data.basics.last_name || ""} - Resume`.trim()
            : `Resume ${new Date().toLocaleDateString()}`;

        const payload = profileToResumePayload(profile.data, title);

        if (resumeId) {
          await updateResumeAPI(resumeId, {
            sections: payload.sections,
            status: resumeStatus as any,
            tags: payload.tags,
            completeness: payload.completeness,
            source: "manual",
          });
        } else {
          const newResume = await createResume({
            ...payload,
            status: "draft",
            completeness: payload.completeness,
            source: "manual",
          });
          setResumeId(String(newResume.id));
          window.history.replaceState(null, "", resumeEditPath(newResume.id));
        }
        setLastSavedData(profile.data);
      } catch (error: any) {
        console.error("Auto-save failed:", error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [profile?.data, resumeId, lastSavedData, updateResumeAPI, createResume, resumeStatus]);

  const { counts, applyOverride: onCountsChange } = useProfileSectionCounts(profile?.data);

  const completeness = calculateCompleteness(profile?.data);
  const pct = completeness;
  const isDraft = resumeStatus === "draft";

  const handleDesignTemplate = async (downloadPdf = false) => {
    if (!profile?.data) {
      toast.error("No resume data to design");
      return;
    }
    if (resumeId) {
      navigate(resumeBuilderPath(resumeId, { downloadPdf }));
    } else {
      toast.error("Please wait a moment for saving...");
    }
  };

  const handlePublish = async () => {
    if (!profile?.data) return;
    try {
      if (resumeId) {
        await updateResumeAPI(resumeId, { status: "published" });
        setResumeStatus("published");
        toast.success("Resume published successfully!");
      }
      setTimeout(() => navigate(ROUTES.DASHBOARD_RESUME_MAKER), 500);
    } catch (error: any) {
      toast.error(error.message || "Failed to publish resume");
    }
  };

  const [mode, setMode] = React.useState<"expanded" | "mini">("expanded");
  const [open, setOpen] = React.useState<
    Record<"profile" | "plans" | "resources" | "favorites" | "history", boolean>
  >({
    profile: false,
    plans: false,
    resources: false,
    favorites: false,
    history: false,
  });
  const toggleOne = (k: "profile" | "plans" | "resources" | "favorites" | "history") =>
    setOpen((s) => ({
      profile: false,
      plans: false,
      resources: false,
      favorites: false,
      history: false,
      [k]: !s[k],
    }));

  return (
    <div className="profejoo flex h-dvh flex-col bg-background">
      {/* Navbar as before, no change needed to the main page style */}
      <div className="shrink-0 z-40 relative">
        <Navbar
          mode={mode}
          onToggleSidebar={() =>
            setMode((m) => (m === "expanded" ? "mini" : "expanded"))
          }
          open={open}
          onToggleOne={toggleOne}
        />
      </div>

      {/* We set this up like Profile */}
      <main
        className="profejoo flex-1 w-full min-h-0 overflow-y-auto no-scrollbar relative"
        data-spy-root
      >
        {/* Instead of a sticky header, we could build a dedicated resume Header like ProfileHeader,
            or if you don't want to build a separate component right now, just put this block inside a simple div */}
        <div
          ref={spy.headerRef}
          className="fixed left-0 right-0 top-[96px] lg:top-[104px] z-20 w-full px-4 md:px-6 pt-4 sm:pt-4 pb-4 border-b bg-background/80 supports-backdrop-filter:backdrop-blur flex items-center"
        >
          <div className="hidden sm:flex w-1/2 items-center gap-2 sm:gap-3">
            <h1 className="text-lg sm:text-xl font-bold">Resume Builder</h1>
          </div>

          <div className="w-full sm:w-1/2 ms-auto flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
            <div className="flex items-center gap-2 mr-2">
              {isAutoSaving ? (
                <span className="text-xs text-muted-foreground animate-pulse flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                </span>
              ) : lastSavedData ? (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" /> Saved
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-primary-400 text-xs">Completeness</span>
              <div className="w-24 sm:w-36">
                <Progress value={pct} className="h-2" />
              </div>
              <span className="text-xs tabular-nums">{pct}%</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDesignTemplate(false)}
                className="btn btn--outline-tertiary btn--sm"
              >
                <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Design template</span>
                <span className="sm:hidden">Design</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDesignTemplate(true)}
                className="btn btn--outline-accent btn--sm"
              >
                <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Export PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              {isDraft && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handlePublish}
                  className="btn btn--primary btn--sm"
                >
                  <Check className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Publish</span>
                  <span className="sm:hidden">Publish</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* reserves the space the now fixed-position header takes up */}
        <div style={{ height: spy.headerH }} aria-hidden="true" />

        {/* Tabs like Profile */}
        <ProfileTabs {...spy} counts={counts} />

        {/* Body section like Profile: px, pb, and grid */}
        <div className="w-full px-4 md:px-6 pb-12">
          <div ref={spy.sentinelRef} className="h-1" />
          <div className="profile-section-grid  grid w-full auto-rows-fr items-stretch gap-6 grid-cols-1 lg:grid-cols-2">
            <div className="h-full">
              <BasicsSection
                attachRef={(el) => (spy.sectionRefs.current.basics = el)}
                enableEmailEdit={true}
                fixedAvatarColor={fixedAvatarColor}
              />
            </div>
            <div className="h-full">
              <EducationsSection
                attachRef={(el) => (spy.sectionRefs.current.academics = el)}
                onCountsChange={onCountsChange}
              />
            </div>
            <div className="h-full">
              <ExperienceSection
                attachRef={(el) => (spy.sectionRefs.current.experience = el)}
                onCountsChange={onCountsChange}
              />
            </div>
            <div className="h-full">
              <PublicationsSection
                attachRef={(el) => (spy.sectionRefs.current.publications = el)}
                onCountsChange={onCountsChange}
              />
            </div>
            <div className="h-full">
              <ProjectsSection
                attachRef={(el) => (spy.sectionRefs.current.projects = el)}
                onCountsChange={onCountsChange}
              />
            </div>
            <div className="h-full">
              <TalksSection
                attachRef={(el) => (spy.sectionRefs.current.talks = el)}
                onCountsChange={onCountsChange}
              />
            </div>
            <div className="h-full">
              <HonorsSection
                attachRef={(el) => (spy.sectionRefs.current.honors = el)}
                onCountsChange={onCountsChange}
              />
            </div>
            <div className="h-full">
              <CredentialsSection
                attachRef={(el) => (spy.sectionRefs.current.credentials = el)}
                onCountsChange={onCountsChange}
              />
            </div>
            <div className="h-full">
              <SkillsLinksSection
                attachRef={(el) => (spy.sectionRefs.current.skills = el)}
                onCountsChange={onCountsChange}
              />
            </div>
            <div className="h-full">
              <LanguagesSection
                attachRef={(el) => (spy.sectionRefs.current.languages = el)}
                onCountsChange={onCountsChange}
              />
            </div>
            <div className="h-full">
              <InterestsSection
                attachRef={(el) => (spy.sectionRefs.current.interests = el)}
                onCountsChange={onCountsChange}
              />
            </div>
            <div className="h-full">
              <ExtrasSection
                attachRef={(el) => (spy.sectionRefs.current.extras = el)}
                onCountsChange={onCountsChange}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResumeScratchPageNew({ initialData, resumeId, currentStatus }: { initialData?: ProfileData; resumeId?: string; currentStatus?: string; } = {}) {
  const [formData, setFormData] = React.useState<ProfileData>(() => {
    if (initialData) return initialData;
    return emptyProfileData;
  });

  const handleDataChange = React.useCallback((newData: ProfileData) => { }, []);

  return (
    <LocalProfileProvider initialData={formData} onDataChange={handleDataChange}>
      <ResumeContent resumeId={resumeId} currentStatus={currentStatus} />
    </LocalProfileProvider>
  );
}