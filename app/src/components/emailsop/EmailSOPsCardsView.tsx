// src/components/emailsop/EmailSOPsCardsView.tsx
import * as React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Trash2, Pencil, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { emailSopEditPath } from "@/constants/routes";

import { formatDate } from "@/lib/utils";
import type { EmailSOPItem } from "./EmailSOPs";

type ViewProps = {
  items: EmailSOPItem[];
  onDuplicate: (item: EmailSOPItem) => void;
  onDownload: (item: EmailSOPItem) => void;
  onDelete: (item: EmailSOPItem) => void;
  onRename?: (item: EmailSOPItem, newTitle: string) => void;
};

type EmailSOPCardProps = {
  item: EmailSOPItem;
  onOpen: () => void;
  onDuplicate: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onRename?: (newTitle: string) => void;
};

function EmailSOPCard({
  item,
  onOpen,
  onDuplicate,
  onDownload,
  onDelete,
  onRename,
}: EmailSOPCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedTitle, setEditedTitle] = React.useState(item.title);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSaveTitle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editedTitle.trim() && onRename) {
      onRename(editedTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedTitle(item.title);
    setIsEditing(false);
  };

  const isEmailType = item.docType === "Email";
  const docTypePillClass = isEmailType
    ? "profejoo-bg-secondary text-[var(--profejoo-secondary-foreground)]"
    : "profejoo-bg-accent text-[var(--profejoo-accent-foreground)]";

  return (
    <Card
      onClick={onOpen}
      className="
        group
        flex h-full flex-col rounded-2xl border bg-card
        shadow-sm cursor-pointer
        transition-shadow
        hover:shadow-md active:shadow-lg
      "
    >
      {/* ---------- Header ---------- */}
      <CardHeader className="pb-3">
        {/* meta chips */}
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs profejoo">
          <Badge
            variant="outline"
            className={`text-[11px] font-medium ${isEmailType ? 'border-[var(--secondary-400)] text-[var(--secondary-600)]' : 'border-[var(--accent-500)] text-[var(--accent-500)]'}`}
          >
            {item.docType}
          </Badge>
          <span className="rounded-full px-2 py-0.5 text-[11px] profejoo-border-primary">
            {item.wordCount || 0} words
          </span>
        </div>

        {/* title - editable */}
        <div className="min-h-12">
          {isEditing ? (
            <div className="flex items-start gap-1" onClick={(e) => e.stopPropagation()}>
              <Input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="h-8 text-base font-semibold"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveTitle(e as any);
                  } else if (e.key === 'Escape') {
                    handleCancelEdit(e as any);
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-green-600"
                onClick={handleSaveTitle}
                title="Save"
              >
                <Check className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-red-600"
                onClick={handleCancelEdit}
                title="Cancel"
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <h2 className="flex items-center gap-2">
              <span
                className="
                  line-clamp-2 flex-1 text-left text-base font-semibold text-foreground
                  transition-colors
                  group-hover:text-primary-400 group-hover:underline
                "
              >
                {item.title}
              </span>
              {onRename && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleStartEdit}
                  title="Rename"
                >
                  <Pencil className="size-3" />
                </Button>
              )}
            </h2>
          )}
        </div>
      </CardHeader>

      {/* ---------- Content ---------- */}
      <CardContent
        className="
          flex flex-1 flex-col justify-between
          gap-3 pb-3
        "
      >
        {/* recipient/institution info */}
        <div className="space-y-0.5 text-xs text-muted-foreground">
          {item.recipient && (
            <p>
              <span className="font-medium text-foreground/80">Recipient:</span>{" "}
              {item.recipient}
            </p>
          )}
          {item.institution && (
            <p>
              <span className="font-medium text-foreground/80">Institution:</span>{" "}
              {item.institution}
            </p>
          )}
          <p>
            <span className="font-medium text-foreground/80">Last change:</span>{" "}
            {formatDate(item.updatedAt)}
          </p>
        </div>
      </CardContent>

      {/* ---------- Footer ---------- */}
      <CardFooter className="flex items-center gap-2 pt-3">
        {/* Edit button */}
        <Button
          type="button"
          className="
            btn btn--tertiary btn--sm
            rounded-full flex items-center gap-2
          "
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          <Pencil className="size-4" />
          <span className="text-xs">Edit</span>
        </Button>

        {/* icon actions */}
        <div className="ml-auto flex items-center gap-1.5 profejoo">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            title="Duplicate"
          >
            <Copy className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            title="Download"
          >
            <Download className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full profejoo-accent"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function EmailSOPsCardsView({
  items,
  onDuplicate,
  onDownload,
  onDelete,
  onRename,
}: ViewProps) {
  const navigate = useNavigate();

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">
        <p>No emails or SOPs found.</p>
        <p className="mt-1 text-xs">
          Try searching or creating a new document.
        </p>
      </div>
    );
  }

  const handleOpen = (id: string) => {
    navigate(emailSopEditPath(id));
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <EmailSOPCard
          key={item.id}
          item={item}
          onOpen={() => handleOpen(item.id)}
          onDuplicate={() => onDuplicate(item)}
          onDownload={() => onDownload(item)}
          onDelete={() => onDelete(item)}
          onRename={onRename ? (newTitle) => onRename(item, newTitle) : undefined}
        />
      ))}
    </div>
  );
}
