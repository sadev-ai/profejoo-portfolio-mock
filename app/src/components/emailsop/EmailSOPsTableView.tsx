// src/components/emailsop/EmailSOPsTableView.tsx
import { Button } from "@/components/ui/button";
import { Copy, Download, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { emailSopEditPath } from "@/constants/routes";

import type { EmailSOPItem } from "./EmailSOPs";

type Props = {
  items: EmailSOPItem[];
  onDuplicate: (item: EmailSOPItem) => void;
  onDownload: (item: EmailSOPItem) => void;
  onDelete: (item: EmailSOPItem) => void;
};

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default function EmailSOPsTableView({
  items,
  onDuplicate,
  onDownload,
  onDelete,
}: Props) {
  const navigate = useNavigate();

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/40 py-10 text-center text-sm text-muted-foreground">
        <p>No emails or SOPs found.</p>
        <p className="mt-1 text-xs">
          Try searching or creating a new document.
        </p>
      </div>
    );
  }

  const handleOpen = (item: EmailSOPItem) => {
    navigate(emailSopEditPath(item.id));
  };

  return (
    <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/60 text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Title</th>
            <th className="px-3 py-2 font-medium">Type</th>
            <th className="px-3 py-2 font-medium">Recipient/Institution</th>
            <th className="px-3 py-2 font-medium">Last change</th>
            <th className="px-3 py-2 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isEmailType = item.docType === "Email";
            const docTypePillClass = isEmailType
              ? "profejoo-bg-secondary text-[var(--profejoo-secondary-foreground)]"
              : "profejoo-bg-accent text-[var(--profejoo-accent-foreground)]";
            return (
              <tr
                key={item.id}
                onClick={() => handleOpen(item)}
                className="
                  group
                  cursor-pointer border-t text-xs
                  transition-colors hover:bg-muted/40
                  sm:text-sm
                  [&>td]:px-3 [&>td]:py-2
                "
              >
              <td className="max-w-xs">
                <div className="flex flex-col">
                  <span
                    className="
                      line-clamp-1 text-left font-medium text-foreground
                      transition-colors
                      group-hover:text-primary-400 group-hover:underline
                    "
                  >
                    {item.title}
                  </span>
                  <span className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                    {item.docType} • {item.wordCount || 0} words
                  </span>
                </div>
              </td>

              <td>
                <span
                  className={`rounded-full px-3 py-0.5 text-[11px] font-medium ${docTypePillClass}`}
                >
                  {item.docType}
                </span>
              </td>
              
              <td className="max-w-[200px]">
                <div className="line-clamp-1 text-xs">
                  {item.recipient && <div>{item.recipient}</div>}
                  {item.institution && <div className="text-muted-foreground">{item.institution}</div>}
                  {!item.recipient && !item.institution && "—"}
                </div>
              </td>

              <td className="whitespace-nowrap text-xs text-muted-foreground">
                {formatDate(item.updatedAt)}
              </td>

              <td className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(item);
                    }}
                    aria-label="Duplicate"
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
                      onDownload(item);
                    }}
                    aria-label="Download"
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
                      onDelete(item);
                    }}
                    aria-label="Delete"
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
