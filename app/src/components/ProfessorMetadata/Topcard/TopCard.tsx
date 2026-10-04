// components/TopCard.tsx
import React, { useState, useMemo, useCallback } from "react";
import { type Professor } from "../types";
import { GraduationCap, Building2, MapPin } from "lucide-react";
import StatPill from "./StatPill";
import TagPill from "./TagPill";
import ExpandingLink from "./ExpandingLink";
import IconCircleLink from "./IconCircleLink";

type Props = { prof: Professor };

const TopCard: React.FC<Props> = ({ prof }) => {
  // Track the largest measured width reported by child ExpandingLinks

  // Build the list of links we actually have
  const links = useMemo(() => {
    const L: {
      key: string;
      label: string;
      href: string;
      bgClass: string;
      textClass: string;
      icon: React.ReactNode;
    }[] = [];

    if (prof.links.scholar) {
      L.push({
        key: "scholar",
        label: "Google Scholar",
        href: prof.links.scholar,
        bgClass: "bg-[#3f48cc]",
        textClass: "text-white",
        icon: <img
                src="/assets/images/Logos/GoogleScholar-logo.png"
                alt={"Google Scholar"}
                className="h-10 w-10 object-contain"
              />,
      });
    }
    if (prof.links.openalex) {
      L.push({
        key: "openalex",
        label: "OpenAlex",
        href: prof.links.openalex,
        bgClass: "bg-(--better-white)",
        textClass: "text-black",
        icon: <img
                src="/assets/images/Logos/OpenAlex-logo.png"
                alt={"OpenAlex"}
                className="h-8 w-8 object-contain"
              />,
      });
    }
    if (prof.links.orcid) {
      L.push({
        key: "orcid",
        label: "ORCID",
        href: prof.links.orcid,
        bgClass: "bg-[#a6cd3c]",
        textClass: "text-white",
        icon: <img
                src="/assets/images/Logos/Orcid-logo.png"
                alt={"ORCID"}
                className="h-10 w-10 object-contain"
              />,
      });
    }
    if (prof.links.linkedin) {
      L.push({
        key: "linkedin",
        label: "LinkedIn",
        href: prof.links.linkedin,
        bgClass: "bg-[#4071b1]",
        textClass: "text-white",
        icon: <img
                src="/assets/images/Logos/Linkedin-logo.png"
                alt={"LinkedIn"}
                className="h-10 w-10 object-contain"
              />,
      });
    }
    return L;
  }, [prof.links]);

  // Track max expanded width across all links
  const [maxWidth, setMaxWidth] = useState<number>(0);
  const onMeasured = useCallback((w: number) => {
    setMaxWidth((prev) => (w > prev ? w : prev));
  }, []);

  return (
    <section className="bg-white rounded-3xl shadow-md px-6 py-6 md:px-10 md:py-8 flex flex-col gap-4 md:flex-row md:justify-between">
      {/* Left side (unchanged) */}
      <div className="flex flex-col px-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="shrink-0 flex justify- items-center md:justify-start">
            <div className="h-40 w-40 md:h-50 md:w-50 rounded-3xl overflow-hidden bg-slate-200">
              <img src={prof.avatarUrl} alt={prof.name} className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-semibold text-primary-400">{prof.name}</h1>

              <div className="space-y-1 text-sm md:text-base text-(--primary-300)">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-(--primary-200)" />
                  <span>{prof.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-(--primary-200)" />
                  <span>{prof.university}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-(--primary-200)" />
                  <span>{prof.country}, {prof.city}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <StatPill label="Citation" value={prof.stats.citations} className="bg-slate-200/70" />
              <StatPill label="h-index" value={prof.stats.hIndex} className="bg-indigo-100/70" />
              <StatPill label="Years of Activity" value={prof.stats.yearsOfActivity} className="bg-cyan-100/70" />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 w-full mx-4">
          {prof.tags.map((t) => <TagPill key={t} label={t} />)}
        </div>
      </div>

      {/* Right-side link rail — responsive, with Logos */}
      <div className="flex flex-col md:items-end justify-end">
        {/* --- Mobile layout (icons only) --- */}
        <div
          className="
            flex flex-wrap justify-end gap-3
            md:hidden
            w-full
            pr-2
          "
        >
          {links.map((l) => (
            <IconCircleLink
              key={l.key}
              href={l.href}
              ariaLabel={l.label}
              bgClass={l.bgClass}
            >
              {l.icon}
            </IconCircleLink>
          ))}
        </div>
        {/* --- Desktop / Tablet layout (expanding hover links) --- */}
        <div
          className="
            hidden md:flex md:flex-col md:items-end md:gap-4
            w-fit
            pr-1 md:pr-0
          "
          style={{width: maxWidth}} /* TODO: change it later to pure Tailwind -> GPT: Not possible directly */
        >
          {links.map((l) => (
            <ExpandingLink
              key={l.key}
              href={l.href}
              label={l.label}
              bgClass={l.bgClass}
              textClass={l.textClass}
              onMeasured={onMeasured}
              icon={l.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopCard;
