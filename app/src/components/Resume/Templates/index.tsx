// src/components/resumes/templates/index.tsx
import * as React from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BuilderTemplate, PaletteOption, SectionKey, TemplateProps } from "@/lib/resumeBuilderTypes";
import { SECTION_LABELS } from "@/lib/resumeBuilderTypes";
import { PhotoBadge, EditableText, DraggableSection, ItemActions, InlineAddButton, SectionContent } from "./shared";

export const AcademicTemplate = ({ data, visibleSections, showPhoto, sectionOrder, dragHandlers, onEdit }: TemplateProps) => {
  const mainKeys: SectionKey[] = ["summary", "experience", "education", "projects", "publications", "talks", "honors", "credentials"];
  const sideKeys: SectionKey[] = ["skills", "additional"];
  const orderedMain = sectionOrder.filter((key) => mainKeys.includes(key) && visibleSections[key]);
  const orderedSide = sectionOrder.filter((key) => sideKeys.includes(key) && visibleSections[key]);

  return (
    <div className="grid h-full w-full grid-cols-[0.35fr_0.65fr] text-[11px] leading-5 text-slate-900">
      <aside className="h-full bg-[color:var(--resume-soft)] p-5">
        <div className="space-y-4">
          {showPhoto && visibleSections.basics && (
            <div className="flex justify-center">
              <PhotoBadge name={data.name} avatarUrl={data.avatarUrl} />
            </div>
          )}
          {visibleSections.basics && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--resume-accent)]" data-resume-atom="heading">Contact</p>
              {data.contacts.length > 0 ? (
                <ul className="mt-2 space-y-1 text-[10px] text-slate-700">
                  {data.contacts.map((item, index) => (
                    <li key={`${item}-${index}`} className="group flex items-center gap-1" data-resume-atom="item">
                      <EditableText value={item} placeholder="Contact" onCommit={(value: string) => onEdit.updateContact(index, value)} />
                      <ItemActions onAdd={() => onEdit.addContact(index + 1)} onRemove={() => onEdit.removeContact(index)} compact />
                    </li>
                  ))}
                </ul>
              ) : (<div className="mt-2"><InlineAddButton label="Add contact" onClick={() => onEdit.addContact()} /></div>)}
            </div>
          )}
          {orderedSide.map((key) => (
            <DraggableSection key={key} sectionKey={key} title={SECTION_LABELS[key]} dragHandlers={dragHandlers}>
              <SectionContent sectionKey={key} data={data} onEdit={onEdit} />
            </DraggableSection>
          ))}
        </div>
      </aside>
      <main className="p-5">
        {visibleSections.basics && (
          <div className="border-b border-[color:var(--resume-line)] pb-3" data-resume-atom="header">
            <EditableText value={data.name} placeholder="Your name" onCommit={(value: string) => onEdit.updateBasics({ name: value })} className="text-2xl font-semibold" as="h1" />
            <EditableText value={data.headline} placeholder="Headline" onCommit={(value: string) => onEdit.updateBasics({ headline: value })} className="mt-1 text-sm text-[color:var(--resume-accent)]" as="p" />
          </div>
        )}
        <div className="mt-4 space-y-4">
          {orderedMain.map((key) => (
            <DraggableSection key={key} sectionKey={key} title={SECTION_LABELS[key]} dragHandlers={dragHandlers}>
              <SectionContent sectionKey={key} data={data} onEdit={onEdit} />
            </DraggableSection>
          ))}
        </div>
      </main>
    </div>
  );
};

