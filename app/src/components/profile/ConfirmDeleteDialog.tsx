// src/components/profile/ConfirmDeleteDialog.tsx
import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = "Delete item?",
  message = "This action cannot be undone. Are you sure you want to delete this item?",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  message?: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className="
          rounded-[var(--radius-lg)]
          data-[state=open]:animate-[fadeIn_.15s_ease]
          data-[state=closed]:animate-[fadeOut_.12s_ease]
        "
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="profejoo-h4">{title}</AlertDialogTitle>
          <AlertDialogDescription className="profejoo-body">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 profejoo">
          <AlertDialogCancel className="btn btn--outline-secondary btn--sm">
            Cancel
          </AlertDialogCancel>

          {/* destructive primary per your palette */}
          <AlertDialogAction
            onClick={onConfirm}
            className="
            btn btn--accent btn--sm
            "
          >
            Yes, delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
