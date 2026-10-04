// src/hooks/useScrollSpy.ts
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

export type SectionKey =
  | "basics"
  | "academics"
  | "experience"
  | "publications"
  | "projects"
  | "talks"
  | "honors"
  | "credentials"
  | "skills"
  | "languages"
  | "interests"
  | "extras";

export type ScrollSpyApi = {
  active: SectionKey;
  pinned: boolean;
  headerH: number;
  tabsH: number;
  indicator: { left: number; width: number };
  headerRef: React.RefObject<HTMLDivElement>;
  tabsWrapRef: React.RefObject<HTMLDivElement>;
  sentinelRef: React.RefObject<HTMLDivElement>;
  listRef: React.RefObject<HTMLDivElement>;
  triggersRef: React.MutableRefObject<Record<SectionKey, HTMLButtonElement | null>>;
  sectionRefs: React.MutableRefObject<Record<SectionKey, HTMLElement | null>>;
  jumpTo: (key: SectionKey) => void;
};

const SECTIONS: SectionKey[] = [
  "basics",
  "academics",
  "experience",
  "publications",
  "projects",
  "talks",
  "honors",
  "credentials",
  "skills",
  "languages",
  "interests",
  "extras",
];

const TOP_EXTRA_OFFSET = 8;
const UNDERLINE_FRACTION = 0.5;
const UNDERLINE_MIN_W = 24;

// how long we treat a programmatic (click-triggered) scroll as "in flight"
// before we trust natural scroll detection again. Kept as a fallback for
// browsers without the `scrollend` event.
const PROGRAMMATIC_SCROLL_FALLBACK_MS = 600;
const PROGRAMMATIC_SCROLL_FALLBACK_MS_REDUCED = 100;

const hasWindow = typeof window !== "undefined";
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);

