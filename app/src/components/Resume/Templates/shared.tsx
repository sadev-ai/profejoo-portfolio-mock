// src/components/resumes/templates/shared.tsx
//
// Shared building blocks used by all five resume templates. Extracted out
// of ResumeBuilderPage.tsx. OutputBlock and SectionContent now handle all
// four output types (publications/projects/talks/honors) through one
// generic implementation instead of only knowing about two of them.
import * as React from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeUrl, stripHtml, getInitials } from "@/lib/resumeBuilderTypes";
import type {
  DisplayData,
  DisplayOutput,
  SectionKey,
  SectionDragHandlers,
  TemplateEditHandlers,
} from "@/lib/resumeBuilderTypes";

export const PhotoBadge = ({ name, avatarUrl, className }: { name: string; avatarUrl?: string; className?: string }) => (
  <div className={cn("flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[color:var(--resume-line)] bg-[color:var(--resume-soft)] text-xs font-semibold text-[color:var(--resume-accent)]", className)}>
    {avatarUrl ? <img src={avatarUrl} alt={name} className="h-full w-full object-cover" crossOrigin="anonymous" /> : <span>{getInitials(name)}</span>}
  </div>
);

export const EditableText = ({ value, placeholder, onCommit, className, as = "span", multiline = false, href, rich = false }: any) => {
  const ref = React.useRef<HTMLElement | null>(null);
  const [isFocused, setIsFocused] = React.useState(false);
  const Component = as;
  const linkHref = Component === "a" ? normalizeUrl(href || value) : "";
  const isEmpty = stripHtml(value).length === 0;

  React.useEffect(() => {
    if (!ref.current || isFocused) return;
    const current = rich ? ref.current.innerHTML || "" : ref.current.textContent || "";
    if (current !== value) {
      if (rich) { ref.current.innerHTML = value; } else { ref.current.textContent = value; }
    }
  }, [value, isFocused, rich]);

  const commitValue = () => {
    const raw = rich ? ref.current?.innerHTML ?? "" : ref.current?.innerText ?? "";
    const cleaned = rich ? raw.replace(/\r\n/g, "\n").trim() : multiline ? raw.replace(/\r\n/g, "\n").trim() : raw.replace(/\s+/g, " ").trim();
    onCommit(cleaned);
    setIsFocused(false);
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  return (
    <Component
      ref={ref} contentEditable suppressContentEditableWarning
      className={cn("resume-editable", rich ? "rich-text" : "", className)}
      data-placeholder={placeholder} data-empty={isEmpty ? "true" : "false"}
      role="textbox" aria-multiline={multiline || undefined}
      href={linkHref || undefined} target={linkHref ? "_blank" : undefined}
      onFocus={() => setIsFocused(true)} onBlur={commitValue}
      onKeyDown={(event: React.KeyboardEvent) => {
        if (!multiline && event.key === "Enter") { event.preventDefault(); (event.target as HTMLElement).blur(); }
        if (rich && (event.ctrlKey || event.metaKey)) {
          switch (event.key.toLowerCase()) {
            case 'b': event.preventDefault(); document.execCommand('bold'); break;
            case 'i': event.preventDefault(); document.execCommand('italic'); break;
            case 'u': event.preventDefault(); document.execCommand('underline'); break;
          }
        }
      }}
      onPaste={handlePaste}
      onClick={(event: React.MouseEvent) => { if (linkHref) event.preventDefault(); }}
    />
  );
};

export const DraggableSection = ({ sectionKey, title, dragHandlers, children, className, headingVariant }: any) => {
  const isDragging = dragHandlers.draggingSection === sectionKey;
  return (
    <div onDragOver={dragHandlers.onDragOver} onDrop={dragHandlers.onDrop(sectionKey)} className={cn("group rounded-xl transition", isDragging ? "ring-1 ring-[color:var(--resume-accent)]" : "", className)}>
      <div className="flex items-center gap-2" data-resume-atom="heading">
        <span className="pdf-hidden inline-flex cursor-grab items-center text-slate-400" draggable onDragStart={dragHandlers.onDragStart(sectionKey)} onDragEnd={dragHandlers.onDragEnd} title="Drag to reorder"><GripVertical className="size-3" /></span>
        <SectionHeading variant={headingVariant}>{title}</SectionHeading>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
};

export const SectionHeading = ({ children, variant = "line" }: { children: React.ReactNode; variant?: "line" | "pill" }) => (
  variant === "pill" ? (
    <span className="inline-block rounded-full bg-[color:var(--resume-accent)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
      {children}
    </span>
  ) : (
    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--resume-accent)]">
      <span className="h-px flex-1 bg-[color:var(--resume-line)]" />
      <span>{children}</span>
    </div>
  )
);

