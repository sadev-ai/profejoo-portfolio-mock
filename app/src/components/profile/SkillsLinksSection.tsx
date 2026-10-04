// src/components/profile/SkillsLinksSection.tsx
import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import SectionTitle from "@/components/profile/SectionTitle";
import { useProfile } from "@/context/ProfileContext";
import { apiSkillsToUI, uiSkillsToAPI } from "@/lib/profileAdapter";
import { toast } from "sonner";
import RightSheet from "@/components/profile/RightSheet";
import SkillGroupForm, { SkillGroup } from "@/components/profile/SkillGroupForm";
import LinkForm, { LinkItem } from "@/components/profile/LinkForm";
import ConfirmDeleteDialog from "@/components/profile/ConfirmDeleteDialog";

export default function SkillsLinksSection({
  attachRef,
  onCountsChange,
}: {
  attachRef: (el: HTMLElement | null) => void;
  onCountsChange?: (u: { skillGroups?: number; links?: number }) => void;
}) {
  // --- helpers ---
  const genId = () =>
    (globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  const { profile, updateProfile } = useProfile();
  const [groups, setGroups] = React.useState<SkillGroup[]>([]);
  const [links, setLinks] = React.useState<LinkItem[]>([]);

  // Load skills and links from profile when it changes
  React.useEffect(() => {
    if (profile?.data) {
      const uiSkills = apiSkillsToUI(profile.data.skill_groups, profile.data.links);
      setGroups(uiSkills.stacks as SkillGroup[]);
      setLinks(uiSkills.links as LinkItem[]);
    }
  }, [profile]);

  // --- shared sheet state ---
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"add" | "edit">("add");
  const [kind, setKind] = React.useState<"group" | "link">("group");
  const [editingGroup, setEditingGroup] = React.useState<SkillGroup | null>(null);
  const [editingLink, setEditingLink] = React.useState<LinkItem | null>(null);

  // --- confirm delete state ---
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pending, setPending] = React.useState<{ kind: "group" | "link"; id: string } | null>(null);

  // Report counts to the parent (combined and lightweight)
  React.useEffect(() => {
    onCountsChange?.({ skillGroups: groups.length, links: links.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups.length, links.length]);

  // --- open helpers ---
  const openAddGroup = () => {
    setKind("group");
    setMode("add");
    setEditingGroup(null);
    setSheetOpen(true);
  };
  const openEditGroup = (g: SkillGroup) => {
    setKind("group");
    setMode("edit");
    setEditingGroup(g);
    setSheetOpen(true);
  };
  const openAddLink = () => {
    setKind("link");
    setMode("add");
    setEditingLink(null);
    setSheetOpen(true);
  };
  const openEditLink = (l: LinkItem) => {
    setKind("link");
    setMode("edit");
    setEditingLink(l);
    setSheetOpen(true);
  };

  // --- delete handlers ---
  const askDelete = (k: "group" | "link", id: string) => {
    setPending({ kind: k, id });
    setConfirmOpen(true);
  };
  const doDelete = async () => {
    if (!pending) return;
    
    try {
      let updatedGroups = groups;
      let updatedLinks = links;
      
      if (pending.kind === "group") {
        updatedGroups = groups.filter((g) => g.id !== pending.id);
        setGroups(updatedGroups);
      } else {
        updatedLinks = links.filter((l) => l.id !== pending.id);
        setLinks(updatedLinks);
      }
      
      const apiSkills = uiSkillsToAPI(updatedGroups as any, updatedLinks as any);
      await updateProfile({ skill_groups: apiSkills.skill_groups, links: apiSkills.links });
      
      setPending(null);
      setConfirmOpen(false);
      toast.success(pending.kind === "group" ? "Skill group deleted successfully" : "Link deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete:", error);
      toast.error(error.message || "Failed to delete");
    }
  };

  // --- save handlers ---
  const saveGroup = async (v: SkillGroup) => {
    try {
      let updatedGroups: SkillGroup[];
      
      if (mode === "add") {
        updatedGroups = [...groups, { ...v, id: genId() }];
      } else if (editingGroup?.id) {
        updatedGroups = groups.map((g) =>
          g.id === editingGroup.id ? { ...g, ...v, id: editingGroup.id } : g
        );
      } else {
        return;
      }
      
      const apiSkills = uiSkillsToAPI(updatedGroups as any, links as any);
      await updateProfile({ skill_groups: apiSkills.skill_groups, links: apiSkills.links });
      
      setGroups(updatedGroups);
      setSheetOpen(false);
      toast.success(mode === "add" ? "Skill group added successfully" : "Skill group updated successfully");
    } catch (error: any) {
      console.error("Failed to save skill group:", error);
      toast.error(error.message || "Failed to save skill group");
    }
  };
  const saveLink = async (v: LinkItem) => {
    try {
      let updatedLinks: LinkItem[];
      
      if (mode === "add") {
        updatedLinks = [...links, { ...v, id: genId() }];
      } else if (editingLink?.id) {
        updatedLinks = links.map((l) =>
          l.id === editingLink.id ? { ...l, ...v, id: editingLink.id } : l
        );
      } else {
        return;
      }
      
      const apiSkills = uiSkillsToAPI(groups as any, updatedLinks as any);
      await updateProfile({ skill_groups: apiSkills.skill_groups, links: apiSkills.links });
      
      setLinks(updatedLinks);
      setSheetOpen(false);
      toast.success(mode === "add" ? "Link added successfully" : "Link updated successfully");
    } catch (error: any) {
      console.error("Failed to save link:", error);
      toast.error(error.message || "Failed to save link");
    }
  };

  return (
    <section id="skills" data-key="skills" ref={(el) => attachRef(el)} className="scroll-mt-28 h-full">
      <div className="grid gap-6 md:grid-cols-2">
        {/* ===== Skills (Groups) ===== */}
        <Card className="h-full rounded-2xl border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <SectionTitle title="Skills" count={groups.length} />
              <Button className="btn btn--tertiary btn--sm" size="sm" variant="secondary" onClick={openAddGroup} type="button">
                <Plus className="me-2 size-4" /> Add Group
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {groups.length === 0 ? (
              <div className="rounded-xl border bg-background p-6 text-center text-sm text-muted-foreground">
                No skill groups yet. Click <span className="font-medium">Add Group</span> to create one.
              </div>
            ) : (
              groups.map((g) => (
                <div key={g.id} className="rounded-xl border bg-background p-4 sm:p-5">
                  <div className="mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="text-sm font-medium">{g.group}</div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-10 sm:size-8"
                        onClick={() => openEditGroup(g)}
                        aria-label="Edit group"
                        type="button"
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-10 sm:size-8 text-destructive"
                        onClick={() => askDelete("group", g.id!)}
                        aria-label="Delete group"
                        type="button"
                      >
                        <Trash2 className="size-4 profejoo-accent" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {g.items.map((it) => (
                      <Badge key={it} variant="outline" className="text-[var(--secondary-400)] bg-[var(--secondary-50)]">
                        {it}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* ===== Links ===== */}
        <Card className="h-full rounded-2xl border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <SectionTitle title="Links" count={links.length} />
              <Button className="btn btn--tertiary btn--sm" size="sm" variant="secondary" onClick={openAddLink} type="button">
                <Plus className="me-2 size-4" /> Add Link
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {links.length === 0 ? (
              <div className="rounded-xl border bg-background p-6 text-center text-sm text-muted-foreground">
                No links yet. Click <span className="font-medium">Add Link</span> to add one.
              </div>
            ) : (
              <ul className="space-y-3">
                {links.map((l) => (
                  <li
                    key={l.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-lg border bg-background p-3 text-sm"
                  >
                    <span className="font-medium">{l.title}</span>
                    <div className="flex items-center gap-3">
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                      >
                        Open
                      </a>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-10 sm:size-8"
                        onClick={() => openEditLink(l)}
                        aria-label="Edit link"
                        type="button"
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-10 sm:size-8 text-destructive"
                        onClick={() => askDelete("link", l.id!)}
                        aria-label="Delete link"
                        type="button"
                      >
                        <Trash2 className="size-4 profejoo-accent" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== Right Sheet (shared) ===== */}
      <RightSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={
          mode === "add"
            ? kind === "group"
              ? "Add Skill Group"
              : "Add Link"
            : kind === "group"
            ? "Edit Skill Group"
            : "Edit Link"
        }
      >
        {kind === "group" ? (
          <SkillGroupForm
            mode={mode}
            initial={editingGroup ?? undefined}
            onCancel={() => setSheetOpen(false)}
            onSave={saveGroup}
          />
        ) : (
          <LinkForm
            mode={mode}
            initial={editingLink ?? undefined}
            onCancel={() => setSheetOpen(false)}
            onSave={saveLink}
          />
        )}
      </RightSheet>

      {/* ===== Confirm Delete ===== */}
      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={pending?.kind === "group" ? "Delete this skill group?" : "Delete this link?"}
        message="This action cannot be undone. Do you really want to delete it?"
        onConfirm={doDelete}
      />
    </section>
  );
}

