// components/TagPill.tsx
import React from "react";

type Props = { label: string; };

const TagPill: React.FC<Props> = ({ label }) => (
  <span className="inline-flex items-center rounded-full bg-(--accent-50)/63 px-4 py-2 text-xs md:text-sm text-black ">
    {label}
  </span>
);

export default TagPill;
