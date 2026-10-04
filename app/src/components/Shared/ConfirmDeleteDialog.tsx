// src/components/shared/ConfirmDeleteDialog.tsx
//
// Shared implementation behind components/resumes/DeleteDialog.tsx and
// components/emailsop/DeleteDialog.tsx, which were otherwise identical
// aside from the item label ("resume" vs "Email/SOP") and the fallback
// noun used when no title is available. Each of those files is now a thin
// wrapper passing its own label in, so every existing import/usage of
// either keeps working unchanged.
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
  /** e.g. "resume" or "Email/SOP" -- used in the "Delete {itemLabel}" title. */
  itemLabel: string;
  /** Used in place of baseTitle when none is given, e.g. "this resume". */
  fallbackNoun: string;
};

export default function ConfirmDeleteDialog({
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
          <DialogTitle>Delete {itemLabel}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            This action cannot be undone.{" "}
            <span className="font-medium text-foreground">
              {baseTitle || fallbackNoun}
            </span>{" "}
            will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end profejoo">
          <Button
            type="button"
            onClick={handleClose}
            className="btn btn--outline-primary btn--sm" size="sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="btn btn--accent btn--sm" size="sm"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
