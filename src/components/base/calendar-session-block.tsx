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

const CARD_STYLES = {
  work: {
    bg: "bg-sahara-primary",
    text: "text-white",
    subtext: "text-white/80",
    badgeBg: "bg-white/20",
    badgeText: "text-white",
    border: "border-[#A85A40]",
    typeLabel: "Work",
  },
  break: {
    bg: "bg-sahara-card",
    text: "text-sahara-text",
    subtext: "text-sahara-text-muted",
    badgeBg: "bg-sahara-border/50",
    badgeText: "text-sahara-text-secondary",
    border: "border-sahara-border",
    typeLabel: "Break",
  },
};

export function CalendarSessionBlock({
  session,
  topPx,
  heightPx,
}: CalendarSessionBlockProps) {
  const isWork = session.phase === "work";
  const isBreak = session.phase === "break";
  const styleKey = isWork ? "work" : "break";
  const style = CARD_STYLES[styleKey];

  const title = session.task_name || session.intention || "";
  const showDescription =
    !isWork && session.intention && session.intention !== title;
  const timeRange = getTimeRange(session);

  return (
    <div
      className={cn(
        "absolute left-1.5 right-1.5 rounded-xl px-3 py-2.5 shadow-sm border cursor-pointer z-10 overflow-hidden group transition-shadow hover:shadow-md flex flex-col",
        style.bg,
        style.border,
      )}
      style={{
        top: topPx,
        height: heightPx,
      }}
    >
      {/* Type Label */}
      <div
        className={cn("font-bold text-[14px] leading-tight mb-0.5", style.text)}
      >
        {style.typeLabel}
      </div>

      {/* Title / Task Name */}
      {title && (
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <span
            className={cn(
              "font-semibold text-[13px] leading-tight line-clamp-2",
              style.text,
            )}
          >
            {title}
          </span>
          {isWork && (
            <CheckCircle2
              className={cn("w-4 h-4 shrink-0 mt-0.5", style.subtext)}
            />
          )}
        </div>
      )}

      {!isWork && (
        <Circle className={cn("w-3.5 h-3.5 mt-auto mb-1", style.subtext)} />
      )}

      {showDescription && (
        <p
          className={cn(
            "text-[11px] leading-snug line-clamp-2 mb-1",
            style.subtext,
          )}
        >
          {session.intention}
        </p>
      )}

      {isWork && session.category_name && (
        <div className="mb-1.5">
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide",
              style.badgeBg,
              style.badgeText,
            )}
          >
            {session.category_name}
          </span>
        </div>
      )}

      {/* Time Range */}
      <div className="flex items-center gap-1.5 mt-auto pt-1">
        {isBreak ? (
          <Tag className={cn("w-3 h-3", style.subtext)} />
        ) : (
          <Clock className={cn("w-3 h-3", style.subtext)} />
        )}
        <span
          className={cn(
            "text-[10px] font-medium tabular-nums tracking-wide",
            style.subtext,
          )}
        >
          {timeRange}
        </span>
      </div>
    </div>
  );
}
