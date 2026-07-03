import { Pencil, Trash2, Play } from "lucide-react";
import type { TimeBlockWithMeta } from "@/lib/db";
import { DEFAULT_CATEGORY_COLOR } from "@/lib/constants";

interface CalendarTimeBlockProps {
  block: TimeBlockWithMeta;
  topPx: number;
  heightPx: number;
  onEdit?: (block: TimeBlockWithMeta) => void;
  onDelete?: (block: TimeBlockWithMeta) => void;
  onStartFocus?: (block: TimeBlockWithMeta) => void;
}

function formatRange(startStr: string, endStr: string): string {
  const fmt = (s: string) => {
    const d = new Date(s);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  return `${fmt(startStr)} – ${fmt(endStr)}`;
}

/** Planned time block on the calendar — visually distinct (dashed) from completed sessions. */
export function CalendarTimeBlock({
  block,
  topPx,
  heightPx,
  onEdit,
  onDelete,
  onStartFocus,
}: CalendarTimeBlockProps) {
  const color = block.color || block.category_color || DEFAULT_CATEGORY_COLOR;
  const label = block.title || block.task_name || block.category_name || "Focus block";
  const isShort = heightPx < 56;

  return (
    <div
      className="absolute left-1 right-1 z-20 group"
      style={{ top: topPx, height: Math.max(heightPx, 36) }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="h-full w-full rounded-lg border-2 border-dashed px-2 py-1.5 flex flex-col justify-start overflow-hidden bg-sahara-bg/60 backdrop-blur-sm transition-all hover:shadow-md"
        style={{ borderColor: color }}
      >
        <div className="flex items-start gap-1.5">
          <span
            className="size-2 rounded-full shrink-0 mt-0.5"
            style={{ backgroundColor: color }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-sahara-text leading-tight truncate">
              {label}
            </p>
            {!isShort && (
              <p className="text-[9px] text-sahara-text-muted tabular-nums mt-0.5">
                {formatRange(block.start_time, block.end_time)}
              </p>
            )}
          </div>
        </div>

        {/* Hover actions */}
        <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {onStartFocus && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartFocus(block);
              }}
              className="p-1 rounded bg-sahara-surface/90 shadow-sm text-sahara-primary hover:bg-sahara-surface"
              title="Start focus session"
            >
              <Play className="size-3" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(block);
              }}
              className="p-1 rounded bg-sahara-surface/90 shadow-sm text-sahara-text-muted hover:text-sahara-primary hover:bg-sahara-surface"
              title="Edit"
            >
              <Pencil className="size-3" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(block);
              }}
              className="p-1 rounded bg-sahara-surface/90 shadow-sm text-sahara-text-muted hover:text-red-500 hover:bg-sahara-surface"
              title="Delete"
            >
              <Trash2 className="size-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
