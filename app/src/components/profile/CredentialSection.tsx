// src/components/profile/CredentialSection.tsx
import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import SectionTitle from "@/components/profile/SectionTitle";
import { useProfile } from "@/context/ProfileContext";
import { apiCredentialsToUI, uiCredentialsToAPI } from "@/lib/profileAdapter";
import { toast } from "sonner";
import RightSheet from "@/components/profile/RightSheet";
import CredentialForm, { Credential } from "@/components/profile/CredentialForm";
import ConfirmDeleteDialog from "@/components/profile/ConfirmDeleteDialog";

export default function CredentialSection({
  attachRef,
  onCountsChange,
}: {
  attachRef: (el: HTMLElement | null) => void;
  onCountsChange?: (u: { credentials?: number }) => void;
}) {
  const { profile, updateProfile } = useProfile();
  const [items, setItems] = React.useState<Credential[]>([]);

  // Load credentials from profile when it changes
  React.useEffect(() => {
    if (profile?.data?.credentials) {
      const uiCredentials = apiCredentialsToUI(profile.data.credentials);
      setItems(uiCredentials as Credential[]);
    }
  }, [profile]);

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"add" | "edit">("add");
  const [editing, setEditing] = React.useState<Credential | null>(null);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    onCountsChange?.({ credentials: items.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const openAdd = () => {
    setMode("add");
    setEditing(null);
    setSheetOpen(true);
  };
  const openEdit = (it: Credential) => {
    setMode("edit");
    setEditing(it);
    setSheetOpen(true);
  };
  const askDelete = (id: string) => {
    setPendingId(id);
    setConfirmOpen(true);
  };
  const doDelete = async () => {
    if (!pendingId) return;
    
    try {
      const updatedList = items.filter((x) => x.id !== pendingId);
      const apiCredentials = uiCredentialsToAPI(updatedList as any);
      
      await updateProfile({ credentials: apiCredentials });
      
      setItems(updatedList);
      setPendingId(null);
      setConfirmOpen(false);
      toast.success("Credential deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete credential:", error);
      toast.error(error.message || "Failed to delete credential");
    }
  };
  const onSave = async (v: Credential) => {
    try {
      let updatedList: Credential[];
      
      if (mode === "add") {
        const id =
          globalThis.crypto?.randomUUID?.() ??
          `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        updatedList = [...items, { ...v, id }];
      } else if (editing?.id) {
        updatedList = items.map((x) =>
          x.id === editing.id ? { ...x, ...v, id: editing.id } : x
        );
      } else {
        return;
      }
      
      const apiCredentials = uiCredentialsToAPI(updatedList as any);
      await updateProfile({ credentials: apiCredentials });
      
      setItems(updatedList);
      setSheetOpen(false);
      toast.success(mode === "add" ? "Credential added successfully" : "Credential updated successfully");
    } catch (error: any) {
      console.error("Failed to save credential:", error);
      toast.error(error.message || "Failed to save credential");
    }
  };

  return (
    <section id="credentials" data-key="credentials" ref={(el) => attachRef(el)} className="scroll-mt-28 h-full">
      <Card className="h-full rounded-[var(--radius-lg)] border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <SectionTitle title="Credentials" count={items.length} />
            {/* Only at ≥ sm */}
            <Button
              onClick={openAdd}
              type="button"
              size="sm"
              variant="secondary"
              className="btn btn--tertiary btn--sm"
            >
              <Plus className="me-2 size-4" /> Add Credential
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          {items.length === 0 ? (
            <div className="md:col-span-2 rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
              No credentials yet. Tap <span className="font-medium">Add Credential</span> to create one.
            </div>
          ) : (
            items.map((c) => (
              <div
                key={c.id}
                className="group rounded-xl border bg-card p-4 transition-colors hover:bg-muted/60"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <div className="font-medium">{c.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {c.issuer}
                      {c.year ? ` • ${c.year}` : ""}
                    </div>
                    {c.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {c.description}
                      </p>
                    )}
                    {c.link && (
                      <a
                        href={c.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-xs text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                      >
                        View Certificate
                      </a>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Button
                      onClick={() => openEdit(c)}
                      type="button"
                      size="icon"
                      variant="outline"
                      className="size-10 sm:size-8"
                      aria-label="Edit credential"
                      title="Edit"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      onClick={() => askDelete(c.id!)}
                      type="button"
                      size="icon"
                      variant="outline"
                      className="size-10 sm:size-8 text-destructive"
                      aria-label="Delete credential"
                      title="Delete"
                    >
                      <Trash2 className="size-4 profejoo-accent" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}

        </CardContent>
      </Card>

      <RightSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={mode === "add" ? "Add Credential" : "Edit Credential"}
        description={mode === "add" ? "Create a new credential." : "Update this credential."}
      >
        <CredentialForm mode={mode} initial={editing ?? undefined} onCancel={() => setSheetOpen(false)} onSave={onSave} />
      </RightSheet>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this credential?"
        message="This action cannot be undone. Do you really want to delete this credential?"
        onConfirm={doDelete}
      />
    </section>
  );
}

