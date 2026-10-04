// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar/Navbar";
import Profile from "@/components/profile/Profile";
import { useMediaQueryLegacy } from "@/hooks/useMediaQueryLegacy";

type OpenKeys = "profile" | "plans" | "resources" | "favorites" | "history" | "Doodol";

export default function ProfilePage() {
  const LG_QUERY = "(min-width: 1024px)";
  const isLgUp = useMediaQueryLegacy(LG_QUERY);

  const [mode, setMode] = useState<"expanded" | "mini">("mini");
  const [open, setOpen] = useState<Record<OpenKeys, boolean>>({
    profile: false,
    plans: false,
    resources: false,
    favorites: false,
    history: false,
    Doodol: false,
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
        Doodol: false,
        [k]: next,
      };
    });

  const handleToggleSidebar = () => {
    if (!isLgUp) return; 
    setMode((m) => (m === "expanded" ? "mini" : "expanded"));
  };

  return (
    // 🔹 Structure made fully column-based so the navbar sits on top and the profile sits below it
    <div className="flex h-dvh flex-col bg-muted/10">
      
      {/* 🔹 Navbar contained in a floating, standard way */}
      <div className="shrink-0 z-40 relative">
        <Navbar
          mode={mode}
          onToggleSidebar={handleToggleSidebar}
          open={open}
          onToggleOne={toggleOne}
        />
      </div>

      {/* 🔹 Profile is rendered as a direct child */}
      <Profile />
    </div>
  );
}