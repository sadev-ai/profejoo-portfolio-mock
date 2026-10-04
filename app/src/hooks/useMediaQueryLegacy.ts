// src/hooks/useMediaQueryLegacy.ts
//
// Was defined identically (as `useMediaQueryInline`) in both
// ResumeImportPage.tsx and notifications.tsx. Kept as a separate hook from
// useMediaQuery.ts rather than merged into it -- this version additionally
// falls back to the legacy MediaQueryList addListener/removeListener API
// for older browsers, and starts from `false` rather than computing the
// real initial value synchronously, so the two aren't drop-in replacements
// for each other.
import { useEffect, useState } from "react";

export function useMediaQueryLegacy(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;
    const mql = window.matchMedia(query);

    const handle = (e: MediaQueryListEvent | MediaQueryList) => {
      const next = "matches" in e ? e.matches : (e as MediaQueryList).matches;
      setMatches(next);
    };

    setMatches(mql.matches);

    if ("addEventListener" in mql) {
      mql.addEventListener("change", handle as EventListener);
      return () => mql.removeEventListener("change", handle as EventListener);
    } else {
      // @ts-expect-error legacy API
      mql.addListener(handle);
      // @ts-expect-error legacy API
      return () => mql.removeListener(handle);
    }
  }, [query]);

  return matches;
}
