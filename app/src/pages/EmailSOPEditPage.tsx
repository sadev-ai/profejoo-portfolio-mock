// src/pages/EmailSOPEditPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar/Navbar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TiptapEditor, type EmailSOPItem } from "@/components/emailsop";
import { ROUTES } from "@/constants/routes";
import { readEmailSOPsRaw, writeEmailSOPsRaw } from "@/lib/emailSopStorage";

export default function EmailSOPEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [emailsop, setEmailSOP] = useState<EmailSOPItem | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [attemptedSave, setAttemptedSave] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState<"Email" | "SOP">("Email");
  const [recipient, setRecipient] = useState("");
  const [institution, setInstitution] = useState("");
  const [content, setContent] = useState("");

  // Sidebar state
  const [sidebarMode, setSidebarMode] = useState<"expanded" | "mini">("expanded");
  const [sidebarOpen, setSidebarOpen] = useState<Record<"profile" | "plans" | "resources" | "favorites" | "history", boolean>>({
    profile: false,
    plans: false,
    resources: false,
    favorites: false,
    history: false,
  });

  useEffect(() => {
    if (!id) {
      navigate(ROUTES.DASHBOARD_EMAIL_SOP, { replace: true });
      return;
    }

    // Load from localStorage
    const stored = readEmailSOPsRaw();
    if (stored) {
      try {
        const items = JSON.parse(stored);
        const item = items.find((e: EmailSOPItem) => e.id === id);
        
        if (item) {
          setEmailSOP(item);
          setTitle(item.title);
          setDocType(item.docType);
          setRecipient(item.recipient || "");
          setInstitution(item.institution || "");
          
          // Load content
          setContent(item.config?.content || "");
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Failed to load email/sop:", error);
        setNotFound(true);
      }
    } else {
      setNotFound(true);
    }
  }, [id, navigate]);

  const canSave = title.trim().length > 0;

  const handleSave = () => {
    if (!emailsop) return;
    setAttemptedSave(true);
    if (!canSave) return;

    setIsSaving(true);

    // Calculate word count
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const totalContent = tempDiv.textContent || tempDiv.innerText || "";
    const wordCount = totalContent.trim().split(/\s+/).length;

    // Calculate completeness
    let completeness = 0;
    if (title) completeness += 20;
    if (content.length > 100) completeness += 40;
    if (recipient || institution) completeness += 20;
    if (wordCount > 200) completeness += 20;

    const configData = { content };

    const updated: EmailSOPItem = {
      ...emailsop,
      title,
      docType,
      recipient,
      institution,
      wordCount,
      completeness: Math.min(completeness, 100),
      updatedAt: new Date().toISOString().slice(0, 10),
      config: {
        ...emailsop.config,
        ...configData,
      },
    };

    // Save to localStorage
    const stored = readEmailSOPsRaw();
    if (stored) {
      try {
        const items = JSON.parse(stored);
        const index = items.findIndex((e: EmailSOPItem) => e.id === id);
        if (index !== -1) {
          items[index] = updated;
          writeEmailSOPsRaw(JSON.stringify(items));
          setEmailSOP(updated);
        }
      } catch (error) {
        console.error("Failed to save:", error);
      }
    }

    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  const handleDownload = () => {
    const filename = title.replace(/\s+/g, "-");
    const downloadContent = content;
    
    const blob = new Blob([downloadContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (notFound) {
    return (
      <div className="profejoo flex flex-col h-dvh bg-[var(--tertiary-50)]">
        <div className="shrink-0 z-40 relative">
          <Navbar
            mode={sidebarMode}
            onToggleSidebar={() => setSidebarMode((m) => (m === "expanded" ? "mini" : "expanded"))}
            open={sidebarOpen}
            onToggleOne={(k) => setSidebarOpen((s) => ({
              profile: false,
              plans: false,
              resources: false,
              favorites: false,
              history: false,
              [k]: !s[k],
            }))}
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Document not found</p>
            <button
              type="button"
              onClick={() => navigate(ROUTES.DASHBOARD_EMAIL_SOP)}
              className="btn btn--outline-primary btn--md"
            >
              <ArrowLeft className="size-4" />
              Back to Email & SOP
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!emailsop) {
    return (
      <div className="profejoo flex flex-col h-dvh bg-[var(--tertiary-50)]">
        <div className="shrink-0 z-40 relative">
          <Navbar
            mode={sidebarMode}
            onToggleSidebar={() => setSidebarMode((m) => (m === "expanded" ? "mini" : "expanded"))}
            open={sidebarOpen}
            onToggleOne={(k) => setSidebarOpen((s) => ({
              profile: false,
              plans: false,
              resources: false,
              favorites: false,
              history: false,
              [k]: !s[k],
            }))}
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profejoo flex flex-col h-dvh bg-[var(--tertiary-50)]">
      <div className="shrink-0 z-40 relative">
        <Navbar
          mode={sidebarMode}
          onToggleSidebar={() => setSidebarMode((m) => (m === "expanded" ? "mini" : "expanded"))}
          open={sidebarOpen}
          onToggleOne={(k) => setSidebarOpen((s) => ({
            profile: false,
            plans: false,
            resources: false,
            favorites: false,
            history: false,
            [k]: !s[k],
          }))}
        />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-transparent shadow">
          <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(ROUTES.DASHBOARD_EMAIL_SOP)}
              className="btn btn--ghost btn--sm"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-lg font-semibold">Edit {docType}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="btn btn--outline-primary btn--sm"
            >
              <Download className="size-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || (attemptedSave && !canSave)}
              className="btn btn--primary btn--sm"
            >
              <Save className="size-4" />
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 md:px-4 py-6 w-full mx-auto">
            <div className="space-y-4">
          {/* Meta Information */}
          <div className="rounded-lg border border-[var(--tertiary-100)] bg-transparent p-6 shadow-sm">
            <h2 className="text-base font-semibold mb-4 text-tertiary">
              Document Information
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter document title"
                  aria-invalid={attemptedSave && !canSave}
                  className="profejoo-input--primary"
                />
                {attemptedSave && !canSave ? (
                  <p className="text-xs text-destructive">Title is required.</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="docType">Document Type *</Label>
                <Select value={docType} onValueChange={(v) => setDocType(v as "Email" | "SOP")}>
                  <SelectTrigger id="docType" className="profejoo-input--tertiary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="SOP">SOP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Input
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g., Dr. John Smith"
                  className="profejoo-input--secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g., Stanford University"
                  className="profejoo-input--secondary"
                />
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="rounded-lg border border-[var(--secondary-100)] bg-transparent p-6 shadow-sm">
            <h2 className="text-base font-semibold mb-4 text-tertiary">
              Content
            </h2>

            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder={
                docType === "Email"
                  ? "Write your email here..."
                  : "Write your statement of purpose here..."
              }
              minHeight="500px"
            />
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}