import React, { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import SelectableTab from "@/components/SearchAndFilter/SelectableTab";

type SearchModeTabsProps = {
  activeMode: "University" | "Professor";
  onModeChange: (mode: "University" | "Professor") => void;
};

const SearchModeTabs: React.FC<SearchModeTabsProps> = ({ activeMode, onModeChange }) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabs: ("University" | "Professor")[] = ["University", "Professor"];
  const activeIndex = tabs.indexOf(activeMode);

  const [highlight, setHighlight] = React.useState({ left: 0, width: 0 });

  const updateHighlight = useCallback(() => {
    const el = tabRefs.current[activeIndex];
    if (el && el.parentElement) {
      const parent = el.parentElement;
      const parentRect = parent.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      const left = rect.left - parentRect.left + parent.scrollLeft;
      setHighlight({ left, width: rect.width });
    }
  }, [activeIndex]);

  useEffect(() => {
    updateHighlight();
    window.addEventListener("resize", updateHighlight);
    return () => window.removeEventListener("resize", updateHighlight);
  }, [updateHighlight]);

  return (
    <div className="text-center w-full py-0">
      <div className="flex justify-center">
        <div className="relative inline-flex items-center bg-(--better-white) rounded-t-[24px] p-2">
          <motion.div
            className="absolute top-2 bottom-2 bg-(--secondary-100) rounded-[24px] shadow-lg pointer-events-none"
            animate={{ left: highlight.left, width: highlight.width }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          {tabs.map((label, i) => (
            <SelectableTab
              key={label}
              label={label}
              active={activeMode === label}
              onClick={() => onModeChange(label)}
              hover_bg_color="secondary-400"
              ref={(el) => {(tabRefs.current[i] = el);}}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchModeTabs;
