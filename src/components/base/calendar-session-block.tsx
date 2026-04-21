import { Clock, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import type { WeekSession } from "@/lib/db";

interface CalendarSessionBlockProps {
  session: WeekSession;
  hourHeight: number;
  startHour: number;
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function CalendarSessionBlock({
  session,
  hourHeight,
  startHour,
}: CalendarSessionBlockProps) {
  const startTime = new Date(session.started_at);
  const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
  const startOffsetMinutes = startMinutes - startHour * 60;
  const durationMin = session.duration_sec / 60;

  const topPx = (startOffsetMinutes / 60) * hourHeight;
  const heightPx = Math.max((durationMin / 60) * hourHeight, 24);

  const isWork = session.phase === "work";
  const color = session.category_color || "#C17767";

  return (
    <div
      className={cn(
        "absolute left-1 right-1 rounded-lg px-2.5 py-1.5 shadow-sm border transition-all cursor-pointer z-10 overflow-hidden group",
        isWork
          ? "border-black/5 hover:shadow-md hover:scale-[1.01]"
          : "border-sahara-border/20 bg-sahara-card/80 hover:shadow-md hover:scale-[1.01]",
      )}
      style={{
        top: topPx,
        height: heightPx,
        backgroundColor: isWork ? `${color}15` : undefined,
      }}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <Clock className="w-2.5 h-2.5 opacity-50 shrink-0" />
        <span className="text-[8px] font-bold uppercase tracking-wider opacity-70 tabular-nums">
          {formatDuration(session.duration_sec)}
        </span>
        {isWork && (
          <Zap className="w-2.5 h-2.5 ml-auto opacity-40 shrink-0" />
        )}
      </div>
      <div
        className={cn(
          "text-[10px] font-bold leading-snug line-clamp-2",
          isWork ? "" : "text-sahara-text-secondary",
        )}
        style={{ color: isWork ? color : undefined }}
      >
        {session.task_name ||
          session.intention ||
          (isWork ? "Focus Session" : "Break")}
      </div>
      {session.category_name && (
        <div className="mt-1 flex items-center gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span
            className="text-[8px] font-medium truncate opacity-70"
            style={{ color }}
          >
            {session.category_name}
          </span>
        </div>
      )}
    </div>
  );
}
