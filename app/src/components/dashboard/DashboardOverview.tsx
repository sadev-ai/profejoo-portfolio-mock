// src/components/dashboard/DashboardOverview.tsx
import * as React from "react";
import { ProfileCard } from "./ProfileCard";
import { PlanCard } from "./PlanCard";
import { NotificationsCard } from "./NotificationsCard";
import { ResourcesCard } from "./ResourcesCard";
import { LikesCard } from "./LikesCard";
import { QuickStatsCard } from "./QuickStatsCard";
import { HistoryCard, type HistoryItem } from "./HistoryCard";
import { useProfile } from "@/context/ProfileContext";
import { useAuth } from "@/hooks/useAuth";
import { useResume } from "@/context/ResumeContext";
import { calculateCompleteness } from "@/lib/completeness";
import { toResumeItem } from "@/components/Resume/Resumes";
import type { EmailSOPItem } from "@/components/emailsop";
import { readEmailSOPsRaw } from "@/lib/emailSopStorage";

// Email/SOP documents aren't backed by an API yet -- EmailSOPs.tsx persists
// them straight to localStorage under this key. Read the same key here (but
// skip its mock-data seed) so the dashboard reflects the user's *actual*
// documents instead of always showing zero, and doesn't invent fake ones for
// a brand-new account either.
function readEmailSOPs(): EmailSOPItem[] {
  try {
    const stored = readEmailSOPsRaw();
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

type SortableHistoryItem = HistoryItem & { _sortTime: number };

export default function DashboardOverview() {
  const { profile } = useProfile();
  const { user } = useAuth();
  const { resumes: backendResumes, refreshResumes } = useResume();

  const basics = profile?.data?.basics;
  const fullName = `${basics?.first_name || ''} ${basics?.last_name || ''}`.trim() || user?.email || 'User';
  const tags = basics?.tags || [];
  const city = basics?.city || '';
  const country = basics?.country || '';
  const location = [city, country].filter(Boolean).join(', ');

  const academics = profile?.data?.academics || [];
  const latestAcademic = academics.length > 0 ? academics[academics.length - 1] : null;

  React.useEffect(() => {
    refreshResumes();
  }, [refreshResumes]);

  // Same live scorer used on the Profile page (Profile.tsx) and every resume
  // builder page -- previously this read `profile.completeness` straight off
  // the API response, which isn't recalculated as the user edits their
  // profile the way this client-side calculation (from profile.data) is.
  const completeness = calculateCompleteness(profile?.data);

  // Real resumes, adapted with the exact same logic the Resumes page itself
  // uses (title, status, completeness, updatedAt).
  const resumeItems = React.useMemo(() => backendResumes.map(toResumeItem), [backendResumes]);

  const emailSops = React.useMemo(() => readEmailSOPs(), []);
  const emailCount = emailSops.filter((e) => e.docType === "Email").length;
  const sopCount = emailSops.filter((e) => e.docType === "SOP").length;

  const searchStats = {
    universities: 0,
    professors: 0,
  };

  const resources = [
    { id: "r1", title: "AI Professor & University Finder", description: "Chat with our AI to find the perfect match", variant: "primary" as const, url: "/chatbot" },
    { id: "r2", title: "Resume, SOP & Application Builder", description: "Create professional documents with AI assistance", variant: "secondary" as const, url: "/resume" },
    { id: "r3", title: "University & Faculty Search", description: "Advanced search with filters", variant: "tertiary" as const, url: "/search" },
    { id: "r4", title: "Educational Resources", description: "Guides, webinars and learning materials", variant: "accent" as const, url: "/resources" },
  ];

  const likes = [
    { id: "l1", title: "Dr. Mehrdad Ashtiani", subtitle: "Iran University of Science and Technology", chips: ["Professor"], kind: "professor" as const },
    { id: "l2", title: "Iran University of Science and Technology", subtitle: "Engineering", chips: ["University"], kind: "university" as const },
    { id: "l3", title: "Iran University of Science and Technology", subtitle: "Engineering", chips: ["University"], kind: "university" as const },
  ];

  // Real counts, based on the user's actual resumes and email/SOP documents.
  const documents = [
    { label: "Resume", value: resumeItems.length, color: "primary" as const },
    { label: "Email", value: emailCount, color: "secondary" as const },
    { label: "SOP", value: sopCount, color: "accent" as const },
  ];

  const searched = [
    { label: "Universities", value: searchStats.universities, color: "primary" as const },
    { label: "Professors", value: searchStats.professors, color: "secondary" as const },
  ];

  // Most recently updated resumes + email/SOPs, newest first -- replaces the
  // previously hardcoded, always-the-same "history" feed.
  const history: HistoryItem[] = React.useMemo(() => {
    const fromResumes: SortableHistoryItem[] = resumeItems.map((r) => ({
      id: `resume-${r.id}`,
      title: r.title,
      type: "document",
      subtitle: `Resume • ${r.completeness}% complete`,
      timeAgo: timeAgo(r.updatedAt),
      _sortTime: new Date(r.updatedAt).getTime() || 0,
    }));

    const fromEmailSops: SortableHistoryItem[] = emailSops.map((e) => ({
      id: `emailsop-${e.id}`,
      title: e.title,
      type: "document",
      subtitle: e.docType === "SOP" ? "Statement of Purpose" : "Email",
      timeAgo: timeAgo(e.updatedAt),
      _sortTime: new Date(e.updatedAt).getTime() || 0,
    }));

    return [...fromResumes, ...fromEmailSops]
      .sort((a, b) => b._sortTime - a._sortTime)
      .slice(0, 5)
      .map(({ _sortTime, ...rest }) => rest);
  }, [resumeItems, emailSops]);

  return (
    <div className="profejoo w-full flex items-center justify-center">
      {/* 🔹 Exactly px-4 (1rem) and a 1440px max-width so the edges stay in sync */}
      <div className="mx-4 w-full">
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-4">
          <div className="flex flex-col gap-4 lg:w-1/2">
            <ProfileCard
              name={fullName}
              role={latestAcademic?.title || 'Student'}
              university={latestAcademic?.institution || 'Not specified'}
              location={latestAcademic?.institution ? location : undefined}
              tags={tags}
              avatarUrl={basics?.avatar_url}
              email={basics?.email || user?.email}
            />
            <PlanCard planName="Free" daysLeft={null} pricePerMonth={0} />
            <NotificationsCard />
            <LikesCard items={likes} />
            <div className="lg:flex-1">
              <ResourcesCard items={resources} />
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:w-1/2">
            <QuickStatsCard
              profileCompleted={Math.round(completeness)}
              documents={documents}
              searched={searched}
            />
            <HistoryCard items={history} />
          </div>
        </div>
      </div>
    </div>
  );
}
