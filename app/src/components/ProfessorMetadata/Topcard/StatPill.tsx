// components/StatPill.tsx
import React from "react";

type Props = {
  label: string;
  value: string | number;
  className?: string; // allow different pastel backgrounds
};

const StatPill: React.FC<Props> = ({ label, value, className = "bg-slate-100" }) => {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl px-4 py-2 ${className}`}>
      <p className="text-[11px] uppercase tracking-wide text-(--primary-200)">{label}</p>
      <p className="text-lg font-semibold text-primary-400)">{value}</p>
    </div>
  );
};

export default StatPill;
