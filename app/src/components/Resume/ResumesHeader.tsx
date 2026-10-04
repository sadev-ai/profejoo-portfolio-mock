// src/components/resumes/ResumesHeader.tsx
import * as React from "react";
import { FileText, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import ViewModeToggle from "./ViewModeToggle";
import type { ViewMode } from "./Resumes";

type ResumesHeaderProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onCreateNew: () => void;
};

export default function ResumesHeader({
  viewMode,
  onViewModeChange,
  search,
  onSearchChange,
  onCreateNew,
}: ResumesHeaderProps) {
  return (
    <div className="flex flex-col gap-3 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-[220px]">
          <FileText className="size-6 text-primary" />
          <div>
            <h1 className="text-lg font-semibold sm:text-xl">Resumes</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Manage, edit, and export tailored resumes for your applications.
            </p>
          </div>
        </div>

        <div className="relative flex-1 min-w-[240px] max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search resumes by title…"
            className="pl-10 pr-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="default"
            onClick={onCreateNew}
            className="btn btn--secondary btn--md gap-2"
          >
            <Plus className="size-4" />
            Create resume
          </Button>
          <ViewModeToggle viewMode={viewMode} onChange={onViewModeChange} />
        </div>
      </div>
    </div>
  );
}
