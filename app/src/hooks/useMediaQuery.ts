// src/hooks/useMediaQuery.ts
//
// Moved here from src/lib/MediaQuery.ts -- it's a hook, so it belongs
// alongside useAuth.ts and useProfileSectionCounts.ts, and named to match
// the rest of the codebase's useXxx.ts convention for hooks.
import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(query).matches
      : false
  );

  useEffect(() => {
    const media = window.matchMedia(query);

    const listener = () => setMatches(media.matches);
    listener(); // set initial value

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
