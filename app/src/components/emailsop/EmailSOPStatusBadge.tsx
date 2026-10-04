// src/components/emailsop/EmailSOPStatusBadge.tsx
import StatusBadge from "@/components/Shared/StatusBadge";
import type { EmailSOPStatus } from "./EmailSOPs";

type Props = {
  status: EmailSOPStatus;
};

export default function EmailSOPStatusBadge({ status }: Props) {
  return <StatusBadge status={status} />;
}
