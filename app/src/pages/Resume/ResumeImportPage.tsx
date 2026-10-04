// src/pages/ResumeImportPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { ROUTES } from "@/constants/routes";

import Navbar from "@/components/Navbar/Navbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMediaQueryLegacy } from "@/hooks/useMediaQueryLegacy";

type OpenKeys = "profile" | "plans" | "resources" | "favorites" | "history";

export default function ResumeImportPage() {
  const LG_QUERY = "(min-width: 1024px)";
  const isLgUp = useMediaQueryLegacy(LG_QUERY);
  const navigate = useNavigate();

  // sidebar states
  const [mode, setMode] = useState<"expanded" | "mini">("mini");
  const [open, setOpen] = useState<Record<OpenKeys, boolean>>({
    profile: false,
    plans: false,
    resources: false,
    favorites: false,
    history: false,
  });

  useEffect(() => {
    setMode(isLgUp ? "expanded" : "mini");
  }, [isLgUp]);

  const toggleOne = (k: OpenKeys) =>
    setOpen((s) => {
      const next = !s[k];
      return {
        profile: false,
        plans: false,
        resources: false,
        favorites: false,
        history: false,
        [k]: next,
      };
    });

  const handleToggleSidebar = () => {
    if (!isLgUp) return;
    setMode((m) => (m === "expanded" ? "mini" : "expanded"));
  };

  const handleBack = () => {
    navigate(ROUTES.DASHBOARD_RESUME_MAKER);
  };

  return (
    <div className="profejoo flex h-dvh flex-col bg-muted/10">
      <div className="shrink-0 z-40 relative">
        <Navbar
          mode={mode}
          onToggleSidebar={handleToggleSidebar}
          open={open}
          onToggleOne={toggleOne}
        />
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          {/* Header */}
          <header className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleBack}
              aria-label="Back to resumes"
              className="
                h-9 w-9 rounded-full border
                bg-background text-muted-foreground
                shadow-sm transition
                hover:bg-muted
              "
            >
              <ArrowLeft className="size-4" />
            </Button>

            <div>
              <h1 className="text-lg font-semibold sm:text-xl">
                Import from File
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Upload your existing resume to get started.
              </p>
            </div>
          </header>

          {/* Coming Soon Area */}
          <section className="flex flex-1 items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-[var(--profejoo-border)] bg-background/60 px-4 py-16 sm:px-10">
            <div className="mx-auto flex max-w-md flex-col items-center gap-5 text-center">
              {/* Icon */}
              <div
                className="
                  flex h-16 w-16 items-center justify-center
                  rounded-2xl border
                  border-[var(--secondary-400)]
                  bg-[var(--secondary-50)]
                  text-[var(--secondary-400)]
                "
              >
                <Clock className="size-7" />
              </div>

              <div className="space-y-3">
                <h2 className="text-base font-semibold sm:text-xl">
                  AI Resume Parser
                </h2>
                <div>
                  <span className="inline-block rounded-full bg-[var(--accent-50)] px-3 py-1 text-xs font-medium text-[var(--accent-600)] border border-[var(--accent-200)]">
                    Coming Soon
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  We are actively working on an AI-powered resume parser that will instantly extract and organize your existing PDF or DOCX resume into our smart builder.
                </p>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                <Button
                  type="button"
                  onClick={handleBack}
                  className="btn btn--outline-secondary btn--sm min-w-[140px]"
                >
                  Back to Resumes
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate(ROUTES.DASHBOARD_RESUME_MAKER_NEW_FROM_PROFILE)}
                  className="btn btn--primary btn--sm min-w-[140px]"
                >
                  Build from Profile
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}