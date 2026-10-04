// src/components/shared/ConfirmDuplicateDialog.tsx
//
// Shared implementation behind components/resumes/DuplicateDialog.tsx and
// components/emailsop/DuplicateDialog.tsx, which were otherwise identical
// aside from the item label and fallback noun. Each of those files is now
// a thin wrapper passing its own label in.
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseTitle?: string;
  onConfirm?: () => void;
  /** e.g. "resume" or "Email/SOP" -- used in the "Duplicate {itemLabel}" title. */
  itemLabel: string;
  /** Used in place of baseTitle when none is given, e.g. "this resume". */
  fallbackNoun: string;
};

export default function ConfirmDuplicateDialog({
  open,
  onOpenChange,
  baseTitle,
  onConfirm,
  itemLabel,
  fallbackNoun,
}: Props) {
  const handleClose = () => onOpenChange(false);

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Duplicate {itemLabel}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            A new copy of{" "}
            <span className="font-medium text-foreground">
              {baseTitle || fallbackNoun}
            </span>{" "}
            will be created. You can edit it independently.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end profejoo">
          <Button
            onClick={handleClose}
            className="btn btn--outline-accent btn--sm" variant="outline" size="sm" type="button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="btn btn--primary btn--sm" size="sm"
          >
            Duplicate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