export const ActionButton = ({ label, onClick, children, compact = false }: any) => (
  <button type="button" className={cn("pdf-hidden inline-flex items-center justify-center rounded-full text-[color:var(--resume-accent)] transition hover:bg-[color:var(--resume-soft)]", compact ? "h-4 w-4" : "h-5 w-5")} onClick={onClick} aria-label={label} title={label}>{children}</button>
);

export const ItemActions = ({ onAdd, onRemove, compact = false }: any) => (
  <div className={cn("pdf-hidden flex items-center gap-1 opacity-0 transition group-hover:opacity-100", compact ? "gap-0.5" : "gap-1")}>
    {onAdd && <ActionButton label="Add item" onClick={onAdd} compact={compact}><Plus className={compact ? "size-2.5" : "size-3"} /></ActionButton>}
    {onRemove && <ActionButton label="Remove item" onClick={onRemove} compact={compact}><Trash2 className={compact ? "size-2.5" : "size-3"} /></ActionButton>}
  </div>
);

export const InlineAddButton = ({ label, onClick }: any) => (
  <button type="button" className="pdf-hidden inline-flex items-center gap-1 text-[10px] font-medium text-[color:var(--resume-accent)]" onClick={onClick}><Plus className="size-3" />{label}</button>
);

export const AdditionalBlock = ({ data, onEdit }: { data: DisplayData; onEdit: TemplateEditHandlers; }) => (
  <div className="space-y-2 text-[10px] text-slate-700">
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--resume-accent)]" data-resume-atom="heading">Languages</p>
      {data.languages.length > 0 ? (
        <ul className="mt-1 flex flex-wrap gap-1">
          {data.languages.map((language, index) => (
            <li key={`${language}-${index}`} className="group flex items-center gap-1" data-resume-atom="item">
              <EditableText value={language} placeholder="Language" onCommit={(value: string) => onEdit.updateLanguage(index, value)} className="rounded-full border border-[color:var(--resume-line)] px-2 py-0.5" />
              <ItemActions onAdd={() => onEdit.addLanguage(index + 1)} onRemove={() => onEdit.removeLanguage(index)} compact />
            </li>
          ))}
        </ul>
      ) : (<div className="mt-1"><InlineAddButton label="Add language" onClick={() => onEdit.addLanguage()} /></div>)}
    </div>
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--resume-accent)]" data-resume-atom="heading">Interests</p>
      {data.interests.length > 0 ? (
        <ul className="mt-1 flex flex-wrap gap-1">
          {data.interests.map((interest, index) => (
            <li key={`${interest}-${index}`} className="group flex items-center gap-1" data-resume-atom="item">
              <EditableText value={interest} placeholder="Interest" onCommit={(value: string) => onEdit.updateInterest(index, value)} className="rounded-full border border-[color:var(--resume-line)] px-2 py-0.5" />
              <ItemActions onAdd={() => onEdit.addInterest(index + 1)} onRemove={() => onEdit.removeInterest(index)} compact />
            </li>
          ))}
        </ul>
      ) : (<div className="mt-1"><InlineAddButton label="Add interest" onClick={() => onEdit.addInterest()} /></div>)}
    </div>
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--resume-accent)]" data-resume-atom="heading">Links</p>
      {data.links.length > 0 ? (
        <ul className="mt-1 space-y-1">
          {data.links.map((link, index) => (
            <li key={`${link.title}-${index}`} className="group flex flex-wrap gap-1" data-resume-atom="item">
              <EditableText value={link.title} placeholder="Link title" onCommit={(value: string) => onEdit.updateLink(index, { title: value })} className="font-medium" />
              <span className="text-slate-400">-</span>
              <EditableText value={link.url} placeholder="URL" onCommit={(value: string) => onEdit.updateLink(index, { url: value })} className="text-slate-600 underline underline-offset-2" as="a" href={link.url} />
              <ItemActions onAdd={() => onEdit.addLink(index + 1)} onRemove={() => onEdit.removeLink(index)} compact />
            </li>
          ))}
        </ul>
      ) : (<div className="mt-1"><InlineAddButton label="Add link" onClick={() => onEdit.addLink()} /></div>)}
    </div>
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--resume-accent)]" data-resume-atom="heading">Extras</p>
      {data.extras.length > 0 ? (
        <ul className="mt-1 space-y-1">
          {data.extras.map((extra, index) => (
            <li key={`${extra.title}-${index}`} className="group flex flex-wrap gap-1" data-resume-atom="item">
              <EditableText value={extra.title} placeholder="Extra" onCommit={(value: string) => onEdit.updateExtra(index, { title: value })} className="font-medium" />
              {extra.detail ? <span className="text-slate-400">|</span> : null}
              <EditableText value={extra.detail} placeholder="Details" onCommit={(value: string) => onEdit.updateExtra(index, { detail: value })} className="text-slate-600" />
              <ItemActions onAdd={() => onEdit.addExtra(index + 1)} onRemove={() => onEdit.removeExtra(index)} compact />
            </li>
          ))}
        </ul>
      ) : (<div className="mt-1"><InlineAddButton label="Add extra" onClick={() => onEdit.addExtra()} /></div>)}
    </div>
  </div>
);