export const ClassicTemplate = ({ data, visibleSections, showPhoto, sectionOrder, dragHandlers, onEdit }: TemplateProps) => {
  const mainKeys: SectionKey[] = ["summary", "experience", "education", "projects", "publications", "talks", "honors", "credentials"];
  const sideKeys: SectionKey[] = ["skills", "additional"];
  const orderedMain = sectionOrder.filter((key) => mainKeys.includes(key) && visibleSections[key]);
  const orderedSide = sectionOrder.filter((key) => sideKeys.includes(key) && visibleSections[key]);

  return (
    <div className="flex h-full w-full flex-col text-[11px] leading-5 text-slate-900">
      {visibleSections.basics && (
        <div className="border-b border-[color:var(--resume-line)] px-5 py-4 text-center" data-resume-atom="header">
          <div className="flex flex-col items-center gap-2">
            {showPhoto && <PhotoBadge name={data.name} avatarUrl={data.avatarUrl} className="h-14 w-14" />}
            <EditableText value={data.name} placeholder="Your name" onCommit={(value: string) => onEdit.updateBasics({ name: value })} className="text-2xl font-semibold" as="h1" />
            <EditableText value={data.headline} placeholder="Headline" onCommit={(value: string) => onEdit.updateBasics({ headline: value })} className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--resume-accent)]" as="p" />
            <div className="mt-2 flex flex-wrap justify-center gap-2 text-[10px] text-slate-600">
              {data.contacts.length > 0 ? (
                data.contacts.map((item, index) => (
                  <span key={`${item}-${index}`} className="group inline-flex items-center gap-1">
                    <EditableText value={item} placeholder="Contact" onCommit={(value: string) => onEdit.updateContact(index, value)} className="rounded-full border border-[color:var(--resume-line)] px-2 py-0.5" />
                    <ItemActions onAdd={() => onEdit.addContact(index + 1)} onRemove={() => onEdit.removeContact(index)} compact />
                  </span>
                ))
              ) : (<InlineAddButton label="Add contact" onClick={() => onEdit.addContact()} />)}
            </div>
          </div>
        </div>
      )}
      <div className="grid flex-1 grid-cols-[0.4fr_0.6fr] gap-4 px-5 py-4">
        <aside className="space-y-4">
          {orderedSide.map((key) => (
            <DraggableSection key={key} sectionKey={key} title={SECTION_LABELS[key]} dragHandlers={dragHandlers}>
              <SectionContent sectionKey={key} data={data} onEdit={onEdit} />
            </DraggableSection>
          ))}
        </aside>
        <main className="space-y-4">
          {orderedMain.map((key) => (
            <DraggableSection key={key} sectionKey={key} title={SECTION_LABELS[key]} dragHandlers={dragHandlers}>
              <SectionContent sectionKey={key} data={data} onEdit={onEdit} />
            </DraggableSection>
          ))}
        </main>
      </div>
    </div>
  );
};

