// src/components/emailsop/EmailSOPs.tsx
"use client";

import * as React from "react";
import EmailSOPsHeader from "./EmailSOPsHeader";
import EmailSOPsCardsView from "./EmailSOPsCardsView";
import EmailSOPsTableView from "./EmailSOPsTableView";
import DuplicateDialog from "./DuplicateDialog";
import DeleteDialog from "./DeleteDialog";
import { readEmailSOPsRaw, writeEmailSOPsRaw } from "@/lib/emailSopStorage";

// Keep internal imports for component communication

/* ======================= Types ======================= */

export type EmailSOPStatus = "published" | "draft";
export type ViewMode = "cards" | "table";
export type SortBy = "updated" | "created" | "name-asc";

export type DocType = "all" | "Email" | "SOP";
export type EmailSOPItem = {
  id: string;
  title: string;
  status: EmailSOPStatus;
  docType: "Email" | "SOP";
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  source: string;
  completeness: number;
  recipient?: string; // For emails
  institution?: string; // For SOPs
  wordCount?: number;
  config?: any;
};

/* ======================= Mock Seed ======================= */

const MOCK_EMAIL_SOPS: EmailSOPItem[] = [
  {
    id: "1",
    title: "PhD Application Email - Dr. Smith",
    status: "published",
    docType: "Email",
    createdAt: "2025-10-15",
    updatedAt: "2025-11-20",
    source: "AI-assisted",
    completeness: 100,
    recipient: "Dr. John Smith",
    institution: "MIT",
    wordCount: 350,
  },
  {
    id: "2",
    title: "Statement of Purpose - Stanford CS",
    status: "draft",
    docType: "SOP",
    createdAt: "2025-10-20",
    updatedAt: "2025-11-15",
    source: "AI-assisted",
    completeness: 75,
    institution: "Stanford University",
    wordCount: 850,
  },
  {
    id: "3",
    title: "Follow-up Email – CMU",
    status: "draft",
    docType: "Email",
    createdAt: "2025-09-30",
    updatedAt: "2025-11-10",
    source: "Template",
    completeness: 60,
    recipient: "Dr. Jane Doe",
    institution: "Carnegie Mellon University",
    wordCount: 450,
  },
  {
    id: "4",
    title: "Networking Follow-up Email - Caltech",
    status: "draft",
    docType: "Email",
    createdAt: "2025-11-05",
    updatedAt: "2025-12-01",
    source: "Manual",
    completeness: 45,
    recipient: "Dr. Alan Turing",
    wordCount: 250,
  },
];

/* ======================= Main Component ======================= */

function normalizeDocType(
  value?: EmailSOPItem["docType"] | "Both",
  config?: EmailSOPItem["config"]
): EmailSOPItem["docType"] {
  if (value === "SOP") return "SOP";
  if (value === "Both") return config?.sopContent ? "SOP" : "Email";
  return "Email";
}

export default function EmailSOPs() {
  const [emailsops, setEmailSOPs] = React.useState<EmailSOPItem[]>(() => {
    // Load from localStorage
    const stored = readEmailSOPsRaw();
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Migrate old "sent" status to "published"
        const migrated = data.map((item: EmailSOPItem) => ({
          ...item,
          status: item.status === ("sent" as any) ? "published" : item.status,
          docType: normalizeDocType(item.docType, item.config),
          createdAt: item.createdAt || item.updatedAt || new Date().toISOString().slice(0, 10),
          source: item.source || "Manual",
        }));
        return migrated;
      } catch {
        return MOCK_EMAIL_SOPS;
      }
    }
    return MOCK_EMAIL_SOPS;
  });

  const [viewMode, setViewMode] = React.useState<ViewMode>("cards");
  const [search, setSearch] = React.useState("");

  // Duplicate dialog
  const [duplicateDialogOpen, setDuplicateDialogOpen] = React.useState(false);
  const [duplicateBaseTitle, setDuplicateBaseTitle] =
    React.useState<string | undefined>(undefined);
  const [duplicateTargetId, setDuplicateTargetId] =
    React.useState<string | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteBaseTitle, setDeleteBaseTitle] =
    React.useState<string | undefined>(undefined);
  const [deleteTargetId, setDeleteTargetId] =
    React.useState<string | null>(null);

  /* ---------- Filter + Sort ---------- */

  const items = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return emailsops;
    }

    return emailsops.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.docType.toLowerCase().includes(q) ||
        item.recipient?.toLowerCase().includes(q) ||
        item.institution?.toLowerCase().includes(q)
      );
    });
  }, [emailsops, search]);

  /* ---------- Handlers ---------- */

  // Duplicate
  function handleDuplicate(item: EmailSOPItem) {
    setDuplicateBaseTitle(item.title);
    setDuplicateTargetId(item.id);
    setDuplicateDialogOpen(true);
  }

  function performDuplicate() {
    if (!duplicateTargetId) return;
    setEmailSOPs((prev) => {
      const original = prev.find((item) => item.id === duplicateTargetId);
      if (!original) return prev;

      const today = new Date().toISOString().slice(0, 10);
      const copy: EmailSOPItem = {
        ...original,
        id: crypto?.randomUUID?.() ?? `copy-${Date.now()}`,
        title: `${original.title} (Copy)`,
        status: "draft",
        createdAt: today,
        updatedAt: today,
      };

      return [copy, ...prev];
    });
    setDuplicateTargetId(null);
  }

  // Delete
  function handleDelete(item: EmailSOPItem) {
    setDeleteBaseTitle(item.title);
    setDeleteTargetId(item.id);
    setDeleteDialogOpen(true);
  }

  // Rename
  function handleRename(item: EmailSOPItem, newTitle: string) {
    setEmailSOPs((prev) =>
      prev.map((doc) =>
        doc.id === item.id
          ? { ...doc, title: newTitle, updatedAt: new Date().toISOString().slice(0, 10) }
          : doc
      )
    );
  }

  function performDelete() {
    if (!deleteTargetId) return;
    setEmailSOPs((prev) => prev.filter((item) => item.id !== deleteTargetId));
    setDeleteTargetId(null);
  }

  // Download
  function handleDownload(item: EmailSOPItem) {
  }

  // Save to localStorage whenever they change
  React.useEffect(() => {
    writeEmailSOPsRaw(JSON.stringify(emailsops));
  }, [emailsops]);

  return (
    // 👇 Styles were adjusted to exactly match the Resumes.tsx file
    <div className="profejoo w-auto mx-4 pb-4  bg-card border border-border rounded-2xl shadow-sm px-4 py-8 md:px-5 md:py-4">
      <EmailSOPsHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        search={search}
        onSearchChange={setSearch}
      />

      {viewMode === "cards" ? (
        <EmailSOPsCardsView
          items={items}
          onDuplicate={handleDuplicate}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onRename={handleRename}
        />
      ) : (
        <EmailSOPsTableView
          items={items}
          onDuplicate={handleDuplicate}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      )}

      {/* Duplicate dialog */}
      <DuplicateDialog
        open={duplicateDialogOpen}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setDuplicateTargetId(null);
          }
          setDuplicateDialogOpen(open);
        }}
        baseTitle={duplicateBaseTitle}
        onConfirm={performDuplicate}
      />

      {/* Delete dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setDeleteTargetId(null);
          }
          setDeleteDialogOpen(open);
        }}
        baseTitle={deleteBaseTitle}
        onConfirm={performDelete}
      />
    </div>
  );
}