export const SkillsBlock = ({ data, onEdit }: { data: DisplayData; onEdit: TemplateEditHandlers; }) => (
  <div className="space-y-3">
    {data.skills.length > 0 ? (
      data.skills.map((group, index) => (
        <div key={`${group.name}-${index}`} className="group space-y-1" data-resume-atom="item">
          <div className="flex items-start justify-between gap-2">
            <EditableText value={group.name} placeholder="Skill group" onCommit={(value: string) => onEdit.updateSkillGroup(index, { name: value })} className="flex-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--resume-accent)]" as="p" />
            <ItemActions onAdd={() => onEdit.addSkillGroup(index + 1)} onRemove={() => onEdit.removeSkillGroup(index)} compact />
          </div>
          <EditableText value={group.items.join(", ")} placeholder="Skills" onCommit={(value: string) => { const items = value.split(",").map((item) => item.trim()).filter(Boolean); onEdit.updateSkillGroup(index, { items }); }} className="text-[10px] text-slate-700" as="p" />
        </div>
      ))
    ) : (<InlineAddButton label="Add skill group" onClick={() => onEdit.addSkillGroup()} />)}
  </div>
);

export const ExperienceBlock = ({ data, onEdit }: { data: DisplayData; onEdit: TemplateEditHandlers; }) => (
  <div className="space-y-3 text-[10px] text-slate-700">
    {data.experience.length > 0 ? (
      data.experience.map((item, index) => (
        <div key={`${item.title}-${index}`} className="group space-y-1" data-resume-atom="item">
          <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-900">
            <div className="min-w-0 flex-1">
              <EditableText value={item.title} placeholder="Role" onCommit={(value: string) => onEdit.updateExperience(index, { title: value })} />
            </div>
            <div className="flex items-center gap-2">
              <EditableText value={item.dates} placeholder="Dates" onCommit={(value: string) => onEdit.updateExperience(index, { dates: value })} className="text-[10px] font-normal text-slate-500" />
              <ItemActions onAdd={() => onEdit.addExperience(index + 1)} onRemove={() => onEdit.removeExperience(index)} compact />
            </div>
          </div>
          <p className="flex flex-wrap gap-1 text-[10px] text-slate-600">
            <EditableText value={item.org} placeholder="Organization" onCommit={(value: string) => onEdit.updateExperience(index, { org: value })} />
            {item.location ? <span className="text-slate-400">|</span> : null}
            <EditableText value={item.location} placeholder="Location" onCommit={(value: string) => onEdit.updateExperience(index, { location: value })} />
          </p>
          {item.bullets.length > 0 ? (
            <ul className="ml-3 list-disc space-y-1">
              {item.bullets.map((bullet, bulletIndex) => (
                <li key={`${item.title}-${bulletIndex}`} className="group relative pr-5">
                  <EditableText value={bullet} placeholder="Bullet" onCommit={(value: string) => onEdit.updateExperienceBullet(index, bulletIndex, value)} multiline rich />
                  <div className="absolute right-0 top-0">
                    <ItemActions onAdd={() => onEdit.addExperienceBullet(index, bulletIndex + 1)} onRemove={() => onEdit.removeExperienceBullet(index, bulletIndex)} compact />
                  </div>
                </li>
              ))}
            </ul>
          ) : (<div className="ml-1"><InlineAddButton label="Add bullet" onClick={() => onEdit.addExperienceBullet(index)} /></div>)}
        </div>
      ))
    ) : (<InlineAddButton label="Add experience" onClick={() => onEdit.addExperience()} />)}
  </div>
);