export const ModernTemplate = ({ data, visibleSections, showPhoto, sectionOrder, dragHandlers, onEdit }: TemplateProps) => {
  const leftKeys: SectionKey[] = ["summary", "experience"];
  const rightKeys: SectionKey[] = ["education", "skills", "projects", "publications", "talks", "honors", "credentials", "additional"];
  const orderedLeft = sectionOrder.filter((key) => leftKeys.includes(key) && visibleSections[key]);
  const orderedRight = sectionOrder.filter((key) => rightKeys.includes(key) && visibleSections[key]);

  return (
    <div className="flex h-full w-full flex-col text-[11px] leading-5 text-slate-900">
      {visibleSections.basics && (
        <div className="bg-[color:var(--resume-accent)] px-5 py-4 text-white" data-resume-atom="header">
          <div className="flex items-center justify-between gap-4">
            <div>
              <EditableText value={data.name} placeholder="Your name" onCommit={(value: string) => onEdit.updateBasics({ name: value })} className="text-2xl font-semibold" as="h1" />
              <EditableText value={data.headline} placeholder="Headline" onCommit={(value: string) => onEdit.updateBasics({ headline: value })} className="mt-1 text-[10px] uppercase tracking-[0.22em]" as="p" />
            </div>
            {showPhoto && <PhotoBadge name={data.name} avatarUrl={data.avatarUrl} className="border-white/40 bg-white/90 text-[color:var(--resume-accent)]" />}
          </div>
        </div>
      )}
      <div className="flex-1 px-5 py-4">
        {visibleSections.basics && (
          <div className="flex flex-wrap gap-2 text-[10px] text-slate-600">
            {data.contacts.length > 0 ? (
              data.contacts.map((item, index) => (
                <span key={`${item}-${index}`} className="group inline-flex items-center gap-1">
                  <EditableText value={item} placeholder="Contact" onCommit={(value: string) => onEdit.updateContact(index, value)} className="rounded-full border border-[color:var(--resume-line)] px-2 py-0.5" />
                  <ItemActions onAdd={() => onEdit.addContact(index + 1)} onRemove={() => onEdit.removeContact(index)} compact />
                </span>
              ))
            ) : (<InlineAddButton label="Add contact" onClick={() => onEdit.addContact()} />)}
          </div>
        )}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="space-y-4">
            {orderedLeft.map((key) => (
              <DraggableSection key={key} sectionKey={key} title={SECTION_LABELS[key]} dragHandlers={dragHandlers}>
                <SectionContent sectionKey={key} data={data} onEdit={onEdit} />
              </DraggableSection>
            ))}
          </div>
          <div className="space-y-4">
            {orderedRight.map((key) => (
              <DraggableSection key={key} sectionKey={key} title={SECTION_LABELS[key]} dragHandlers={dragHandlers}>
                <SectionContent sectionKey={key} data={data} onEdit={onEdit} />
              </DraggableSection>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CompactTemplate = ({ data, visibleSections, showPhoto, sectionOrder, dragHandlers, onEdit }: TemplateProps) => {
  // Iterates every visible section generically, so it already supports
  // "talks"/"honors" (or any future section) with no changes here.
  const orderedKeys = sectionOrder.filter((key) => visibleSections[key]);

  return (
    <div className="flex h-full w-full flex-col px-5 py-4 text-[10.5px] leading-5 text-slate-900">
      {visibleSections.basics && (
        <div className="border-b border-[color:var(--resume-line)] pb-3" data-resume-atom="header">
          <div className="flex items-center justify-between gap-3">
            <div>
              <EditableText value={data.name} placeholder="Your name" onCommit={(value: string) => onEdit.updateBasics({ name: value })} className="text-xl font-semibold" as="h1" />
              <EditableText value={data.headline} placeholder="Headline" onCommit={(value: string) => onEdit.updateBasics({ headline: value })} className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--resume-accent)]" as="p" />
            </div>
            <div className="flex items-center gap-3">
              {showPhoto && <PhotoBadge name={data.name} avatarUrl={data.avatarUrl} className="border-[color:var(--resume-line)] bg-white" />}
              <div className="text-right text-[9px] text-slate-600">
                {data.contacts.length > 0 ? (
                  data.contacts.map((item, index) => (
                    <div key={`${item}-${index}`} className="group flex items-center justify-end gap-1">
                      <EditableText value={item} placeholder="Contact" onCommit={(value: string) => onEdit.updateContact(index, value)} className="block" as="div" />
                      <ItemActions onAdd={() => onEdit.addContact(index + 1)} onRemove={() => onEdit.removeContact(index)} compact />
                    </div>
                  ))
                ) : (<InlineAddButton label="Add contact" onClick={() => onEdit.addContact()} />)}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mt-3 space-y-3">
        {orderedKeys.map((key) => (
          <DraggableSection key={key} sectionKey={key} title={SECTION_LABELS[key]} dragHandlers={dragHandlers}>
            <SectionContent sectionKey={key} data={data} onEdit={onEdit} />
          </DraggableSection>
        ))}
      </div>
    </div>
  );
};

const MilestoneCard = ({ title, content, sectionKey, dragHandlers }: any) => (
  <div onDragOver={dragHandlers.onDragOver} onDrop={dragHandlers.onDrop(sectionKey)} data-resume-atom="item" className={cn("flex flex-col gap-2 rounded-2xl border border-[color:var(--resume-line)] bg-[color:var(--resume-soft)] p-3", dragHandlers.draggingSection === sectionKey ? "ring-1 ring-[color:var(--resume-accent)]" : "")}>
    <div className="flex items-center gap-2">
      <span className="pdf-hidden inline-flex cursor-grab items-center text-slate-400" draggable onDragStart={dragHandlers.onDragStart(sectionKey)} onDragEnd={dragHandlers.onDragEnd} title="Drag to reorder"><GripVertical className="size-3" /></span>
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[color:var(--resume-accent)]">{title}</p>
    </div>
    {content}
  </div>
);

export const MilestoneTemplate = ({ data, visibleSections, showPhoto, sectionOrder, dragHandlers, onEdit }: TemplateProps) => {
  // Also fully generic — same note as CompactTemplate above.
  const orderedKeys = sectionOrder.filter((key) => visibleSections[key]);
  const blocks = orderedKeys.map((key) => ({
    title: SECTION_LABELS[key],
    sectionKey: key,
    content: <SectionContent sectionKey={key} data={data} onEdit={onEdit} />,
  }));

  return (
    <div className="flex h-full w-full flex-col gap-4 px-5 py-5 text-[11px] text-slate-900">
      {visibleSections.basics && (
        <div className="flex items-center justify-between gap-3 border-b border-[color:var(--resume-line)] pb-3" data-resume-atom="header">
          <div>
            <EditableText value={data.name} placeholder="Your name" onCommit={(value: string) => onEdit.updateBasics({ name: value })} className="text-2xl font-semibold" as="h1" />
            <EditableText value={data.headline} placeholder="Headline" onCommit={(value: string) => onEdit.updateBasics({ headline: value })} className="text-sm text-[color:var(--resume-accent)]" as="p" />
          </div>
          {showPhoto && <PhotoBadge name={data.name} avatarUrl={data.avatarUrl} className="border-[color:var(--resume-line)] bg-white" />}
        </div>
      )}
      {visibleSections.basics && (
        <div className="flex flex-wrap gap-2 text-[10px] text-slate-600">
          {data.contacts.length > 0 ? (
            data.contacts.map((item, index) => (
              <span key={`${item}-${index}`} className="group inline-flex items-center gap-1">
                <EditableText value={item} placeholder="Contact" onCommit={(value: string) => onEdit.updateContact(index, value)} className="rounded-full border border-[color:var(--resume-line)] bg-white px-2 py-0.5" />
                <ItemActions onAdd={() => onEdit.addContact(index + 1)} onRemove={() => onEdit.removeContact(index)} compact />
              </span>
            ))
          ) : (<InlineAddButton label="Add contact" onClick={() => onEdit.addContact()} />)}
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {blocks.map((block) => (
          <MilestoneCard key={block.title} {...block} dragHandlers={dragHandlers} />
        ))}
      </div>
    </div>
  );
};

export const MinimalTemplate = ({ data, visibleSections, showPhoto, sectionOrder, dragHandlers, onEdit }: TemplateProps) => {
  const orderedKeys = sectionOrder.filter((key) => visibleSections[key]);
  return (
    <div className="flex h-full w-full flex-col gap-6 px-8 py-8 text-[11px] leading-6 text-slate-800">
      {visibleSections.basics && (
        <div className="flex items-start gap-4" data-resume-atom="header">
          {showPhoto && <PhotoBadge name={data.name} avatarUrl={data.avatarUrl} className="h-14 w-14 border-transparent bg-transparent" />}
          <div className="min-w-0 flex-1">
            <EditableText value={data.name} placeholder="Your name" onCommit={(value: string) => onEdit.updateBasics({ name: value })} className="text-3xl font-light tracking-tight" as="h1" />
            <EditableText value={data.headline} placeholder="Headline" onCommit={(value: string) => onEdit.updateBasics({ headline: value })} className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[color:var(--resume-accent)]" as="p" />
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
              {data.contacts.length > 0 ? (
                data.contacts.map((item, index) => (
                  <span key={`${item}-${index}`} className="group inline-flex items-center gap-1">
                    <EditableText value={item} placeholder="Contact" onCommit={(value: string) => onEdit.updateContact(index, value)} />
                    <ItemActions onAdd={() => onEdit.addContact(index + 1)} onRemove={() => onEdit.removeContact(index)} compact />
                  </span>
                ))
              ) : (<InlineAddButton label="Add contact" onClick={() => onEdit.addContact()} />)}
            </div>
          </div>
        </div>
      )}
      <div className="space-y-6">
        {orderedKeys.map((key) => (
          <DraggableSection key={key} sectionKey={key} title={SECTION_LABELS[key]} dragHandlers={dragHandlers}>
            <SectionContent sectionKey={key} data={data} onEdit={onEdit} />
          </DraggableSection>
        ))}
      </div>
    </div>
  );
};

export const ExecutiveTemplate = ({ data, visibleSections, showPhoto, sectionOrder, dragHandlers, onEdit }: TemplateProps) => {
  const mainKeys: SectionKey[] = ["summary", "experience", "education", "projects", "publications", "talks", "honors"];
  const sideKeys: SectionKey[] = ["skills", "credentials", "additional"];
  const orderedMain = sectionOrder.filter((key) => mainKeys.includes(key) && visibleSections[key]);
  const orderedSide = sectionOrder.filter((key) => sideKeys.includes(key) && visibleSections[key]);

  return (
    <div className="flex h-full w-full flex-col gap-4 p-5 text-[11px] leading-5 text-slate-900">
      {visibleSections.basics && (
        <div className="flex items-center gap-4 rounded-xl border border-[color:var(--resume-line)] p-4" data-resume-atom="header">
          {showPhoto && <PhotoBadge name={data.name} avatarUrl={data.avatarUrl} />}
          <div className="min-w-0 flex-1">
            <EditableText value={data.name} placeholder="Your name" onCommit={(value: string) => onEdit.updateBasics({ name: value })} className="text-2xl font-semibold" as="h1" />
            <EditableText value={data.headline} placeholder="Headline" onCommit={(value: string) => onEdit.updateBasics({ headline: value })} className="mt-1 text-sm text-[color:var(--resume-accent)]" as="p" />
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-600">
              {data.contacts.length > 0 ? (
                data.contacts.map((item, index) => (
                  <span key={`${item}-${index}`} className="group inline-flex items-center gap-1">
                    <EditableText value={item} placeholder="Contact" onCommit={(value: string) => onEdit.updateContact(index, value)} className="rounded-full border border-[color:var(--resume-line)] px-2 py-0.5" />
                    <ItemActions onAdd={() => onEdit.addContact(index + 1)} onRemove={() => onEdit.removeContact(index)} compact />
                  </span>
                ))
              ) : (<InlineAddButton label="Add contact" onClick={() => onEdit.addContact()} />)}
            </div>
          </div>
        </div>
      )}
      <div className="grid flex-1 grid-cols-[0.62fr_0.38fr] gap-4">
        <main className="space-y-4">
          {orderedMain.map((key) => (
            <DraggableSection key={key} sectionKey={key} title={SECTION_LABELS[key]} dragHandlers={dragHandlers}>
              <SectionContent sectionKey={key} data={data} onEdit={onEdit} />
            </DraggableSection>
          ))}
        </main>
        <aside className="space-y-4 rounded-xl bg-[color:var(--resume-soft)] p-4">
          {orderedSide.map((key) => (
            <DraggableSection key={key} sectionKey={key} title={SECTION_LABELS[key]} dragHandlers={dragHandlers}>
              <SectionContent sectionKey={key} data={data} onEdit={onEdit} />
            </DraggableSection>
          ))}
        </aside>
      </div>
    </div>
  );
};

export const TimelineTemplate = ({ data, visibleSections, showPhoto, sectionOrder, dragHandlers, onEdit }: TemplateProps) => {
  const orderedKeys = sectionOrder.filter((key) => visibleSections[key]);
  return (
    <div className="flex h-full w-full flex-col gap-5 px-6 py-6 text-[11px] leading-5 text-slate-900">
      {visibleSections.basics && (
        <div className="flex items-center gap-4 border-b-2 border-[color:var(--resume-accent)] pb-4" data-resume-atom="header">
          {showPhoto && <PhotoBadge name={data.name} avatarUrl={data.avatarUrl} />}
          <div className="min-w-0 flex-1">
            <EditableText value={data.name} placeholder="Your name" onCommit={(value: string) => onEdit.updateBasics({ name: value })} className="text-2xl font-semibold" as="h1" />
            <EditableText value={data.headline} placeholder="Headline" onCommit={(value: string) => onEdit.updateBasics({ headline: value })} className="mt-1 text-sm text-[color:var(--resume-accent)]" as="p" />
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-600">
              {data.contacts.length > 0 ? (
                data.contacts.map((item, index) => (
                  <span key={`${item}-${index}`} className="group inline-flex items-center gap-1">
                    <EditableText value={item} placeholder="Contact" onCommit={(value: string) => onEdit.updateContact(index, value)} />
                    <ItemActions onAdd={() => onEdit.addContact(index + 1)} onRemove={() => onEdit.removeContact(index)} compact />
                  </span>
                ))
              ) : (<InlineAddButton label="Add contact" onClick={() => onEdit.addContact()} />)}
            </div>
          </div>
        </div>
      )}
      <div className="space-y-5">
        {orderedKeys.map((key) => (
          <DraggableSection
            key={key} sectionKey={key} title={SECTION_LABELS[key]} dragHandlers={dragHandlers}
            className="border-l-2 border-[color:var(--resume-line)] pl-4"
          >
            <SectionContent sectionKey={key} data={data} onEdit={onEdit} />
          </DraggableSection>
        ))}
      </div>
    </div>
  );
};

export const BalancedTemplate = ({ data, visibleSections, showPhoto, sectionOrder, dragHandlers, onEdit }: TemplateProps) => {
  const leftKeys: SectionKey[] = ["summary", "experience", "education"];
  const rightKeys: SectionKey[] = ["skills", "projects", "publications", "talks", "honors", "credentials", "additional"];
  const orderedLeft = sectionOrder.filter((key) => leftKeys.includes(key) && visibleSections[key]);
  const orderedRight = sectionOrder.filter((key) => rightKeys.includes(key) && visibleSections[key]);

  return (
    <div className="flex h-full w-full flex-col text-[11px] leading-5 text-slate-900">
      {visibleSections.basics && (
        <div className="flex items-center justify-between gap-4 border-b border-[color:var(--resume-line)] px-6 py-4" data-resume-atom="header">
          <div className="min-w-0 flex-1">
            <EditableText value={data.name} placeholder="Your name" onCommit={(value: string) => onEdit.updateBasics({ name: value })} className="text-2xl font-semibold" as="h1" />
            <EditableText value={data.headline} placeholder="Headline" onCommit={(value: string) => onEdit.updateBasics({ headline: value })} className="mt-1 text-sm text-[color:var(--resume-accent)]" as="p" />
          </div>
          {showPhoto && <PhotoBadge name={data.name} avatarUrl={data.avatarUrl} />}
        </div>
      )}
      {visibleSections.basics && (
        <div className="flex flex-wrap gap-2 border-b border-[color:var(--resume-line)] px-6 py-2 text-[10px] text-slate-600">
          {data.contacts.length > 0 ? (
            data.contacts.map((item, index) => (
              <span key={`${item}-${index}`} className="group inline-flex items-center gap-1">
                <EditableText value={item} placeholder="Contact" onCommit={(value: string) => onEdit.updateContact(index, value)} />
                <ItemActions onAdd={() => onEdit.addContact(index + 1)} onRemove={() => onEdit.removeContact(index)} compact />
              </span>
            ))
          ) : (<InlineAddButton label="Add contact" onClick={() => onEdit.addContact()} />)}
        </div>
      )}
      <div className="grid flex-1 grid-cols-2 gap-0">
        <div className="space-y-4 border-r border-[color:var(--resume-line)] px-6 py-4">
          {orderedLeft.map((key) => (
            <DraggableSection key={key} sectionKey={key} title={SECTION_LABELS[key]} dragHandlers={dragHandlers}>
              <SectionContent sectionKey={key} data={data} onEdit={onEdit} />
            </DraggableSection>
          ))}
        </div>
        <div className="space-y-4 px-6 py-4">
          {orderedRight.map((key) => (
            <DraggableSection key={key} sectionKey={key} title={SECTION_LABELS[key]} dragHandlers={dragHandlers}>
              <SectionContent sectionKey={key} data={data} onEdit={onEdit} />
            </DraggableSection>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ProfileTemplate = ({ data, visibleSections, showPhoto, sectionOrder, dragHandlers, onEdit }: TemplateProps) => {
  const orderedKeys = sectionOrder.filter((key) => visibleSections[key]);
  return (
    <div className="flex h-full w-full flex-col gap-5 px-6 py-6 text-[11px] leading-5 text-slate-900">
      {visibleSections.basics && (
        <div className="flex items-center gap-4 rounded-2xl bg-[color:var(--resume-soft)] p-4" data-resume-atom="header">
          {showPhoto && <PhotoBadge name={data.name} avatarUrl={data.avatarUrl} className="h-20 w-20 border-2 border-white text-base" />}
          <div className="min-w-0 flex-1">
            <EditableText value={data.name} placeholder="Your name" onCommit={(value: string) => onEdit.updateBasics({ name: value })} className="text-2xl font-semibold" as="h1" />
            <EditableText value={data.headline} placeholder="Headline" onCommit={(value: string) => onEdit.updateBasics({ headline: value })} className="mt-1 text-sm font-medium text-[color:var(--resume-accent)]" as="p" />
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-600">
              {data.contacts.length > 0 ? (
                data.contacts.map((item, index) => (
                  <span key={`${item}-${index}`} className="group inline-flex items-center gap-1">
                    <EditableText value={item} placeholder="Contact" onCommit={(value: string) => onEdit.updateContact(index, value)} className="rounded-full border border-[color:var(--resume-line)] bg-white px-2 py-0.5" />
                    <ItemActions onAdd={() => onEdit.addContact(index + 1)} onRemove={() => onEdit.removeContact(index)} compact />
                  </span>
                ))
              ) : (<InlineAddButton label="Add contact" onClick={() => onEdit.addContact()} />)}
            </div>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {orderedKeys.map((key) => (
          <DraggableSection key={key} sectionKey={key} title={SECTION_LABELS[key]} dragHandlers={dragHandlers} headingVariant="pill">
            <SectionContent sectionKey={key} data={data} onEdit={onEdit} />
          </DraggableSection>
        ))}
      </div>
    </div>
  );
};

export const TemplateSwatch = ({ templateId, palette, active }: { templateId: BuilderTemplate; palette: PaletteOption; active: boolean; }) => {
  const previewStyle = { "--resume-accent": palette.accent, "--resume-soft": palette.soft, "--resume-line": palette.line } as React.CSSProperties;

  return (
    <div className={cn("flex h-16 w-12 items-center justify-center rounded-md border bg-white p-1", active ? "border-[color:var(--resume-accent)]" : "border-border")} style={previewStyle}>
      {templateId === "academic" && (
        <div className="grid h-full w-full grid-cols-[0.35fr_0.65fr] gap-1">
          <div className="rounded-sm bg-[color:var(--resume-soft)]" />
          <div className="flex flex-col gap-1">
            <div className="h-2 rounded-sm bg-[color:var(--resume-line)]" />
            <div className="h-1 w-3/4 rounded-sm bg-[color:var(--resume-line)]" />
            <div className="mt-auto h-1 w-2/3 rounded-sm bg-[color:var(--resume-line)]" />
          </div>
        </div>
      )}
      {templateId === "classic" && (
        <div className="flex h-full w-full flex-col gap-1">
          <div className="h-2 rounded-sm bg-[color:var(--resume-line)]" />
          <div className="h-1 w-4/5 rounded-sm bg-[color:var(--resume-line)]" />
          <div className="mt-1 grid flex-1 grid-cols-[0.4fr_0.6fr] gap-1">
            <div className="rounded-sm bg-[color:var(--resume-soft)]" />
            <div className="flex flex-col gap-1">
              <div className="h-1 rounded-sm bg-[color:var(--resume-line)]" />
              <div className="h-1 w-3/4 rounded-sm bg-[color:var(--resume-line)]" />
            </div>
          </div>
        </div>
      )}
      {templateId === "modern" && (
        <div className="flex h-full w-full flex-col gap-1">
          <div className="h-2 rounded-sm bg-[color:var(--resume-accent)]" />
          <div className="flex-1 space-y-1">
            <div className="h-1 w-3/4 rounded-sm bg-[color:var(--resume-line)]" />
            <div className="h-1 w-2/3 rounded-sm bg-[color:var(--resume-line)]" />
          </div>
        </div>
      )}
      {templateId === "compact" && (
        <div className="flex h-full w-full flex-col gap-1">
          <div className="h-1.5 w-full rounded-sm bg-[color:var(--resume-line)]" />
          <div className="h-1 w-5/6 rounded-sm bg-[color:var(--resume-line)]" />
          <div className="h-1 w-4/6 rounded-sm bg-[color:var(--resume-line)]" />
          <div className="mt-auto h-1 w-3/5 rounded-sm bg-[color:var(--resume-accent)]" />
        </div>
      )}
      {templateId === "milestone" && (
        <div className="flex h-full w-full flex-col gap-1">
          <div className="h-1.5 w-full rounded-sm bg-[color:var(--resume-accent)]" />
          <div className="flex h-full flex-col justify-between gap-1">
            <div className="flex items-center gap-2">
              <span className="h-4 flex-1 rounded-full bg-[color:var(--resume-line)]" />
              <span className="h-4 w-6 rounded-full bg-[color:var(--resume-soft)]" />
            </div>
            <div className="space-y-2">
              <div className="h-1 w-3/4 rounded-sm bg-[color:var(--resume-line)]" />
              <div className="h-1 w-4/6 rounded-sm bg-[color:var(--resume-line)]" />
              <div className="h-1 w-5/6 rounded-sm bg-[color:var(--resume-line)]" />
            </div>
          </div>
        </div>
      )}
      {templateId === "minimal" && (
        <div className="flex h-full w-full flex-col gap-2">
          <div className="h-2 w-4/5 rounded-sm bg-slate-300" />
          <div className="h-1 w-2/5 rounded-sm bg-[color:var(--resume-accent)]" />
          <div className="mt-2 space-y-2">
            <div className="h-px w-full bg-[color:var(--resume-line)]" />
            <div className="h-1 w-3/4 rounded-sm bg-slate-300" />
            <div className="h-px w-full bg-[color:var(--resume-line)]" />
            <div className="h-1 w-2/3 rounded-sm bg-slate-300" />
          </div>
        </div>
      )}
      {templateId === "executive" && (
        <div className="flex h-full w-full flex-col gap-1">
          <div className="h-3 w-full rounded-sm border border-[color:var(--resume-line)]" />
          <div className="mt-1 grid flex-1 grid-cols-[0.6fr_0.4fr] gap-1">
            <div className="flex flex-col gap-1">
              <div className="h-1 w-full rounded-sm bg-[color:var(--resume-line)]" />
              <div className="h-1 w-3/4 rounded-sm bg-[color:var(--resume-line)]" />
            </div>
            <div className="rounded-sm bg-[color:var(--resume-soft)]" />
          </div>
        </div>
      )}
      {templateId === "timeline" && (
        <div className="flex h-full w-full flex-col gap-1.5">
          <div className="h-1.5 w-4/5 rounded-sm border-b-2 border-[color:var(--resume-accent)]" />
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex flex-1 gap-1 border-l-2 border-[color:var(--resume-line)] pl-1">
              <div className="flex-1 space-y-0.5">
                <div className="h-1 w-2/3 rounded-sm bg-[color:var(--resume-line)]" />
              </div>
            </div>
          ))}
        </div>
      )}
      {templateId === "balanced" && (
        <div className="flex h-full w-full flex-col gap-1">
          <div className="h-1.5 w-full rounded-sm bg-[color:var(--resume-line)]" />
          <div className="grid flex-1 grid-cols-2 gap-1 border-t border-[color:var(--resume-line)] pt-1">
            <div className="space-y-1 border-r border-[color:var(--resume-line)] pr-1">
              <div className="h-1 w-full rounded-sm bg-[color:var(--resume-line)]" />
              <div className="h-1 w-2/3 rounded-sm bg-[color:var(--resume-line)]" />
            </div>
            <div className="space-y-1 pl-1">
              <div className="h-1 w-full rounded-sm bg-[color:var(--resume-line)]" />
              <div className="h-1 w-2/3 rounded-sm bg-[color:var(--resume-line)]" />
            </div>
          </div>
        </div>
      )}
      {templateId === "profile" && (
        <div className="flex h-full w-full flex-col gap-1.5">
          <div className="flex items-center gap-1 rounded-sm bg-[color:var(--resume-soft)] p-1">
            <span className="h-3 w-3 rounded-full bg-[color:var(--resume-accent)]" />
            <span className="h-1.5 flex-1 rounded-sm bg-white" />
          </div>
          <div className="space-y-1">
            <span className="inline-block h-1.5 w-2/3 rounded-full bg-[color:var(--resume-accent)]" />
            <div className="h-1 w-full rounded-sm bg-[color:var(--resume-line)]" />
          </div>
        </div>
      )}
    </div>
  );
};

export const TEMPLATE_COMPONENTS: Record<BuilderTemplate, React.FC<TemplateProps>> = {
  academic: AcademicTemplate,
  classic: ClassicTemplate,
  modern: ModernTemplate,
  compact: CompactTemplate,
  milestone: MilestoneTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  timeline: TimelineTemplate,
  balanced: BalancedTemplate,
  profile: ProfileTemplate,
};
