// src/components/resumes/CreateResumeDialog.tsx
import * as React from "react";
import { FileText, Upload, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type CreateMode = "file" | "profile" | "scratch";

export default function CreateResumeDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate();

  const handleSelect = (mode: CreateMode) => {
    const pathMap: Record<CreateMode, string> = {
      file: ROUTES.DASHBOARD_RESUME_MAKER_NEW_IMPORT,
      profile: ROUTES.DASHBOARD_RESUME_MAKER_NEW_FROM_PROFILE,
      scratch: ROUTES.DASHBOARD_RESUME_MAKER_NEW_SCRATCH,
    };

    navigate(pathMap[mode]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[min(100vw-1.5rem,960px)]
          sm:max-w-xl md:max-w-2xl
          rounded-2xl border bg-card text-card-foreground
          p-0
        "
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-3 text-left">
          <DialogTitle className="text-lg font-semibold">
            Create Resume
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choose how you&apos;d like to create your new resume. You can edit
            everything later.
          </DialogDescription>
        </DialogHeader>

        {/* Options */}
        <div className="flex flex-col gap-3 px-6 pb-4">
          <OptionRow
            icon={<Upload className="size-5" aria-hidden="true" />}
            title="Import from File"
            description="Upload a PDF or DOCX file to automatically extract and parse your resume content."
            color="primary"
            onClick={() => handleSelect("file")}
          />

          <OptionRow
            icon={<User className="size-5" aria-hidden="true" />}
            title="Build from Profile"
            description="Prefill your resume with sections from your existing Profejoo profile."
            color="tertiary"
            onClick={() => handleSelect("profile")}
          />

          <OptionRow
            icon={<FileText className="size-5" aria-hidden="true" />}
            title="Start from Scratch"
            description="Create a new resume step-by-step with our guided builder."
            color="secondary"
            onClick={() => handleSelect("scratch")}
          />
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t bg-muted/40 px-6 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            You can fully customize sections, wording, and layout after
            choosing a starting point.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="self-end sm:self-auto border-accent text-accent hover:bg-accent/10"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------- Option Row ---------------------- */

type ColorToken = "primary" | "secondary" | "tertiary" | "accent";

type OptionRowProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color: ColorToken;
};

type ColorTokens = {
  icon: string;
  arrow: string;
};

const COLOR_MAP: Record<ColorToken, ColorTokens> = {
  primary: {
    icon: "text-[var(--primary-400)] border-[var(--primary-400)] group-hover:bg-[var(--primary-50)]",
    arrow: "group-hover:bg-[var(--primary-50)] group-hover:text-[var(--primary-600)]",
  },
  secondary: {
    icon: "text-[var(--secondary-400)] border-[var(--secondary-400)] group-hover:bg-[var(--secondary-50)]",
    arrow: "group-hover:bg-[var(--secondary-50)] group-hover:text-[var(--secondary-600)]",
  },
  tertiary: {
    icon: "text-[var(--tertiary-400)] border-[var(--tertiary-400)] group-hover:bg-[var(--tertiary-50)]",
    arrow: "group-hover:bg-[var(--tertiary-50)] group-hover:text-[var(--tertiary-600)]",
  },
  accent: {
    icon: "text-[var(--accent-400)] border-[var(--accent-400)] group-hover:bg-[var(--accent-50)]",
    arrow: "group-hover:bg-[var(--accent-50)] group-hover:text-[var(--accent-600)]",
  },
};

function OptionRow({ icon, title, description, onClick, color }: OptionRowProps) {
  const styles = COLOR_MAP[color] || COLOR_MAP.primary;

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group flex w-full items-stretch justify-between gap-4
        rounded-2xl border bg-muted/40
        px-4 py-3 sm:px-5 sm:py-4
        text-left transition
        hover:bg-background hover:shadow-sm
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
      "
    >
      <div className="flex flex-1 items-center gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-transparent border sm:h-12 sm:w-12 transition-colors ${styles.icon}`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">
            {title}
          </div>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">
            {description}
          </p>
        </div>
      </div> {/* <-- this closing div tag had been missing */}

      <div
        className={`hidden sm:flex h-8 w-8 items-center justify-center self-center rounded-full bg-muted text-muted-foreground transition-colors ${styles.arrow}`}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </div>
    </button>
  );
}