import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import SelectableTab from "@/components/SearchAndFilter/SelectableTab";

export interface OrderByProps {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
  mode: "University" | "Professor";
}

const OrderBy: React.FC<OrderByProps> = ({ options, selected, onChange, mode }) => {
  const [activeTab, setActiveTab] = useState(
    options.indexOf(selected) !== -1 ? options.indexOf(selected) : 0
  );

  const [highlight, setHighlight] = useState({ left: 0, width: 0 });

  // tab refs
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // scroll container ref
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // arrows enable/disable
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // ✅ NEW: detect if overflow exists (if not, center)
  const [isOverflowing, setIsOverflowing] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 2);
  }, []);

  const updateOverflow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setIsOverflowing(el.scrollWidth > el.clientWidth + 2);
  }, []);

  const updateHighlight = useCallback(() => {
    const el = tabRefs.current[activeTab];
    if (el && el.parentElement) {
      const parent = el.parentElement;
      const parentRect = parent.getBoundingClientRect();
      const rect = el.getBoundingClientRect();

      const left = rect.left - parentRect.left + parent.scrollLeft;
      const width = rect.width;

      setHighlight({ left, width });
    }
  }, [activeTab]);

  // Update activeTab when parent changes selection
  useEffect(() => {
    const newIndex = options.indexOf(selected);
    if (newIndex !== -1 && newIndex !== activeTab) {
      setActiveTab(newIndex);
    }
  }, [selected, options, activeTab]);

  // Run initial measurements + resize listeners
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      updateHighlight();
      updateScrollButtons();
      updateOverflow();
    });

    const onResize = () => {
      updateHighlight();
      updateScrollButtons();
      updateOverflow();
    };

    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [updateHighlight, updateScrollButtons, updateOverflow, options, mode]);

  // Listen to scroll to keep highlight aligned and update arrows
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      updateHighlight();
      updateScrollButtons();
      updateOverflow();
    };

    // initial state
    updateHighlight();
    updateScrollButtons();
    updateOverflow();

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [updateHighlight, updateScrollButtons, updateOverflow]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    onChange(options[index]);

    // keep the active tab visible on mobile (nice UX)
    const tabEl = tabRefs.current[index];
    if (tabEl && scrollRef.current) {
      tabEl.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const scrollByAmount = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const amount = Math.round(el.clientWidth * 0.7);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const headingText =
    mode === "University"
      ? "Universities Matching Your Search"
      : "Professors Matching Your Search";

  return (
    <div className="text-center w-full py-6">
      <h2 className="fnt-h2 text-(--primary-400) mb-3">{headingText}</h2>

      <div className="flex justify-center">
        <div className="relative w-full max-w-full md:w-auto">
          {/* Left arrow (mobile only, only if overflow exists) */}
          {/* <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollByAmount("left")}
            disabled={!canScrollLeft}
            className={[
              "md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-10",
              "h-9 w-9 rounded-full bg-white/80 backdrop-blur shadow",
              "grid place-items-center text-(--primary-400)",
              isOverflowing && canScrollLeft
                ? "opacity-100"
                : "opacity-0 pointer-events-none",
              "transition-opacity",
            ].join(" ")}
          >
            ‹
          </button> */}

          {/* Right arrow (mobile only, only if overflow exists) */}
          {/* <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollByAmount("right")}
            disabled={!canScrollRight}
            className={[
              "md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-10",
              "h-9 w-9 rounded-full bg-white/80 backdrop-blur shadow",
              "grid place-items-center text-(--primary-400)",
              isOverflowing && canScrollRight
                ? "opacity-100"
                : "opacity-0 pointer-events-none",
              "transition-opacity",
            ].join(" ")}
          >
            ›
          </button> */}

          {/* Scroll container */}
          <div
            ref={scrollRef}
            className={[
              "bg-(--accent-50)/50 rounded-[24px] p-2",
              "max-w-full overflow-x-auto whitespace-nowrap scroll-smooth",
              // space so arrows don't cover text (mobile only)
              "px-4 md:px-2",
              // hide scrollbar
              "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              // allow non-scroll layout on desktop
              "md:overflow-x-visible",

              // ✅ center when NOT overflowing
              !isOverflowing ? "mx-auto w-fit" : "w-full",
            ].join(" ")}
          >
            {/* Inner inline-flex: highlight positioned relative to this */}
            <div
              className={[
                "relative inline-flex items-center",
                !isOverflowing ? "justify-center" : "justify-start",
              ].join(" ")}
            >
              {/* Highlight */}
              <motion.div
                className="absolute top-0 bottom-0 py-4 bg-white rounded-[24px] shadow-lg pointer-events-none"
                animate={{ left: highlight.left, width: highlight.width }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />

              {/* Tabs */}
              {options.map((label, i) => (
                <SelectableTab
                  key={i}
                  label={label}
                  active={activeTab === i}
                  onClick={() => handleTabClick(i)}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBy;
