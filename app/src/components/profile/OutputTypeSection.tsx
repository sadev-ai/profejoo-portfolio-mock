// src/components/profile/OutputTypeSection.tsx
//
// Generic "one output type" profile section (Publications / Projects /
// Talks / Honors & Awards all render through this one component, configured
// via `config`). These four used to be four separate ~270-line files that
// were copy-pasted from one another; each copy then hand-rolled its own
// "force the type to X before saving" override, and three of the four got
// the casing wrong (see outputType.ts for the full story), so Projects,
// Talks, and Honors & Awards added through the Profile UI were all silently
// saved to the backend as type "publication". Filtering, saving, and
// deleting now all go through the single canonical output-type helpers, so
// there is exactly one place left where that bug could recur.
import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import SectionTitle from "@/components/profile/SectionTitle";
import { useProfile } from "@/context/ProfileContext";
import { apiOutputToUI, uiOutputToAPI } from "@/lib/profileAdapter";
import { toast } from "sonner";
import RightSheet from "@/components/profile/RightSheet";
import OutputForm, { type OutputItem } from "@/components/profile/OutputForm";
import ConfirmDeleteDialog from "@/components/profile/ConfirmDeleteDialog";
import { filterByOutputType, outputTypeToLabel, type OutputType } from "@/lib/outputType";
import type { Counts } from "@/lib/profileCompleteness";

export type OutputTypeSectionConfig = {
  /** Canonical backend type this instance manages. */
  type: OutputType;
  /** Which Counts field this section reports up to the parent. */
  countKey: "publications" | "projects" | "talks" | "honors";
  /** DOM id / data-key / scroll-spy anchor, e.g. "publications". */
  sectionId: string;
  /** Card heading, e.g. "Honors & Awards". */
  title: string;
  /** Singular noun used in buttons/dialogs, e.g. "Honor". */
  singular: string;
  /** Lowercase plural used in body copy, e.g. "honors or awards". */
  pluralLower: string;
};

export default function OutputTypeSection({
  attachRef,
  onCountsChange,
  config,
}: {
  attachRef: (el: HTMLElement | null) => void;
  onCountsChange?: (u: Partial<Counts>) => void;
  config: OutputTypeSectionConfig;
}) {
  const { type, countKey, sectionId, title, singular, pluralLower } = config;
  const { profile, updateProfile } = useProfile();
  const [items, setItems] = React.useState<OutputItem[]>([]);

  // Load just this type from the profile's combined output list.
  React.useEffect(() => {
    const uiOutput = apiOutputToUI(profile?.data?.output);
    setItems(filterByOutputType(uiOutput, type) as OutputItem[]);
  }, [profile, type]);

  // Sheet state
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"add" | "edit">("add");
  const [editing, setEditing] = React.useState<OutputItem | null>(null);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  // Report count to parent
  React.useEffect(() => {
    onCountsChange?.({ [countKey]: items.length } as Partial<Counts>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const genId = () =>
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const openAdd = () => {
    setMode("add");
    setEditing({ type: outputTypeToLabel(type) } as OutputItem);
    setSheetOpen(true);
  };

  const openEdit = (it: OutputItem) => {
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
      // Mutate the full output list (all four types), not just this bucket.
      const allOutput = apiOutputToUI(profile?.data?.output || []) as OutputItem[];
      const updatedList = allOutput.filter((x) => x.id !== pendingId);
      const apiOutput = uiOutputToAPI(updatedList as any);

      await updateProfile({ output: apiOutput });

      setItems(items.filter((x) => x.id !== pendingId));
      setPendingId(null);
      setConfirmOpen(false);
      toast.success(`${singular} deleted successfully`);
    } catch (error: any) {
      console.error(`Failed to delete ${singular.toLowerCase()}:`, error);
      toast.error(error.message || `Failed to delete ${singular.toLowerCase()}`);
    }
  };

  const onSave = async (v: OutputItem) => {
    try {
      const allOutput = apiOutputToUI(profile?.data?.output || []) as OutputItem[];
      let updatedAllOutput: OutputItem[];

      if (mode === "add") {
        updatedAllOutput = [...allOutput, { ...v, id: genId() }];
      } else if (editing?.id) {
        updatedAllOutput = allOutput.map((x) =>
          x.id === editing.id ? { ...x, ...v, id: editing.id } : x
        );
      } else {
        return;
      }

      const apiOutput = uiOutputToAPI(updatedAllOutput as any);
      await updateProfile({ output: apiOutput });

      setItems(filterByOutputType(updatedAllOutput, type) as OutputItem[]);
      setSheetOpen(false);
      toast.success(
        mode === "add" ? `${singular} added successfully` : `${singular} updated successfully`
      );
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
            <Button
              className="btn btn--tertiary btn--sm"
              size="sm"
              variant="secondary"
              onClick={openAdd}
              type="button"
            >
              <Plus className="me-2 size-4" /> Add {singular}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {items.length === 0 ? (
            <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
              No {pluralLower} yet. Click{" "}
              <span className="font-medium">Add {singular}</span> to create your first entry.
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              {items.map((o) => (
                <OutputCard key={o.id} item={o} singular={singular} onEdit={openEdit} onDelete={askDelete} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sheet for add/edit */}
      <RightSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={mode === "add" ? `Add ${singular}` : `Edit ${singular}`}
        description={
          mode === "add" ? `Create a new ${singular.toLowerCase()} entry.` : `Update this ${singular.toLowerCase()} entry.`
        }
      >
        <OutputForm
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
        title={`Delete this ${singular.toLowerCase()}?`}
        message={`This action cannot be undone. Do you really want to delete this ${singular.toLowerCase()}?`}
        onConfirm={doDelete}
      />
    </section>
  );
}

// Shared card used to render one output item, regardless of type.
function OutputCard({
  item,
  singular,
  onEdit,
  onDelete,
}: {
  item: OutputItem;
  singular: string;
  onEdit: (item: OutputItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article className="group rounded-xl border bg-card p-4 sm:p-5 transition-shadow hover:shadow-sm focus-within:shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
        <h3 className="text-sm sm:text-base font-medium leading-6">{item.title}</h3>
      </div>

      {item.venue ? (
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{item.venue}</p>
      ) : null}

      {item.summary ? (
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
      ) : null}

      {item.link ? (
        <a
          href={item.link}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs sm:text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
        >
          View
        </a>
      ) : null}

      {!!item.tags?.length && (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.map((t) => (
            <Badge key={t} variant="outline" className="text-[10px] sm:text-xs">
              {t}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <Button
          size="icon"
          variant="outline"
          className="size-10 sm:size-8"
          onClick={() => onEdit(item)}
          aria-label={`Edit ${singular.toLowerCase()}`}
          type="button"
        >
          <Edit className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="size-10 sm:size-8 text-destructive"
          onClick={() => onDelete(item.id!)}
          aria-label={`Delete ${singular.toLowerCase()}`}
          type="button"
        >
          <Trash2 className="size-4 profejoo-accent" />
        </Button>
      </div>
    </article>
  );
}
