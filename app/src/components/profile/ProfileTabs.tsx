import { Tabs, TabsList } from "@/components/ui/tabs";
import TabBtn from "@/components/profile/TabBtn";
import type { ScrollSpyApi, SectionKey } from "@/hooks/useScrollSpy";
import type { Counts } from "@/lib/profileCompleteness";
import {
  User,
  GraduationCap,
  Briefcase,
  FileText,
  FolderKanban,
  Presentation,
  Award,
  BadgeCheck,
  Wrench,
  Languages,
  Heart,
  SquarePlus,
} from "lucide-react";

type Props = Pick<
  ScrollSpyApi,
  "active" | "jumpTo" | "headerH" | "pinned" | "tabsWrapRef" | "listRef" | "triggersRef" | "indicator"
> & {
  counts?: Partial<Counts>;
};

export default function ProfileTabs({
  active,
  jumpTo,
  headerH,
  pinned,
  tabsWrapRef,
  listRef,
  triggersRef,
  counts,
}: Props) {
  const education = counts?.education ?? 0;
  const experience = counts?.experience ?? 0;
  const publications = counts?.publications ?? 0;
  const projects = counts?.projects ?? 0;
  const talks = counts?.talks ?? 0;
  const honors = counts?.honors ?? 0;
  const credentials = counts?.credentials ?? 0;
  const skillGroups = counts?.skillGroups ?? 0;
  const links = counts?.links ?? 0;
  const languages = counts?.languages ?? 0;
  const interests = counts?.interests ?? 0;
  const extras = counts?.extras ?? 0;

  return (
    <div
      ref={tabsWrapRef}
      style={{ top: headerH || 0 }}
      className={[
        "sticky z-30 w-full my-4",
        pinned ? "bg-background/80 my-4 backdrop-blur-sm border-b shadow-sm" : "",
      ].join(" ")}
    >
      <div className="w-full mx-auto px-4 md:px-6">
          <Tabs value={active} onValueChange={(v) => jumpTo(v as SectionKey)} className="overflow-x-auto overflow-y-hidden no-scrollbar">
            <TabsList
              ref={listRef}
              aria-label="Profile sections"
              className="
                relative inline-flex items-center gap-1.5 sm:gap-2 p-2
                rounded-full bg-muted/70 backdrop-blur-sm border border-border
                whitespace-nowrap min-h-14
              "
            >
          {/* If you want to bring back the line indicator, add this span
              and wire up the indicator.left/width values the same way you already have them. */}

          <TabBtn
            value="basics"
            label="Basics"
            Icon={User}
            nodeRef={(el) => (triggersRef.current.basics = el)}
          />

          <TabBtn
            value="academics"
            label="Education"
            Icon={GraduationCap}
            count={education}
            nodeRef={(el) => (triggersRef.current.academics = el)}
          />

          <TabBtn
            value="experience"
            label="Experience"
            Icon={Briefcase}
            count={experience}
            nodeRef={(el) => (triggersRef.current.experience = el)}
          />

          <TabBtn
            value="publications"
            label="Publications"
            Icon={FileText}
            count={publications}
            nodeRef={(el) => (triggersRef.current.publications = el)}
          />

          <TabBtn
            value="projects"
            label="Projects"
            Icon={FolderKanban}
            count={projects}
            nodeRef={(el) => (triggersRef.current.projects = el)}
          />

          <TabBtn
            value="talks"
            label="Talks"
            Icon={Presentation}
            count={talks}
            nodeRef={(el) => (triggersRef.current.talks = el)}
          />

          <TabBtn
            value="honors"
            label="Honors & Awards"
            Icon={Award}
            count={honors}
            nodeRef={(el) => (triggersRef.current.honors = el)}
          />

          <TabBtn
            value="credentials"
            label="Credentials"
            Icon={BadgeCheck}
            count={credentials}
            nodeRef={(el) => (triggersRef.current.credentials = el)}
          />

          <TabBtn
            value="skills"
            label="Skills & Links"
            Icon={Wrench}
            count={skillGroups + links}
            nodeRef={(el) => (triggersRef.current.skills = el)}
          />

          <TabBtn
            value="languages"
            label="Languages"
            Icon={Languages}
            count={languages}
            nodeRef={(el) => (triggersRef.current.languages = el)}
          />

          <TabBtn
            value="interests"
            label="Interests"
            Icon={Heart}
            count={interests}
            nodeRef={(el) => (triggersRef.current.interests = el)}
          />

          <TabBtn
            value="extras"
            label="Extras"
            Icon={SquarePlus}
            count={extras}
            nodeRef={(el) => (triggersRef.current.extras = el)}
          />
            </TabsList>
          </Tabs>
      </div>
    </div>
  );
}
