// src/pages/ResumePage.tsx
import { useState } from "react";
import Navbar from "@/components/Navbar/Navbar";
import Resumes from "@/components/Resume/Resumes";

type OpenKeys = "profile";

export default function ResumePage() {
  const [open, setOpen] = useState<Record<OpenKeys, boolean>>({
    profile: false,
  });

  const toggleOne = (key: OpenKeys, state?: boolean) => {
    setOpen((prev) => ({
      ...prev,
      [key]: state !== undefined ? state : !prev[key],
    }));
  };

  return (
    <main className="flex-1 w-full pb-10">
      {/* ResumeProvider is already mounted once at the app root (main.tsx) —
          wrapping it again here created a second, independent instance with
          its own state and its own fetch of the resume list every time this
          page mounted. */}
      <div className="flex min-h-screen flex-col">
        <div className="shrink-0 z-40 relative">
          <Navbar open={open} onToggleOne={toggleOne} />
        </div>

        <Resumes />
      </div>
    </main>
  );
}
