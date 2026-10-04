// src/components/emailsop/EmailSOPsHeader.tsx
"use client";

import * as React from "react";
import { Search, Mail, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ViewMode } from "./EmailSOPs";

interface EmailSOPsHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  search: string;
  onSearchChange: (val: string) => void;
}

export default function EmailSOPsHeader({
  viewMode,
  onViewModeChange,
  search,
  onSearchChange,
}: EmailSOPsHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
      
      {/* 🔹 Left section: icon and title */}
      <div className="flex items-start gap-4">
        {/* Icon similar to the resume page */}
        <div className="mt-1">
          <Mail className="size-6 text-foreground" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">
            Email & SOP
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your personalized emails and statements of purpose with ease.
          </p>
        </div>
      </div>

      {/* 🔹 Right section: search and filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
        
        {/* Search box */}
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title, recipient, or institution..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 bg-transparent"
          />
        </div>

        {/* 🔹 Container for the selects and view buttons (with consistent gap-4 spacing) */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          
          <Select defaultValue="type">
            <SelectTrigger className="w-full sm:w-[120px] bg-transparent">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sop">SOP</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="last_updated">
            <SelectTrigger className="w-full sm:w-[150px] bg-transparent">
              <SelectValue placeholder="Last updated" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_updated">Last updated</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>

          {/* View-mode toggle buttons (cards / table); their props live in the EmailSOPs file */}
          <div className="hidden sm:flex items-center p-1 bg-muted/30 border border-border rounded-md">
            <button
              type="button"
              onClick={() => onViewModeChange("cards")}
              className={`p-1.5 rounded-sm transition-colors ${
                viewMode === "cards"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={`p-1.5 rounded-sm transition-colors ${
                viewMode === "table"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="size-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}