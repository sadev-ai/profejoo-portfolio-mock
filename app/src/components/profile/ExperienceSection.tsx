// src/components/profile/ExperienceSection.tsx
import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Trash2 } from "lucide-react";
import SectionTitle from "@/components/profile/SectionTitle";
import { useProfile } from "@/context/ProfileContext";
import { apiExperienceToUI, uiExperienceToAPI } from "@/lib/profileAdapter";
import { toast } from "sonner";

import RightSheet from "@/components/profile/RightSheet";
import ExperienceForm, {
  Experience,
} from "@/components/profile/ExperienceForm";
import ConfirmDeleteDialog from "@/components/profile/ConfirmDeleteDialog";
import "@/index.css";

const makeId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const typeLabel = (t: Experience["experienceType"]) => {
  switch (t) {
    case "work":
      return "Work";
    case "ra":
      return "Research assistantship";
    case "ta":
      return "Teaching assistantship";
    default:
      return "Experience";
  }
};

export default function ExperienceSection({
  attachRef,
  onCountsChange,
}: {
  attachRef: (el: HTMLElement | null) => void;
  onCountsChange?: (u: { experience?: number }) => void;
}) {
  const { profile, updateProfile } = useProfile();
  const [items, setItems] = React.useState<Experience[]>([]);

  // Load experience from profile when it changes
  React.useEffect(() => {
    if (profile?.data?.experience) {
      const uiExperience = apiExperienceToUI(profile.data.experience);
      setItems(uiExperience as Experience[]);
    }
  }, [profile]);

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"add" | "edit">("add");
  const [editing, setEditing] = React.useState<Experience | null>(null);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    onCountsChange?.({ experience: items.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const openAdd = () => {
    setMode("add");
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (it: Experience) => {
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
      const apiExperience = uiExperienceToAPI(updatedList as any);
      
      await updateProfile({ experience: apiExperience });
      
      setItems(updatedList);
      setPendingId(null);
      setConfirmOpen(false);
      toast.success("Experience deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete experience:", error);
      toast.error(error.message || "Failed to delete experience");
    }
  };

  const onSave = async (v: Experience) => {
    try {
      let updatedList: Experience[];
      
      if (mode === "add") {
        const id = makeId();
        updatedList = [...items, { ...v, id }];
      } else if (mode === "edit" && editing?.id) {
        updatedList = items.map((x) =>
          x.id === editing.id ? { ...x, ...v, id: editing.id } : x
        );
      } else {
        return;
      }
      
      const apiExperience = uiExperienceToAPI(updatedList as any);
      await updateProfile({ experience: apiExperience });
      
      setItems(updatedList);
      setSheetOpen(false);
      toast.success(mode === "add" ? "Experience added successfully" : "Experience updated successfully");
    } catch (error: any) {
      console.error("Failed to save experience:", error);
      toast.error(error.message || "Failed to save experience");
    }
  };

  const fmt = (d?: string) =>
    d
      ? new Date(d).toLocaleString(undefined, {
          month: "short",
          year: "numeric",
        })
      : "—";

  const fmtRange = (x: Experience) => {
    const start = fmt(x.start);
    if (x.currently) return `${start} — Present`;
    const end = fmt(x.end);
    return `${start} — ${end}`;
  };

  return (
    <section
      id="experience"
      data-key="experience"
      ref={(el) => attachRef(el)}
      className="scroll-mt-28 h-full"
    >
      <Card className="h-full rounded-[var(--radius-lg)] border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <SectionTitle title="Experience" count={items.length} />
            <Button
              size="sm"
              variant="secondary"
              onClick={openAdd}
              type="button"
              className="btn btn--tertiary btn--sm"
            >
              <Plus className="me-2 size-4" /> Add Experience
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
              No experience yet. Click{" "}
              <span className="font-medium">Add Experience</span> to create one.
            </div>
          ) : (
            items.map((x) => (
              <div
                key={x.id}
                className="rounded-xl border p-4 bg-card transition-colors hover:bg-muted/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{x.title}</div>
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase tracking-wide"
                      >
                        {typeLabel(x.experienceType)}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {x.org} • {fmtRange(x)}
                    </div>

                    {/* Details specific to work */}
                    {x.experienceType === "work" &&
                      (x.workType || x.workArrangement) && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {[x.workType, x.workArrangement]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>
                      )}

                    {/* Professor for RA/TA */}
                    {(x.experienceType === "ra" ||
                      x.experienceType === "ta") &&
                      x.professor && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Supervisor: {x.professor}
                        </div>
                      )}

                    {/* Description */}
                    {x.description && (
                      <p className="mt-2 text-sm text-foreground">
                        {x.description}
                      </p>
                    )}

                    {/* Bullets / Tasks */}
                    {!!x.bullets?.length && (
                      <ul className="mt-2 list-disc pe-6 space-y-1 text-sm">
                        {x.bullets.map((b, i) => (
                          <li className="ml-4" key={i}>
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Tags */}
                    {!!x.tags?.length && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {x.tags.map((t) => (
                          <Badge
                            key={t}
                            variant="outline"
                            title={t}
                            className="text-[var(--secondary-400)] bg-[var(--secondary-50)]"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => openEdit(x)}
                      type="button"
                      className="size-10 sm:size-8"
                      aria-label="Edit experience"
                      title="Edit"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => askDelete(x.id!)}
                      type="button"
                      className="size-10 sm:size-8 text-destructive"
                      aria-label="Delete experience"
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

      {/* Drawer (right sheet) */}
      <RightSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={mode === "add" ? "Add Experience" : "Edit Experience"}
        description={
          mode === "add"
            ? "Create a new experience item."
            : "Update this experience item."
        }
      >
        <ExperienceForm
          mode={mode}
          initial={editing ?? undefined}
          onCancel={() => setSheetOpen(false)}
          onSave={onSave}
        />
      </RightSheet>

      {/* Confirm delete */}
      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this experience?"
        message="This action cannot be undone. Do you really want to delete this experience item?"
        onConfirm={doDelete}
      />
    </section>
  );
}

