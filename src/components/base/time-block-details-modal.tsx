import { CalendarDays, Clock3, Pencil, Tag, Trash2 } from "lucide-react";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { Button } from "@/components/ui/button";
import type { TimeBlockWithMeta } from "@/lib/db";
import { DEFAULT_CATEGORY_COLOR } from "@/lib/constants";

interface TimeBlockDetailsModalProps {
  block: TimeBlockWithMeta | null;
  open: boolean;
  onClose: () => void;
  onEdit: (block: TimeBlockWithMeta) => void;
  onDelete: (block: TimeBlockWithMeta) => void;
}

function formatDateTime(value: string): { date: string; time: string } {
  const date = new Date(value);
  return {
    date: date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export function TimeBlockDetailsModal({
  block,
  open,
  onClose,
  onEdit,
  onDelete,
}: TimeBlockDetailsModalProps) {
  if (!block) return null;

  const start = formatDateTime(block.start_time);
  const end = formatDateTime(block.end_time);
  const durationMinutes = Math.max(
    0,
    Math.round(
      (new Date(block.end_time).getTime() - new Date(block.start_time).getTime()) /
        60000,
    ),
  );
  const label = block.title || block.task_name || block.category_name || "Focus block";
  const color = block.color || block.category_color || DEFAULT_CATEGORY_COLOR;

  return (
    <ModalOverlay open={open} onClose={onClose} showCloseButton>
      <div className="p-6 sm:p-7">
        <div className="flex items-start gap-3">
          <span
            className="mt-1 h-14 w-1 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sahara-text-muted">
              Focus time
            </p>
            <h2 className="mt-1 truncate font-serif text-2xl text-sahara-text">
              {label}
            </h2>
            <p className="mt-1 text-sm text-sahara-text-secondary">
              {start.date} · {start.time} – {end.time}
            </p>
          </div>
        </div>

        <div className="mt-7 space-y-4 border-t border-sahara-border/20 pt-5">
          <div className="flex items-center gap-3">
            <CalendarDays className="size-4 text-sahara-text-muted" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-sahara-text-muted">
                Date
              </p>
              <p className="text-sm text-sahara-text">{start.date}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock3 className="size-4 text-sahara-text-muted" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-sahara-text-muted">
                Duration
              </p>
              <p className="text-sm text-sahara-text">
                {durationMinutes} minutes · {start.time} – {end.time}
              </p>
            </div>
          </div>

          {block.task_name && (
            <div className="flex items-center gap-3">
              <Tag className="size-4 text-sahara-text-muted" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-sahara-text-muted">
                  Task
                </p>
                <p className="text-sm text-sahara-text">{block.task_name}</p>
              </div>
            </div>
          )}

          {block.category_name && (
            <div className="flex items-center gap-3">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-sahara-text-muted">
                  Category
                </p>
                <p className="text-sm text-sahara-text">{block.category_name}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-7 flex justify-end gap-2 border-t border-sahara-border/20 pt-5">
          <Button
            variant="ghost"
            intent="default"
            size="sm"
            onClick={() => onDelete(block)}
            className="gap-1.5 text-[11px] text-red-500 hover:text-red-600"
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
          <Button
            variant="solid"
            intent="sahara"
            size="sm"
            onClick={() => onEdit(block)}
            className="gap-1.5 text-[11px]"
          >
            <Pencil className="size-3.5" />
            Edit focus time
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
}
