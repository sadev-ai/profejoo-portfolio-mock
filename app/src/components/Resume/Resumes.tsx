// src/components/profile/Resumes.tsx
"use client";

import * as React from "react";
import ResumesHeader from "./ResumesHeader";
import ResumesCardsView from "./ResumesCardsView";
import ResumesTableView from "./ResumesTableView";
import DuplicateDialog from "./DuplicateDialog";
import CreateResumeDialog from "./CreateResumeDialog";
import DeleteDialog from "./DeleteDialog";
import { useResume } from "@/context/ResumeContext";
import { toast } from "sonner";
import { calculateCompleteness } from "@/lib/resumeAdapter";

export type ResumeStatus = "published" | "draft";
export type ViewMode = "cards" | "table";
export type ResumeItem = {
  id: string; title: string; status: ResumeStatus; pages: number;
  style: string; updatedAt: string; completeness: number; config?: any;
};

export function toResumeItem(backendResume: any): ResumeItem {
  const getTemplateLabel = (style?: string) => {
    if (!style) return "Academic";
    return style.split(":")[0].charAt(0).toUpperCase() + style.split(":")[0].slice(1);
  };

  const dataObj = backendResume.data || backendResume;
  let finalCompleteness = 0;

  if (dataObj.sections) {
    finalCompleteness = calculateCompleteness(dataObj.sections);
  } else {
    let safeTags: string[] = [];
    if (Array.isArray(dataObj.tags)) safeTags = dataObj.tags;
    else if (typeof dataObj.tags === "string") {
      try { safeTags = JSON.parse(dataObj.tags); } catch (e) { }
    }

    const compTag = safeTags.find((t: string) => t.startsWith("completeness:"));
    if (compTag) {
      finalCompleteness = parseInt(compTag.replace("completeness:", ""), 10);
    } else if (dataObj.completeness !== undefined && dataObj.completeness !== null) {
      finalCompleteness = Math.round(Number(dataObj.completeness));
    }
  }

  return {
    id: String(backendResume.id || dataObj.id),
    title: dataObj.title || "Untitled Resume",
    status: (dataObj.status || "draft") as ResumeStatus,
    pages: dataObj.pages || 1,
    style: getTemplateLabel(dataObj.style),
    updatedAt: dataObj.updated_at || new Date().toISOString(),
    completeness: finalCompleteness,
  };
}

export default function Resumes() {
  const { resumes: backendResumes, loading, deleteResume, updateResume, duplicateResume, refreshResumes } = useResume();
  const resumes = React.useMemo(() => backendResumes.map(toResumeItem), [backendResumes]);

  const [viewMode, setViewMode] = React.useState<ViewMode>("cards");
  const [search, setSearch] = React.useState("");
  const [highlightedId, setHighlightedId] = React.useState<string | null>(null);

  const [duplicateDialogOpen, setDuplicateDialogOpen] = React.useState(false);
  const [duplicateBaseTitle, setDuplicateBaseTitle] = React.useState<string | undefined>(undefined);
  const [duplicateTargetId, setDuplicateTargetId] = React.useState<string | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteBaseTitle, setDeleteBaseTitle] = React.useState<string | undefined>(undefined);
  const [deleteTargetId, setDeleteTargetId] = React.useState<string | null>(null);

  React.useEffect(() => { refreshResumes(); }, [refreshResumes]);

  React.useEffect(() => {
    const now = new Date().getTime();
    const recent = resumes.find(r => (now - new Date(r.updatedAt).getTime()) < 5000);
    if (recent) {
      setHighlightedId(recent.id);
      const timer = setTimeout(() => setHighlightedId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [resumes]);

  const items = React.useMemo(() => {
    const filtered = resumes.filter((r) => {
      if (!search.trim()) return true;
      return r.title.toLowerCase().includes(search.toLowerCase());
    });
    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [resumes, search]);

  function handleDuplicate(r: ResumeItem) { setDuplicateBaseTitle(r.title); setDuplicateTargetId(r.id); setDuplicateDialogOpen(true); }

  async function performDuplicate() {
    if (!duplicateTargetId) return;
    try {
      const original = resumes.find((r) => r.id === duplicateTargetId);
      if (!original) return;
      const duplicated = await duplicateResume(duplicateTargetId, `${original.title} (Copy)`);
      toast.success("Resume duplicated successfully");
      setDuplicateTargetId(null);
      setDuplicateDialogOpen(false);

      setHighlightedId(String(duplicated.id));
      setTimeout(() => setHighlightedId(null), 3000);
    } catch (error: any) { toast.error(error.message || "Failed to duplicate resume"); }
  }

  function handleDelete(r: ResumeItem) { setDeleteBaseTitle(r.title); setDeleteTargetId(r.id); setDeleteDialogOpen(true); }
  async function performDelete() {
    if (!deleteTargetId) return;
    try {
      await deleteResume(deleteTargetId);
      toast.success("Resume deleted successfully");
      setDeleteTargetId(null); setDeleteDialogOpen(false);
    } catch (error: any) { toast.error(error.message || "Failed to delete resume"); }
  }

  async function handleRename(r: ResumeItem, newTitle: string) {
    try {
      await updateResume(r.id, { title: newTitle });
      toast.success("Resume renamed successfully");
      setHighlightedId(r.id);
      setTimeout(() => setHighlightedId(null), 3000);
    } catch (error: any) { toast.error(error.message || "Failed to rename resume"); }
  }

  function handleDownload(r: ResumeItem) { toast.info("Download feature coming soon"); }
  function handleCreateNew() { setCreateDialogOpen(true); }

  if (loading) return <div className="profejoo mx-auto px-4 py-4 md:px-6 md:py-6 flex items-center justify-center min-h-[400px]"><p className="text-muted-foreground">Loading resumes...</p></div>;

  return (
    <div className="profejoo w-auto mx-4 pb-4 bg-card border border-border rounded-2xl shadow-sm px-4 py-3 md:px-5 md:py-4">
      <ResumesHeader viewMode={viewMode} onViewModeChange={setViewMode} search={search} onSearchChange={setSearch} onCreateNew={handleCreateNew} />
      {viewMode === "cards" ? (
        <ResumesCardsView highlightedId={highlightedId} items={items} onDuplicate={handleDuplicate} onDownload={handleDownload} onDelete={handleDelete} onRename={handleRename} />
      ) : (
        <ResumesTableView highlightedId={highlightedId} items={items} onDuplicate={handleDuplicate} onDownload={handleDownload} onDelete={handleDelete} />
      )}
      <DuplicateDialog open={duplicateDialogOpen} onOpenChange={(open) => { if (!open) setDuplicateTargetId(null); setDuplicateDialogOpen(open); }} baseTitle={duplicateBaseTitle} onConfirm={performDuplicate} />
      <DeleteDialog open={deleteDialogOpen} onOpenChange={(open) => { if (!open) setDeleteTargetId(null); setDeleteDialogOpen(open); }} baseTitle={deleteBaseTitle} onConfirm={performDelete} />
      <CreateResumeDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}