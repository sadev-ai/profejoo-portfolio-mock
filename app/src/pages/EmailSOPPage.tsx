// src/pages/EmailSOPPage.tsx
import React, { useState } from "react";
import Navbar from "@/components/Navbar/Navbar";
import { EmailSOPs } from "@/components/emailsop";

type OpenKeys = "profile";

export default function EmailSOPPage() {
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
    <main className="flex-1 w-full pb-4">
      {/* 🔹 flex-col structure similar to the resume page */}
      <div className="flex min-h-screen flex-col">
        
        {/* 🔹 Using the same Navbar structure and classes as the resume page */}
        <div className="shrink-0 z-40 relative">
          <Navbar open={open} onToggleOne={toggleOne} />
        </div>

        {/* 🔹 Main content */}
        <EmailSOPs />
      </div>
    </main>
  );
}