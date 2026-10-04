// src/pages/DashboardPage.tsx
import React, { useState } from "react";
import Navbar from "@/components/Navbar/Navbar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

type OpenKeys = "profile";

export default function DashboardPage() {
  const [open, setOpen] = useState<Record<OpenKeys, boolean>>({
    profile: false,
  });

  const toggleOne = (key: OpenKeys) => {
    setOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    // 🔹 Internal scroll (h-dvh and overflow-y-auto) removed! Now the whole browser scrolls.
    <div className="flex min-h-screen flex-col">
      <Navbar open={open} onToggleOne={toggleOne} />

      {/* 🔹 Bottom spacing (pb-10) so the scroll reaches all the way to the end */}
      <main className="flex-1 w-full pb-4">
        <DashboardOverview />
      </main>
    </div>
  );
}