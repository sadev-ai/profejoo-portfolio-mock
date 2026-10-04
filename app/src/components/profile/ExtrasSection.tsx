// src/components/profile/ExtrasSection.tsx
import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import SectionTitle from "@/components/profile/SectionTitle";
import { useProfile } from "@/context/ProfileContext";
import { apiExtrasToUI, uiExtrasToAPI } from "@/lib/profileAdapter";
import { toast } from "sonner";
import RightSheet from "@/components/profile/RightSheet";
import ExtraForm, { ExtraKV } from "@/components/profile/ExtraForm";
import ConfirmDeleteDialog from "@/components/profile/ConfirmDeleteDialog";

export default function ExtrasSection({
  attachRef,
  onCountsChange,
}: {
  attachRef: (el: HTMLElement | null) => void;
  onCountsChange?: (u: { extras?: number }) => void;
}) {
  const { profile, updateProfile } = useProfile();
  const [items, setItems] = React.useState<ExtraKV[]>([]);

  // Load extras from profile when it changes
  React.useEffect(() => {
    if (profile?.data?.extras) {
      const uiExtras = apiExtrasToUI(profile.data.extras);
      setItems(uiExtras as ExtraKV[]);
    }
  }, [profile]);

  const genId = () =>
    (globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  // Sheet state
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"add" | "edit">("add");
  const [editing, setEditing] = React.useState<ExtraKV | null>(null);

  // Confirm state
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  // Report the count to the parent
  React.useEffect(() => {
    onCountsChange?.({ extras: items.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const openAdd = () => {
    setMode("add");
    setEditing(null);
    setSheetOpen(true);
  };
  const openEdit = (it: ExtraKV) => {
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
      const apiExtras = uiExtrasToAPI(updatedList as any);
      
      await updateProfile({ extras: apiExtras });
      
      setItems(updatedList);
      setPendingId(null);
      setConfirmOpen(false);
      toast.success("Extra deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete extra:", error);
      toast.error(error.message || "Failed to delete extra");
    }
  };
  const onSave = async (v: ExtraKV) => {
    try {
      let updatedList: ExtraKV[];
      
      if (mode === "add") {
        updatedList = [...items, { ...v, id: genId() }];
      } else if (editing?.id) {
        updatedList = items.map((x) =>
          x.id === editing.id ? { ...x, ...v, id: editing.id } : x
        );
      } else {
        return;
      }
      
      const apiExtras = uiExtrasToAPI(updatedList as any);
      await updateProfile({ extras: apiExtras });
      
      setItems(updatedList);
      setSheetOpen(false);
      toast.success(mode === "add" ? "Extra added successfully" : "Extra updated successfully");
    } catch (error: any) {
      console.error("Failed to save extra:", error);
      toast.error(error.message || "Failed to save extra");
    }
  };

  return (
    <section
      id="extras"
      data-key="extras"
      ref={(el) => attachRef(el)}
      className="scroll-mt-28 h-full"
    >
      <Card className="h-full rounded-[var(--radius-lg)] border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <SectionTitle title="Extras" count={items.length} />
            <Button className="btn btn--tertiary btn--sm" size="sm" variant="secondary" onClick={openAdd} type="button">
              <Plus className="me-2 size-4" /> Add Extra
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 sm:space-y-4">
          {items.length === 0 ? (
            <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
              No extras yet. Click <span className="font-medium">Add Extra</span> to create one.
            </div>
          ) : (
            items.map((x) => {
              const dateRange = [x.start, x.end].filter(Boolean).join(" – ");
              const subtitle = [x.organization, x.location].filter(Boolean).join(" · ");
              return (
                <div
                  key={x.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:p-3.5 bg-card text-sm transition-colors hover:bg-muted/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{x.title || x.k}</p>
                      {(subtitle || dateRange) && (
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {subtitle}
                          {subtitle && dateRange ? " · " : ""}
                          {dateRange}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-10 sm:size-8"
                        aria-label="Edit extra"
                        title="Edit"
                        type="button"
                        onClick={() => openEdit(x)}
                      >
                        <Edit className="size-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        className="size-10 sm:size-8 text-destructive"
                        aria-label="Delete extra"
                        title="Delete"
                        type="button"
                        onClick={() => askDelete(x.id!)}
                      >
                        <Trash2 className="size-4 profejoo-accent" />
                      </Button>
                    </div>
                  </div>

                  {(x.v || x.bullets?.length) ? (
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2" title={x.v}>
                      {x.v || x.bullets?.join(", ")}
                    </p>
                  ) : null}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Right-side sheet */}
      <RightSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={mode === "add" ? "Add Extra" : "Edit Extra"}
        description={mode === "add" ? "Create a new extra key/value row." : "Update this extra row."}
      >
        <ExtraForm
          mode={mode}
          initial={editing ?? undefined}
          onCancel={() => setSheetOpen(false)}
          onSave={onSave}
        />
      </RightSheet>

      {/* Confirm delete dialog */}
      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this row?"
        message="This action cannot be undone. Do you really want to delete this item?"
        onConfirm={doDelete}
      />
    </section>
  );
}

