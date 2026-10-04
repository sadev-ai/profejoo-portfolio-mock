// src/components/resumes/ResumesTableView.tsx
import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { resumeEditPath } from "@/constants/routes";

import ResumeStatusBadge from "./ResumeStatusBadge";
import ResumeActions from "./ResumeActions"; // 1. Import the new component
import { formatDate, cn } from "@/lib/utils";
import type { ResumeItem } from "./Resumes";

type Props = {
  items: ResumeItem[];
  highlightedId?: string | null;
  onDuplicate: (r: ResumeItem) => void;
  onDownload: (r: ResumeItem) => void;
  onDelete: (r: ResumeItem) => void;
};

export default function ResumesTableView({
  items,
  highlightedId,
  onDuplicate,
  onDownload,
  onDelete,
}: Props) {
  const navigate = useNavigate();

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/40 py-10 text-center text-sm text-muted-foreground">
        <p>No resumes found.</p>
        <p className="mt-1 text-xs">Try searching or creating a new resume.</p>
      </div>
    );
  }

  const handleOpen = (r: ResumeItem) => {
    navigate(resumeEditPath(r.id));
  };

  return (
    <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/60 text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Title</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Style</th>
            <th className="px-3 py-2 font-medium">Pages</th>
            <th className="px-3 py-2 font-medium">Completeness</th>
            <th className="px-3 py-2 font-medium">Last change</th>
            <th className="px-3 py-2 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr
              key={r.id}
              onClick={() => handleOpen(r)}
              className={cn(
                "group cursor-pointer border-t text-xs transition-all duration-700 sm:text-sm [&>td]:px-3 [&>td]:py-2",
                highlightedId === r.id ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/40"
              )}
            >
              <td className="max-w-xs">
                <div className="flex flex-col">
                  <span className="line-clamp-1 text-left font-medium text-foreground transition-colors group-hover:text-[var(--primary-400)] group-hover:underline">
                    {r.title}
                  </span>
                  <span className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                    {r.style} • {r.pages} pages
                  </span>
                </div>
              </td>

              <td>
                <ResumeStatusBadge status={r.status} />
              </td>

              <td>{r.style}</td>
              <td>{r.pages}</td>

              <td>
                <div className="flex items-center gap-2">
                  <Progress value={r.completeness} className="h-1.5 w-20" />
                  <span className="text-xs text-muted-foreground">{r.completeness}%</span>
                </div>
              </td>

              <td className="whitespace-nowrap text-xs text-muted-foreground">
                {formatDate(r.updatedAt)}
              </td>

              {/* 2. The old buttons were removed and replaced here with the shared component */}
              <td className="text-right">
                <div className="flex items-center justify-end">
                  <ResumeActions 
                    resume={r} 
                    onDuplicate={onDuplicate} 
                    onDownload={onDownload} 
                    onDelete={onDelete} 
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}