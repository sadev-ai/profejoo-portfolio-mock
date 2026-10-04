// src/components/resumes/ResumesCardsView.tsx
import * as React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Pencil, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { resumeEditPath } from "@/constants/routes";
import { formatDate, cn } from "@/lib/utils";

import ResumeStatusBadge from "./ResumeStatusBadge";
import ResumeActions from "./ResumeActions"; // 1. Import the new component
import type { ResumeItem } from "./Resumes";

type ViewProps = {
  items: ResumeItem[];
  highlightedId?: string | null;
  onDuplicate: (r: ResumeItem) => void;
  onDownload: (r: ResumeItem) => void;
  onDelete: (r: ResumeItem) => void;
  onRename?: (r: ResumeItem, newTitle: string) => void;
};

type ResumeCardProps = {
  resume: ResumeItem;
  isHighlighted?: boolean;
  onOpen: () => void;
  onDuplicate: (r: ResumeItem) => void; // type changed for consistency
  onDownload: (r: ResumeItem) => void;  // type changed for consistency
  onDelete: (r: ResumeItem) => void;    // type changed for consistency
  onRename?: (newTitle: string) => void;
};

function ResumeCard({
  resume,
  isHighlighted,
  onOpen,
  onDuplicate,
  onDownload,
  onDelete,
  onRename,
}: ResumeCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedTitle, setEditedTitle] = React.useState(resume.title);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSaveTitle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editedTitle.trim() && onRename) {
      onRename(editedTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedTitle(resume.title);
    setIsEditing(false);
  };

  return (
    <Card
      onClick={onOpen}
      className={cn(
        "group flex h-full flex-col rounded-2xl border bg-card shadow-sm cursor-pointer transition-all duration-700 hover:shadow-md active:shadow-lg",
        isHighlighted ? "ring-2 ring-primary border-primary bg-primary/5 shadow-md" : ""
      )}
    >
      <CardHeader className="pb-3">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <ResumeStatusBadge status={resume.status} />
          <span className="rounded-full px-2 py-0.5 text-[11px] profejoo-border-primary">
            {resume.pages} pages
          </span>
          <span className="rounded-full px-2 py-0.5 text-[11px] profejoo-border-primary">
            {resume.style}
          </span>
        </div>

        <div className="min-h-12">
          {isEditing ? (
            <div className="flex items-start gap-1" onClick={(e) => e.stopPropagation()}>
              <Input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="h-8 text-base font-semibold"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle(e as any);
                  else if (e.key === 'Escape') handleCancelEdit(e as any);
                }}
              />
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-[var(--secondary-400)] hover:bg-[var(--secondary-50)]" onClick={handleSaveTitle} title="Save">
                <Check className="size-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-[var(--accent-400)] hover:bg-[var(--accent-50)]" onClick={handleCancelEdit} title="Cancel">
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <h2 className="flex items-center gap-2">
              <span className="line-clamp-2 flex-1 text-left text-base font-semibold text-foreground transition-colors group-hover:text-primary-400 group-hover:underline">
                {resume.title}
              </span>
              {onRename && (
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleStartEdit} title="Rename">
                  <Pencil className="size-3" />
                </Button>
              )}
            </h2>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-3 pb-3">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">Last change:</span> {formatDate(resume.updatedAt)}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Resume completeness</span>
            <span className="tabular-nums font-medium text-foreground/80">{resume.completeness}%</span>
          </div>
          <Progress value={resume.completeness} className="h-1.5" />
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-2 pt-3">
        <Button
          type="button"
          className="btn btn--tertiary btn--sm rounded-full flex items-center gap-2"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          <Pencil className="size-4" />
          <span className="text-xs">Edit</span>
        </Button>

        {/* 2. The old button code was removed and the new component is called here */}
        <div className="ml-auto flex items-center gap-1.5">
          <ResumeActions 
            resume={resume} 
            onDuplicate={onDuplicate} 
            onDownload={onDownload} 
            onDelete={onDelete} 
          />
        </div>
      </CardFooter>
    </Card>
  );
}

export default function ResumesCardsView({
  items,
  highlightedId,
  onDuplicate,
  onDownload,
  onDelete,
  onRename,
}: ViewProps) {
  const navigate = useNavigate();

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">
        <p>No resumes found.</p>
        <p className="mt-1 text-xs">Try searching or creating a new resume.</p>
      </div>
    );
  }

  const handleOpen = (id: string) => {
    navigate(resumeEditPath(id));
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
      {items.map((r) => (
        <ResumeCard
          key={r.id}
          resume={r}
          isHighlighted={r.id === highlightedId}
          onOpen={() => handleOpen(r.id)}
          // 3. The functions are passed directly, without an extra wrapper
          onDuplicate={onDuplicate}
          onDownload={onDownload}
          onDelete={onDelete}
          onRename={onRename ? (newTitle) => onRename(r, newTitle) : undefined}
        />
      ))}
    </div>
  );
}