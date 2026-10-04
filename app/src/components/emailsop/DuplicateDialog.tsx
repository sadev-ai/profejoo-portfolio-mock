// src/components/emailsop/DuplicateDialog.tsx
import ConfirmDuplicateDialog from "@/components/Shared/ConfirmDuplicateDialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseTitle?: string;
  onConfirm?: () => void;
};

export default function DuplicateDialog(props: Props) {
  return (
    <ConfirmDuplicateDialog
      {...props}
      itemLabel="Email/SOP"
      fallbackNoun="this document"
    />
  );
}
