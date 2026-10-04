// src/components/profile/SimpleListSection.tsx
//
// Generic "list of plain strings" profile section. Languages and Interests
// were two separate ~200-line files that differed only in the field name
// and the form used to collect one entry (Language also picks a proficiency
// level; Interest is a single text input) — everything else (loading,
// add/edit/delete wiring, the chip list, the sheet, the confirm dialog) was
// identical. That shared boilerplate now lives here once; each section
// supplies its own field name, labels, and form component.
import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import SectionTitle from "@/components/profile/SectionTitle";
import { useProfile } from "@/context/ProfileContext";
import { toast } from "sonner";
import RightSheet from "@/components/profile/RightSheet";
import ConfirmDeleteDialog from "@/components/profile/ConfirmDeleteDialog";
import type { Counts } from "@/lib/profileCompleteness";
import type { ProfileData } from "@/types/profile";

type Item = { id: string; value: string };

export type SimpleListFormComponent = React.ComponentType<{
  initial?: string;
  mode: "add" | "edit";
  onCancel: () => void;
  onSave: (v: string) => void;
}>;

export type SimpleListSectionConfig = {
  /** Which ProfileData string-array field this section manages. */
  field: "languages" | "interests";
  /** Which Counts field this section reports up to the parent. */
  countKey: "languages" | "interests";
  sectionId: string;
  /** Card heading, e.g. "Languages". */
  title: string;
  /** Singular noun for buttons/dialogs, e.g. "Language". */
  singular: string;
  /** The form rendered inside the add/edit sheet for one entry. */
  FormComponent: SimpleListFormComponent;
};

export default function SimpleListSection({
  attachRef,
  onCountsChange,
  config,
}: {
  attachRef: (el: HTMLElement | null) => void;
  onCountsChange?: (u: Partial<Counts>) => void;
  config: SimpleListSectionConfig;
}) {
  const { field, countKey, sectionId, title, singular, FormComponent } = config;
  const { profile, updateProfile } = useProfile();
  const [items, setItems] = React.useState<Item[]>([]);

  React.useEffect(() => {
    const values = (profile?.data?.[field] as string[] | undefined) || [];
    setItems(values.map((v, i) => ({ id: String(i + 1), value: v })));
  }, [profile, field]);

  const genId = () =>
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"add" | "edit">("add");
  const [editing, setEditing] = React.useState<Item | null>(null);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    onCountsChange?.({ [countKey]: items.length } as Partial<Counts>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const openAdd = () => {
    setMode("add");
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (it: Item) => {
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
      await updateProfile({ [field]: updatedList.map((i) => i.value) } as Partial<ProfileData>);

      setItems(updatedList);
      setPendingId(null);
      setConfirmOpen(false);
      toast.success(`${singular} deleted successfully`);
    } catch (error: any) {
      console.error(`Failed to delete ${singular.toLowerCase()}:`, error);
      toast.error(error.message || `Failed to delete ${singular.toLowerCase()}`);
    }
  };

  const onSave = async (val: string) => {
    try {
      let updatedList: Item[];

      if (mode === "add") {
        updatedList = [...items, { id: genId(), value: val }];
      } else if (editing) {
        updatedList = items.map((x) => (x.id === editing.id ? { ...x, value: val } : x));
      } else {
        return;
      }

      await updateProfile({ [field]: updatedList.map((i) => i.value) } as Partial<ProfileData>);

      setItems(updatedList);
      setSheetOpen(false);
      toast.success(mode === "add" ? `${singular} added successfully` : `${singular} updated successfully`);
    } catch (error: any) {
      console.error(`Failed to save ${singular.toLowerCase()}:`, error);
      toast.error(error.message || `Failed to save ${singular.toLowerCase()}`);
    }
  };

  return (
    <section
      id={sectionId}
      data-key={sectionId}
      ref={(el) => attachRef(el)}
      className="scroll-mt-28 h-full"
    >
      <Card className="h-full shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <SectionTitle title={title} count={items.length} />
            <Button size="sm" variant="secondary" onClick={openAdd} type="button" className="btn btn--tertiary btn--sm">
              <Plus className="me-2 size-4" />
              Add {singular}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {items.length === 0 ? (
            <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
              No {title.toLowerCase()} yet. Click <span className="font-medium">Add {singular}</span> to create one.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {items.map((i) => (
                <div
                  key={i.id}
                  className="group inline-flex items-center gap-1 rounded-full border bg-card/70 ps-3 pe-1 py-1 text-sm transition hover:bg-card focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
                >
                  <span className="font-medium max-w-[56vw] sm:max-w-none truncate">{i.value}</span>

                  <Button
                    aria-label={`Edit ${singular.toLowerCase()}`}
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(i)}
                    className="size-10 sm:size-8 px-0!"
                    type="button"
                  >
                    <Edit className="size-4" />
                  </Button>

                  <Button
                    aria-label={`Delete ${singular.toLowerCase()}`}
                    size="icon"
                    variant="ghost"
                    onClick={() => askDelete(i.id)}
                    className="size-10 sm:size-8 px-0! text-destructive"
                    type="button"
                  >
                    <Trash2 className="size-4 profejoo-accent" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RightSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={mode === "add" ? `Add ${singular}` : `Edit ${singular}`}
        description={mode === "add" ? `Create a new ${singular.toLowerCase()}.` : `Update this ${singular.toLowerCase()}.`}
      >
        <FormComponent
          mode={mode}
          initial={editing?.value}
          onCancel={() => setSheetOpen(false)}
          onSave={onSave}
        />
      </RightSheet>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete this ${singular.toLowerCase()}?`}
        message={`This action cannot be undone. Do you really want to delete this ${singular.toLowerCase()}?`}
        onConfirm={doDelete}
      />
    </section>
  );
}