export default function useScrollSpy(): ScrollSpyApi {
  const [active, setActive] = useState<SectionKey>("basics");
  const [pinned, setPinned] = useState(false);
  const [headerH, setHeaderH] = useState(0);
  const [tabsH, setTabsH] = useState(0);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const headerRef = useRef<HTMLDivElement | null>(null);
  const tabsWrapRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const triggersRef = useRef<Record<SectionKey, HTMLButtonElement | null>>(
    Object.fromEntries(SECTIONS.map((k) => [k, null])) as Record<SectionKey, HTMLButtonElement | null>
  );
  const sectionRefs = useRef<Record<SectionKey, HTMLElement | null>>(
    Object.fromEntries(SECTIONS.map((k) => [k, null])) as Record<SectionKey, HTMLElement | null>
  );

  // refs for values also mirrored in state (so handlers always read fresh values
  // without needing to be re-created / re-subscribed on every state change)
  const activeRef = useRef<SectionKey>("basics");
  const pinnedRef = useRef(false);
  const headerHRef = useRef(0);
  const tabsHRef = useRef(0);
  const rootRef = useRef<HTMLElement | null>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const prefersReducedMotion = useMemo(
    () =>
      hasWindow && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false,
    []
  );

  // Find the scrollable container. Recomputed on demand (never cached forever)
  // because the [data-spy-root] element may not exist yet the first time this
  // runs -- e.g. while the host page is still showing its own "Loading..."
  // placeholder and hasn't mounted the real profile/resume markup.
  const pickScrollRoot = useCallback((): HTMLElement | null => {
    if (!hasWindow) return null;

    const marked = document.querySelector("[data-spy-root]") as HTMLElement | null;
    if (marked) return marked;

    const first = sectionRefs.current.basics;
    let node: HTMLElement | null = first ? first.parentElement : null;
    while (node) {
      const st = getComputedStyle(node);
      if (/(auto|scroll)/.test(st.overflowY)) return node;
      node = node.parentElement;
    }
    return null;
  }, []);

  // Always resolve through here instead of reading rootRef.current directly --
  // it re-picks the root if we never found one yet, or if the previously found
  // one got unmounted (route change, remount, etc.).
  const getRoot = useCallback((): HTMLElement | null => {
    if (!hasWindow) return null;
    if (rootRef.current && rootRef.current.isConnected) return rootRef.current;
    const found = pickScrollRoot();
    rootRef.current = found;
    return found;
  }, [pickScrollRoot]);

  const getScrollTop = useCallback(() => {
    const root = getRoot();
    if (root) return root.scrollTop;
    if (!hasWindow) return 0;
    return window.scrollY || window.pageYOffset || 0;
  }, [getRoot]);

  const setScrollTop = useCallback(
    (y: number) => {
      if (!hasWindow) return;
      const root = getRoot();

      isScrollingRef.current = true;

      if (root) {
        root.scrollTo({ top: y, behavior: prefersReducedMotion ? "auto" : "smooth" });
      } else {
        window.scrollTo({ top: y, behavior: prefersReducedMotion ? "auto" : "smooth" });
      }

      // Fallback clear in case the `scrollend` listener isn't supported or
      // never fires (e.g. the target position equals the current position).
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(
        () => {
          isScrollingRef.current = false;
        },
        prefersReducedMotion ? PROGRAMMATIC_SCROLL_FALLBACK_MS_REDUCED : PROGRAMMATIC_SCROLL_FALLBACK_MS
      );
    },
    [prefersReducedMotion, getRoot]
  );

  const getMaxScroll = useCallback(() => {
    const root = getRoot();
    if (root) return root.scrollHeight - root.clientHeight;
    if (!hasWindow) return 0;
    const doc = document.documentElement;
    return doc.scrollHeight - window.innerHeight;
  }, [getRoot]);

  const measureHeights = useCallback(() => {
    const h = headerRef.current?.offsetHeight ?? 0;
    const t = tabsWrapRef.current?.offsetHeight ?? 0;

    if (h !== headerHRef.current) {
      headerHRef.current = h;
      setHeaderH(h);
    }

    if (t !== tabsHRef.current) {
      tabsHRef.current = t;
      setTabsH(t);
    }
  }, []);

  const updateIndicatorFrom = useCallback((key: SectionKey) => {
    const list = listRef.current;
    const trg = triggersRef.current[key];
    if (!list || !trg) return;

    requestAnimationFrame(() => {
      try {
        const listRect = list.getBoundingClientRect();
        const trgRect = trg.getBoundingClientRect();
        const w = Math.max(UNDERLINE_MIN_W, trgRect.width * UNDERLINE_FRACTION);
        const left = trgRect.left - listRect.left + (trgRect.width - w) / 2;
        setIndicator({ left, width: w });
      } catch (error) {
        console.warn("Error updating indicator:", error);
      }
    });
  }, []);

  const currentOffset = useCallback(
    () => headerHRef.current + (pinnedRef.current ? tabsHRef.current : 0) + TOP_EXTRA_OFFSET,
    []
  );

  // jumpTo: scroll to a section when its tab is clicked.
  const jumpTo = useCallback(
    (key: SectionKey) => {
      if (!hasWindow) return;

      const el = sectionRefs.current[key];
      if (!el) {
        console.warn(`useScrollSpy: no element registered for "${key}" yet`);
        return;
      }

      // A new click always wins -- cancel whatever the previous click was
      // still doing instead of silently ignoring this one. (Previously this
      // bailed out entirely while a prior smooth-scroll was still settling,
      // which made rapid tab clicks look like they "did nothing".)
      clearTimeout(scrollTimeoutRef.current);

      activeRef.current = key;
      setActive(key);
      updateIndicatorFrom(key);

      const root = getRoot();
      const rect = el.getBoundingClientRect();
      const currentScroll = getScrollTop();

      let absoluteTop: number;

      if (root) {
        const rootRect = root.getBoundingClientRect();
        absoluteTop = rect.top - rootRect.top + root.scrollTop;
      } else {
        absoluteTop = rect.top + currentScroll;
      }

      const offset = currentOffset();
      const maxY = getMaxScroll();
      const targetY = clamp(absoluteTop - offset, 0, maxY);

      setScrollTop(targetY);

      // horizontal-scroll the tab strip so the clicked tab stays in view
      setTimeout(
        () => {
          const trg = triggersRef.current[key];
          if (trg && listRef.current) {
            const listRect = listRef.current.getBoundingClientRect();
            const trgRect = trg.getBoundingClientRect();

            const isVisible = trgRect.left >= listRect.left && trgRect.right <= listRect.right;

            if (!isVisible) {
              trg.scrollIntoView({
                inline: "center",
                block: "nearest",
                behavior: prefersReducedMotion ? "auto" : "smooth",
              });
            }
          }
        },
        prefersReducedMotion ? 50 : 300
      );
    },
    [getRoot, getScrollTop, getMaxScroll, setScrollTop, currentOffset, updateIndicatorFrom, prefersReducedMotion]
  );

  // handleScroll: detect which section is active as the user scrolls.
  const handleScroll = useCallback(() => {
    if (isScrollingRef.current) {
      return; // a click-triggered scroll is in flight -- don't fight it
    }

    measureHeights();

    const root = getRoot();
    const rootTop = root ? root.getBoundingClientRect().top : 0;

    const sentTop = sentinelRef.current?.getBoundingClientRect().top ?? 0;
    const pinnedNow = sentTop <= rootTop + 1;
    if (pinnedNow !== pinnedRef.current) {
      pinnedRef.current = pinnedNow;
      setPinned(pinnedNow);
    }

    const anchorY = rootTop + headerHRef.current + (pinnedNow ? tabsHRef.current : 0) + TOP_EXTRA_OFFSET;

    let found = false;
    let bestKey: SectionKey = activeRef.current;
    let bestTop = -Infinity;

    for (const key of SECTIONS) {
      const sec = sectionRefs.current[key];
      if (!sec) continue;

      const rect = sec.getBoundingClientRect();
      if (rect.top <= anchorY) {
        found = true;
        if (rect.top > bestTop) {
          bestTop = rect.top;
          bestKey = key;
        }
      }
    }

    if (!found) {
      bestKey = "basics";
    }

    if (bestKey !== activeRef.current) {
      activeRef.current = bestKey;
      setActive(bestKey);
      updateIndicatorFrom(bestKey);
    }
  }, [measureHeights, updateIndicatorFrom, getRoot]);

  useEffect(() => {
    if (!hasWindow) return;

    rootRef.current = pickScrollRoot();
    measureHeights();

    let ticking = false;
    const tick = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          handleScroll();
          // keep the tab-strip underline aligned with whatever tab is active,
          // including when the tab strip itself is scrolled horizontally
          updateIndicatorFrom(activeRef.current);
          ticking = false;
        });
      }
    };

    const clearScrollingFlag = () => {
      clearTimeout(scrollTimeoutRef.current);
      isScrollingRef.current = false;
    };

    // Listen on `window` with `capture: true` rather than on whatever element
    // `pickScrollRoot()` returned. Scroll events don't bubble, but capturing
    // listeners on an ancestor still see them on the way down to the actual
    // target -- so this reliably catches scrolling on the real container
    // ([data-spy-root]) even if that element didn't exist yet when this
    // effect first ran (e.g. the host page was still rendering a loading
    // placeholder). This is what makes the spy keep working after the
    // profile/resume data finishes loading.
    window.addEventListener("scroll", tick, { passive: true, capture: true });
    window.addEventListener("resize", tick, { passive: true });
    if ("onscrollend" in window) {
      (window as any).addEventListener("scrollend", clearScrollingFlag, { passive: true, capture: true });
    }

    tick();

    return () => {
      window.removeEventListener("scroll", tick, true as any);
      window.removeEventListener("resize", tick as any);
      if ("onscrollend" in window) {
        (window as any).removeEventListener("scrollend", clearScrollingFlag, true);
      }
      clearTimeout(scrollTimeoutRef.current);
    };
  }, [handleScroll, pickScrollRoot, measureHeights, updateIndicatorFrom]);

  // Re-validate the scroll root and re-measure header/tab heights after every
  // render. This is what lets the hook "self heal": if the first render(s)
  // happened before the real markup existed (root not found, heights 0), the
  // very next render after the content mounts fixes both without needing any
  // extra plumbing from the pages that use this hook.
  useEffect(() => {
    if (!hasWindow) return;
    if (!rootRef.current || !rootRef.current.isConnected) {
      rootRef.current = pickScrollRoot();
    }
    measureHeights();
  });

  return {
    active,
    pinned,
    headerH,
    tabsH,
    indicator,
    headerRef,
    tabsWrapRef,
    sentinelRef,
    listRef,
    triggersRef,
    sectionRefs,
    jumpTo,
  };
}
