// src/components/profile/ProfileHeader.tsx
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function ProfileHeader({
  completeness,
  headerRef,
}: {
  completeness: number;
  headerRef: React.RefObject<HTMLDivElement>;
}) {
  const pct = completeness;

  return (
    <header
      ref={headerRef}
      className="
        fixed left-0 right-0 top-[96px] lg:top-[104px] z-20 border-b
        bg-background/80 supports-backdrop-filter:backdrop-blur
          /* safe-area for iOS notch */
      "
    >
      <div
        className="
          w-full px-4 md:px-6 py-3 sm:py-4 flex items-center
        "
      >
        {/* Left */}
<div className="hidden sm:flex w-1/2 items-center gap-2 sm:gap-3">
  <h1 className="text-lg sm:text-xl font-bold">Profile</h1>
</div>


        {/* Right */}
        <div className="w-full sm:w-1/2 ms-auto flex items-center justify-end gap-2 sm:gap-3">
          {/* Progress (compact on xs) */}
          <div className="flex items-center gap-2">
            <span className="text-primary-400 text-xs">Completeness</span>
            <div className="w-24 sm:w-36">
              <Progress value={pct} className="h-2" />
            </div>
            <span className="text-xs tabular-nums">{pct}%</span>
          </div>
        </div>
      </div>
    </header>
  );
}
