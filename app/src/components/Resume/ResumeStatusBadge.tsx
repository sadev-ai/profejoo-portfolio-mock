// src/components/resumes/ResumeStatusBadge.tsx
import StatusBadge from "@/components/Shared/StatusBadge";
import type { ResumeStatus } from "./Resumes";

type Props = {
  status: ResumeStatus;
};

export default function ResumeStatusBadge({ status }: Props) {
  return <StatusBadge status={status} />;
}
