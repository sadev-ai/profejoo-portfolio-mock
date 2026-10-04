// src/components/profile/EducationsSection.tsx
import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Trash2 } from "lucide-react";
import SectionTitle from "@/components/profile/SectionTitle";
import { useProfile } from "@/context/ProfileContext";
import { apiAcademicsToUI, uiAcademicsToAPI, type UIEducation } from "@/lib/profileAdapter";
import { toast } from "sonner";

import RightSheet from "@/components/profile/RightSheet";
import ConfirmDeleteDialog from "@/components/profile/ConfirmDeleteDialog";
import EducationForm, {
  Education,
} from "@/components/profile/EducationForm";

export default function EducationsSection({
  attachRef,
  onCountsChange,
}: {
  attachRef: (el: HTMLElement | null) => void;
  onCountsChange?: (u: { education?: number }) => void;
}) {
  /** ---------- utils ---------- */
  const fmtMonthYear = React.useMemo(
    () => new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" }),
    []
  );
  const pretty = (d?: string) => (d ? fmtMonthYear.format(new Date(d)) : "—");
  const genId = () =>
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const { profile, updateProfile } = useProfile();
  
  /** ---------- Education local state from API ---------- */
  const [education, setEducation] = React.useState<Education[]>([]);

  // Load education from profile when it changes
  React.useEffect(() => {
    if (profile?.data?.academics) {
const uiEducation = apiAcademicsToUI(profile.data.academics);
setEducation(uiEducation as Education[]);
    } else {
setEducation([]);
    }
  }, [profile]);

  // add/edit sheet state
  const [eduSheetOpen, setEduSheetOpen] = React.useState(false);
  const [eduMode, setEduMode] = React.useState<"add" | "edit">("add");
  const [editingEdu, setEditingEdu] = React.useState<Education | null>(null);

  // delete confirm state
  const [eduConfirmOpen, setEduConfirmOpen] = React.useState(false);
  const [eduPendingId, setEduPendingId] = React.useState<string | null>(null);

  const openAddEdu = () => {
    setEduMode("add");
    setEditingEdu(null);
    setEduSheetOpen(true);
  };
  const openEditEdu = (item: Education) => {
    setEduMode("edit");
    setEditingEdu(item);
    setEduSheetOpen(true);
  };
  const askDeleteEdu = (id: string) => {
    setEduPendingId(id);
    setEduConfirmOpen(true);
  };
  const doDeleteEdu = async () => {
    if (!eduPendingId) return;
    
    try {
      const updatedList = education.filter((x) => x.id !== eduPendingId);
      const apiEducation = uiAcademicsToAPI(updatedList as UIEducation[]);
      
      await updateProfile({ academics: apiEducation });
      
      setEducation(updatedList);
      setEduPendingId(null);
      setEduConfirmOpen(false);
      toast.success("Education deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete education:", error);
      toast.error(error.message || "Failed to delete education");
    }
  };
  
  const saveEdu = async (values: Education) => {
    try {
      let updatedList: Education[];
      
      if (eduMode === "add") {
        const id = genId();
        updatedList = [...education, { ...values, id }];
      } else if (eduMode === "edit" && editingEdu?.id) {
        updatedList = education.map((x) =>
          x.id === editingEdu.id ? { ...x, ...values, id: editingEdu.id } : x
        );
      } else {
        return;
      }
      
      const apiEducation = uiAcademicsToAPI(updatedList as UIEducation[]);
      await updateProfile({ academics: apiEducation });
      
      setEducation(updatedList);
      setEduSheetOpen(false);
      toast.success(eduMode === "add" ? "Education added successfully" : "Education updated successfully");
    } catch (error: any) {
      console.error("Failed to save education:", error);
      toast.error(error.message || "Failed to save education");
    }
  };

  /** ---------- report counts ---------- */
  React.useEffect(() => {
    onCountsChange?.({ education: education.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [education.length]);

  return (
    <section
      id="academics"
      data-key="academics"
      ref={(el) => attachRef(el)}
      className="scroll-mt-28 h-full"
    >
      <div className="space-y-6 h-full">
        {/* -------- Education -------- */}
        <Card className="h-full shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <SectionTitle title="Education" count={education.length} />
              <Button
                className="btn btn--tertiary btn--sm"
                size="sm"
                variant="secondary"
                onClick={openAddEdu}
                type="button"
              >
                <Plus className="me-2 size-4" /> Add Education
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {education.length === 0 ? (
              <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
                No education yet. Click Add Education to create one.
              </div>
            ) : (
              education.map((e) => (
                <div
                  key={e.id}
                  className="rounded-xl border p-4 sm:p-5 bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">
                        {e.level} in {e.major}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {e.institution}
                        {e.city ? `, ${e.city}` : ""}
                        {e.country ? `, ${e.country}` : ""} •{" "}
                        {pretty(e.start)} —{" "}
                        {e.current ? "Present" : pretty(e.end)}
                      </div>
                      {e.thesis && (
                        <p className="mt-2 text-sm leading-6">{e.thesis}</p>
                      )}
                      {e.gpa && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge
                            variant="secondary"
                            className="text-[var(--secondary-400)] bg-[var(--secondary-50)]"
                          >
                            {e.gpa}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 flex gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="size-10 sm:size-8"
                        aria-label="Edit education"
                        onClick={() => openEditEdu(e)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="size-10 sm:size-8 text-destructive"
                        aria-label="Delete education"
                        onClick={() => askDeleteEdu(e.id!)}
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
      </div>

      {/* ---------- Drawers & Dialogs ---------- */}

      {/* Education Sheet */}
      <RightSheet
        open={eduSheetOpen}
        onOpenChange={setEduSheetOpen}
        title={eduMode === "add" ? "Add Education" : "Edit Education"}
        description={
          eduMode === "add"
            ? "Create a new education record."
            : "Update this education record."
        }
      >
        <EducationForm
          mode={eduMode}
          initial={editingEdu ?? undefined}
          onCancel={() => setEduSheetOpen(false)}
          onSave={saveEdu}
        />
      </RightSheet>

      {/* Education Delete Confirm */}
      <ConfirmDeleteDialog
        open={eduConfirmOpen}
        onOpenChange={setEduConfirmOpen}
        title="Delete this education?"
        message="This action cannot be undone. Do you really want to delete this education item?"
        onConfirm={doDeleteEdu}
      />
    </section>
  );
}

