// components/ExpandingLink.tsx
import React, { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  href?: string;
  label: string;
  icon: React.ReactNode;
  bgClass?: string;
  textClass?: string;
  className?: string;
  collapsedPx?: number;
  onMeasured?: (w: number) => void;
};

const CIRCLE = 48; // h-12 w-12

const ExpandingLink: React.FC<Props> = ({
  href = "#",
  label,
  icon,
  bgClass = "bg-blue-500",
  textClass = "text-white",
  className = "",
  collapsedPx = CIRCLE,
  onMeasured,
}) => {
  const [hovered, setHovered] = useState(false);
  const [fullWidth, setFullWidth] = useState(collapsedPx);
  const textRef = useRef<HTMLSpanElement>(null);

  // Measure natural width
  useLayoutEffect(() => {
    const labelW = textRef.current?.getBoundingClientRect().width ?? 0;

    const total =
      CIRCLE + // left circle
      8 +      // gap (ml-2)
      labelW +
      16;      // right padding (pr-4)

    setFullWidth(total);
    onMeasured?.(total);
  }, [label, onMeasured]);

  return (
    <div className={`flex justify-end w-full ${className}`}>
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        initial={false}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        animate={{ width: hovered ? fullWidth : collapsedPx }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`
          relative h-12 overflow-hidden rounded-full shadow-sm flex items-center
          ${bgClass} ${textClass}
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-offset-2 focus-visible:ring-slate-200
        `}
      >
        {/* TRUE circular icon container */}
        <div className="
          absolute left-0 top-0 
          h-12 w-12 rounded-full
          flex items-center justify-center
        ">
          {/* image centered perfectly */}
          <div className="h-10 w-10 flex items-center justify-center">
            {icon}
          </div>
        </div>

        {/* Label (slides & fades) */}
        <motion.span
          ref={textRef}
          className="ml-14 whitespace-nowrap text-sm font-medium pr-4"
          initial={false}
          animate={{
            opacity: hovered ? 1 : 0,
            x: hovered ? 0 : 8,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {label}
        </motion.span>
      </motion.a>
    </div>
  );
};

export default ExpandingLink;
