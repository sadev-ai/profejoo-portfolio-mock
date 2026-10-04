// components/IconCircleLink.tsx
import React from "react";

type Props = {
  href?: string;
  ariaLabel: string;
  bgClass?: string;            // e.g., "bg-sky-600"
  children: React.ReactNode;   // icon
};

const IconCircleLink: React.FC<Props> = ({ href = "#", ariaLabel, bgClass = "bg-slate-900", children }) => {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target="_blank"
      rel="noopener noreferrer"
      className={`h-10 w-10 rounded-full ${bgClass} flex items-center justify-center shadow-sm
                  transform transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:scale-105`}
    >
      {children}
    </a>
  );
};

export default IconCircleLink;
