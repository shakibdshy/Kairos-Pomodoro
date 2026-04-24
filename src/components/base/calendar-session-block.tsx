import { Clock, CheckCircle2, Circle, Tag } from "lucide-react";
import { cn } from "@/lib/cn";
import type { WeekSession } from "@/lib/db";
import { formatTimeAmPm } from "@/lib/time";

interface CalendarSessionBlockProps {
  session: WeekSession;
  topPx: number;
  heightPx: number;
}

function getTimeRange(session: WeekSession): string {
  const start = new Date(session.started_at);
  const end = new Date(start.getTime() + session.duration_sec * 1000);
  return `${formatTimeAmPm(start)} – ${formatTimeAmPm(end)}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function CalendarSessionBlock({
  session,
  topPx,
  heightPx,
}: CalendarSessionBlockProps) {
  const isWork = session.phase === "work";
  const isBreak = session.phase === "break";

  const title = session.task_name || session.intention || "";
  const showDescription =
    !isWork && session.intention && session.intention !== title;
  const timeRange = getTimeRange(session);

  const catColor = session.category_color || undefined;

  const bgColor = isWork && catColor ? catColor : undefined;
  const borderColor = isWork && catColor ? hexToRgba(catColor, 0.6) : undefined;

  return (
    <div
      className={cn(
        "absolute left-1 right-1 md:left-1.5 md:right-1.5 rounded-lg md:rounded-xl px-2.5 py-1.5 md:px-3 md:py-2.5 shadow-sm border cursor-pointer z-10 overflow-hidden group transition-shadow hover:shadow-md flex flex-col",
        isWork
          ? "text-white"
          : "bg-sahara-card text-sahara-text border-sahara-border",
      )}
      style={{
        top: topPx,
        height: heightPx,
        ...(bgColor && { backgroundColor: bgColor }),
        ...(borderColor && { borderColor }),
      }}
    >
      {/* Type Label */}
      <div
        className={cn(
          "font-bold text-[12px] md:text-sm leading-tight mb-0.5",
          isWork ? "text-white" : "text-sahara-text",
        )}
      >
        {isWork ? "Work" : "Break"}
      </div>

      {/* Title / Task Name */}
      {title && (
        <div className="flex items-start justify-between gap-1 md:gap-1 mb-0.5">
          <span
            className={cn(
              "font-semibold text-[11px] md:text-[13px] leading-tight line-clamp-2",
              isWork ? "text-white" : "text-sahara-text",
            )}
          >
            {title}
          </span>
          {isWork && (
            <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 shrink-0 mt-0.5 text-white/80" />
          )}
        </div>
      )}

      {isBreak && (
        <Circle className="w-3 h-3 md:w-3.5 md:h-3.5 mt-auto mb-0.5 md:mb-1 text-sahara-text-muted" />
      )}

      {showDescription && (
        <p
          className={cn(
            "text-[10px] md:text-[11px] leading-snug line-clamp-2 mb-0.5 md:mb-1",
            isWork ? "text-white/80" : "text-sahara-text-muted",
          )}
        >
          {session.intention}
        </p>
      )}

      {isWork && session.category_name && (
        <div className="mb-0.5 md:mb-1.5">
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-md text-[9px] md:text-[10px] font-semibold uppercase tracking-wide",
              catColor ? "text-white" : "bg-white/20 text-white",
            )}
            style={
              catColor
                ? {
                    backgroundColor: hexToRgba(catColor, 0.25),
                    color: "#fff",
                  }
                : undefined
            }
          >
            {session.category_name}
          </span>
        </div>
      )}

      {/* Time Range */}
      <div className="flex items-center gap-1 md:gap-1.5 mt-auto pt-0.5 md:pt-1">
        {isBreak ? (
          <Tag className="w-2.5 h-2.5 md:w-3 md:h-3 text-sahara-text-muted" />
        ) : (
          <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 text-white/70" />
        )}
        <span
          className={cn(
            "text-[9px] md:text-[10px] font-medium tabular-nums tracking-wide",
            isWork ? "text-white/80" : "text-sahara-text-muted",
          )}
        >
          {timeRange}
        </span>
      </div>
    </div>
  );
}
