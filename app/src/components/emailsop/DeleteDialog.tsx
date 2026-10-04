// src/components/emailsop/DeleteDialog.tsx
import ConfirmDeleteDialog from "@/components/Shared/ConfirmDeleteDialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseTitle?: string;
  onConfirm?: () => void;
};

export default function DeleteDialog(props: Props) {
  return (
    <ConfirmDeleteDialog
      {...props}
      itemLabel="Email/SOP"
      fallbackNoun="this document"
    />
  );
}
