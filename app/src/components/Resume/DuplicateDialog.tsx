// src/components/resumes/DuplicateDialog.tsx
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
      itemLabel="resume"
      fallbackNoun="this resume"
    />
  );
}
