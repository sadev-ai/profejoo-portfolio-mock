// src/components/resumes/ResumeActions.tsx
import { Button } from "@/components/ui/button";
import { Copy, Download, Trash2 } from "lucide-react";
import type { ResumeItem } from "./Resumes";

type ResumeActionsProps = {
  resume: ResumeItem;
  onDuplicate: (r: ResumeItem) => void;
  onDownload: (r: ResumeItem) => void;
  onDelete: (r: ResumeItem) => void;
};

export default function ResumeActions({ resume, onDuplicate, onDownload, onDelete }: ResumeActionsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); onDuplicate(resume); }} title="Duplicate">
        <Copy className="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); onDownload(resume); }} title="Download">
        <Download className="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-[var(--accent-400)] hover:bg-[var(--accent-50)]" onClick={(e) => { e.stopPropagation(); onDelete(resume); }} title="Delete">
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}