// src/components/profile/RightSheet.tsx
import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/**
 * Responsive Sheet:
 * - Mobile (<=640px): bottom-sheet ~90vh, rounded top
 * - Desktop: right panel, width via `widthClass` (e.g. "sm:max-w-md" | "sm:max-w-xl" | "sm:max-w-2xl")
 */
export default function RightSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  widthClass = "sm:max-w-xl",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  widthClass?: string;
}) {
  const [isMobile, setIsMobile] = React.useState(false);

  // watch media query for responsive side/size
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 640px)");
    const handler = () => setIsMobile(mql.matches);
    handler();
    mql.addEventListener?.("change", handler);
    return () => mql.removeEventListener?.("change", handler);
  }, []);

  // classes shared between modes
  const baseMotion =
    // motion-safe animations; respect reduced motion
    "motion-reduce:transition-none motion-reduce:animate-none " +
    "data-[state=open]:animate-in data-[state=closed]:animate-out";

  const desktopMotion =
    "data-[state=open]:slide-in-from-right data-[state=open]:duration-300 " +
    "data-[state=closed]:slide-out-to-right data-[state=closed]:duration-200";

  const mobileMotion =
    "data-[state=open]:slide-in-from-bottom data-[state=open]:duration-300 " +
    "data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-200";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        role="dialog"
        side={isMobile ? "bottom" : "right"}
        className={[
          "profejoo border-l bg-background text-foreground shadow-2xl",
          "p-0", // paddings handled inside
          baseMotion,
          isMobile ? mobileMotion : desktopMotion,
          // size & radius per mode
          isMobile
            ? "h-[92vh] max-h-[92vh] rounded-t-2xl pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
            : `${widthClass}`,
        ].join(" ")}
      >
        {/* Sticky header with blur */}
        <SheetHeader className="sticky top-0 z-10 border-b bg-muted/50 backdrop-blur px-5 sm:px-6 py-3 sm:py-4">
          <SheetTitle className="text-base sm:text-lg">{title}</SheetTitle>
          {description ? (
            <SheetDescription className="text-xs sm:text-sm text-muted-foreground">
              {description}
            </SheetDescription>
          ) : null}
        </SheetHeader>

        {/* Scrollable content area */}
        <div
          className={[
            "overflow-y-auto",
            // balanced paddings for both modes
            "px-5 sm:px-6 pb-6",
          ].join(" ")}
        >
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
