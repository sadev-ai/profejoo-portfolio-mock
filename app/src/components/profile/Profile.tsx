// src/components/profile/Profile.tsx
import * as React from "react";
import useScrollSpy from "@/hooks/useScrollSpy";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";

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

import { useProfile } from "@/context/ProfileContext";
import { useProfileSectionCounts } from "@/hooks/useProfileSectionCounts";
import { calculateCompleteness } from "@/lib/resumeAdapter";

export default function Profile() {
  const spy = useScrollSpy();
  const { profile, loading } = useProfile();

  const { counts, applyOverride: onCountsChange } = useProfileSectionCounts(profile?.data);

  const completeness = calculateCompleteness(profile?.data);

  if (loading) {
    return (
      <div className="profejoo flex-1 w-full min-h-0 flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <main className="profejoo flex-1 w-full min-h-0 overflow-y-auto no-scrollbar relative" data-spy-root>
      <ProfileHeader completeness={completeness} headerRef={spy.headerRef} />
      {/* reserves the space the now fixed-position header takes up */}
      <div style={{ height: spy.headerH }} aria-hidden="true" />
      <ProfileTabs {...spy} counts={counts} />
      <div className="w-full px-4 md:px-6 pb-12">
        <div ref={spy.sentinelRef} className="h-1" />
        <div className="profile-section-grid mt-6 md:mt-8 grid w-full auto-rows-fr items-stretch gap-6 grid-cols-1 lg:grid-cols-2">
          <div className="h-full"><BasicsSection attachRef={(el) => (spy.sectionRefs.current.basics = el)} /></div>
          <div className="h-full"><EducationsSection attachRef={(el) => (spy.sectionRefs.current.academics = el)} onCountsChange={onCountsChange} /></div>
          <div className="h-full"><ExperienceSection attachRef={(el) => (spy.sectionRefs.current.experience = el)} onCountsChange={onCountsChange} /></div>
          <div className="h-full"><PublicationsSection attachRef={(el) => (spy.sectionRefs.current.publications = el)} onCountsChange={onCountsChange} /></div>
          <div className="h-full"><ProjectsSection attachRef={(el) => (spy.sectionRefs.current.projects = el)} onCountsChange={onCountsChange} /></div>
          <div className="h-full"><TalksSection attachRef={(el) => (spy.sectionRefs.current.talks = el)} onCountsChange={onCountsChange} /></div>
          <div className="h-full"><HonorsSection attachRef={(el) => (spy.sectionRefs.current.honors = el)} onCountsChange={onCountsChange} /></div>
          <div className="h-full"><CredentialsSection attachRef={(el) => (spy.sectionRefs.current.credentials = el)} onCountsChange={onCountsChange} /></div>
          <div className="h-full"><SkillsLinksSection attachRef={(el) => (spy.sectionRefs.current.skills = el)} onCountsChange={onCountsChange} /></div>
          <div className="h-full"><LanguagesSection attachRef={(el) => (spy.sectionRefs.current.languages = el)} onCountsChange={onCountsChange} /></div>
          <div className="h-full"><InterestsSection attachRef={(el) => (spy.sectionRefs.current.interests = el)} onCountsChange={onCountsChange} /></div>
          <div className="h-full"><ExtrasSection attachRef={(el) => (spy.sectionRefs.current.extras = el)} onCountsChange={onCountsChange} /></div>
        </div>
      </div>
    </main>
  );
}