export const EducationBlock = ({ data, onEdit }: { data: DisplayData; onEdit: TemplateEditHandlers; }) => (
  <div className="space-y-3 text-[10px] text-slate-700">
    {data.education.length > 0 ? (
      data.education.map((item, index) => (
        <div key={`${item.title}-${index}`} className="group space-y-1" data-resume-atom="item">
          <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-900">
            <div className="min-w-0 flex-1">
              <EditableText value={item.title} placeholder="Degree" onCommit={(value: string) => onEdit.updateEducation(index, { title: value })} />
            </div>
            <div className="flex items-center gap-2">
              <EditableText value={item.dates} placeholder="Dates" onCommit={(value: string) => onEdit.updateEducation(index, { dates: value })} className="text-[10px] font-normal text-slate-500" />
              <ItemActions onAdd={() => onEdit.addEducation(index + 1)} onRemove={() => onEdit.removeEducation(index)} compact />
            </div>
          </div>
          <p className="flex flex-wrap gap-1 text-[10px] text-slate-600">
            <EditableText value={item.institution} placeholder="Institution" onCommit={(value: string) => onEdit.updateEducation(index, { institution: value })} />
            {item.location ? <span className="text-slate-400">|</span> : null}
            <EditableText value={item.location} placeholder="Location" onCommit={(value: string) => onEdit.updateEducation(index, { location: value })} />
          </p>
        </div>
      ))
    ) : (<InlineAddButton label="Add education" onClick={() => onEdit.addEducation()} />)}
  </div>
);

type OutputBucket = "publications" | "projects" | "talks" | "honors";

const OUTPUT_BUCKET_CONFIG: Record<OutputBucket, { titlePlaceholder: string; venuePlaceholder: string; addLabel: string; update: keyof TemplateEditHandlers; add: keyof TemplateEditHandlers; remove: keyof TemplateEditHandlers }> = {
  publications: { titlePlaceholder: "Publication Title", venuePlaceholder: "Journal / Conference", addLabel: "publication", update: "updatePublication", add: "addPublication", remove: "removePublication" },
  projects: { titlePlaceholder: "Project Name", venuePlaceholder: "Link / Role", addLabel: "project", update: "updateProject", add: "addProject", remove: "removeProject" },
  talks: { titlePlaceholder: "Talk Title", venuePlaceholder: "Event / Venue", addLabel: "talk", update: "updateTalk", add: "addTalk", remove: "removeTalk" },
  honors: { titlePlaceholder: "Honor / Award", venuePlaceholder: "Awarded by", addLabel: "honor or award", update: "updateHonor", add: "addHonor", remove: "removeHonor" },
};

