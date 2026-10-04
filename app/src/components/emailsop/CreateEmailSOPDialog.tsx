// src/components/emailsop/CreateEmailSOPDialog.tsx
import * as React from "react";
import { Mail, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import { useNavigate } from "react-router-dom";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type CreateMode = "email" | "sop";

export default function CreateEmailSOPDialog({ open, onOpenChange }: Props) {
  // const navigate = useNavigate();

  const handleSelect = (mode: CreateMode) => {
    // For now, navigate to a new page - you can customize these paths
    // const pathMap: Record<CreateMode, string> = {
    //   email: "/dashboard/email-sop/new/email",
    //   sop: "/dashboard/email-sop/new/sop",
    // };

    // You can implement these routes later
// navigate(pathMap[mode]);
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
            Create Email or SOP
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choose what type of document you&apos;d like to create. You can edit
            everything later.
          </DialogDescription>
        </DialogHeader>

        {/* Options */}
        <div className="flex flex-col gap-3 px-6 pb-4">
          {/* 1) Email */}
          <OptionRow
            icon={<Mail className="size-5" aria-hidden="true" />}
            title="Create Email"
            description="Write a professional email to professors or academic institutions using AI assistance."
            color="primary"
            onClick={() => handleSelect("email")}
          />

          {/* 2) SOP */}
          <OptionRow
            icon={<FileText className="size-5" aria-hidden="true" />}
            title="Create Statement of Purpose"
            description="Generate a comprehensive SOP for your graduate school applications."
            color="tertiary"
            onClick={() => handleSelect("sop")}
          />
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t bg-muted/40 px-6 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between profejoo">
          <p>
            Use AI assistance to craft compelling emails and statements that showcase your qualifications.
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="btn btn--outline-accent btn--sm self-end sm:self-auto"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ====================== OptionRow ====================== */

type OptionRowProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "primary" | "secondary" | "tertiary";
  onClick: () => void;
};

function OptionRow({
  icon,
  title,
  description,
  color,
  onClick,
}: OptionRowProps) {
  const colorClass =
    color === "primary"
      ? "text-primary"
      : color === "tertiary"
        ? "text-[var(--tertiary)]"
        : "text-[var(--secondary)]";

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group relative flex w-full cursor-pointer items-start gap-3
        rounded-xl border border-border/60 bg-card
        p-4 text-left
        transition-all
        hover:border-primary/40 hover:shadow-md
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
      "
    >
      <div
        className={`mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg ${colorClass} bg-current/10`}
      >
        <div className={colorClass}>{icon}</div>
      </div>

      <div className="flex-1">
        <h3 className="mb-1 font-semibold text-sm text-foreground sm:text-base">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {description}
        </p>
      </div>

      <ChevronRight className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
    </button>
  );
}