// Generic block for all four output types (publications/projects/talks/
// honors) — previously this only knew about two of them, so talks and
// honors had no bucket of their own and were folded into "projects".
export const OutputBlock = ({ items, onEdit, type }: { items: DisplayOutput[]; onEdit: TemplateEditHandlers; type: OutputBucket }) => {
  const config = OUTPUT_BUCKET_CONFIG[type];
  const updateFn = onEdit[config.update] as (index: number, patch: Partial<DisplayOutput>) => void;
  const addFn = onEdit[config.add] as (index?: number) => void;
  const removeFn = onEdit[config.remove] as (index: number) => void;

  return (
    <div className="space-y-3 text-[10px] text-slate-700">
      {items.length > 0 ? (
        items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="group space-y-1" data-resume-atom="item">
            <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-900">
              <div className="min-w-0 flex-1">
                <EditableText value={item.title} placeholder={config.titlePlaceholder} onCommit={(value: string) => updateFn(index, { title: value })} />
              </div>
              <div className="flex items-center gap-2">
                <EditableText value={item.year} placeholder="Year" onCommit={(value: string) => updateFn(index, { year: value })} className="text-[10px] font-normal text-slate-500" />
                <ItemActions onAdd={() => addFn(index + 1)} onRemove={() => removeFn(index)} compact />
              </div>
            </div>
            <EditableText value={item.venue} placeholder={config.venuePlaceholder} onCommit={(value: string) => updateFn(index, { venue: value })} className="text-[10px] text-slate-600" as="p" />
            <EditableText value={item.summary} placeholder="Summary" onCommit={(value: string) => updateFn(index, { summary: value })} as="p" multiline rich />
          </div>
        ))
      ) : (<InlineAddButton label={`Add ${config.addLabel}`} onClick={() => addFn()} />)}
    </div>
  );
};

export const CredentialsBlock = ({ data, onEdit }: { data: DisplayData; onEdit: TemplateEditHandlers; }) => (
  <div className="space-y-2 text-[10px] text-slate-700">
    {data.credentials.length > 0 ? (
      data.credentials.map((item, index) => (
        <div key={`${item.title}-${index}`} className="group space-y-1" data-resume-atom="item">
          <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-900">
            <div className="min-w-0 flex-1">
              <EditableText value={item.title} placeholder="Credential" onCommit={(value: string) => onEdit.updateCredential(index, { title: value })} />
            </div>
            <div className="flex items-center gap-2">
              <EditableText value={item.year} placeholder="Year" onCommit={(value: string) => onEdit.updateCredential(index, { year: value })} className="text-[10px] font-normal text-slate-500" />
              <ItemActions onAdd={() => onEdit.addCredential(index + 1)} onRemove={() => onEdit.removeCredential(index)} compact />
            </div>
          </div>
          <EditableText value={item.issuer} placeholder="Issuer" onCommit={(value: string) => onEdit.updateCredential(index, { issuer: value })} className="text-[10px] text-slate-600" as="p" />
        </div>
      ))
    ) : (<InlineAddButton label="Add credential" onClick={() => onEdit.addCredential()} />)}
  </div>
);

export const SectionContent = ({ sectionKey, data, onEdit }: { sectionKey: SectionKey; data: DisplayData; onEdit: TemplateEditHandlers; }) => {
  switch (sectionKey) {
    case "summary": return <EditableText value={data.summary} placeholder="Summary" onCommit={(value: string) => onEdit.updateBasics({ summary: value })} className="text-[10px] text-slate-700" as="p" multiline rich />;
    case "experience": return <ExperienceBlock data={data} onEdit={onEdit} />;
    case "education": return <EducationBlock data={data} onEdit={onEdit} />;
    case "skills": return <SkillsBlock data={data} onEdit={onEdit} />;
    case "publications": return <OutputBlock items={data.publications} onEdit={onEdit} type="publications" />;
    case "projects": return <OutputBlock items={data.projects} onEdit={onEdit} type="projects" />;
    case "talks": return <OutputBlock items={data.talks} onEdit={onEdit} type="talks" />;
    case "honors": return <OutputBlock items={data.honors} onEdit={onEdit} type="honors" />;
    case "credentials": return <CredentialsBlock data={data} onEdit={onEdit} />;
    case "additional": return <AdditionalBlock data={data} onEdit={onEdit} />;
    default: return null;
  }
};
