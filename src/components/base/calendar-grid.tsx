import { cn } from "@/lib/cn";
import type { WeekSession } from "@/lib/db";
import { CalendarSessionBlock } from "./calendar-session-block";

interface CalendarGridProps {
  sessions: WeekSession[];
  weekDays: Date[];
  startHour: number;
  endHour: number;
  hourHeight: number;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function getDaySessions(
  sessions: WeekSession[],
  dateStr: string,
): WeekSession[] {
  return sessions.filter((s) => {
    const d = new Date(s.started_at);
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return ds === dateStr;
  });
}

export function CalendarGrid({
  sessions,
  weekDays,
  startHour,
  endHour,
  hourHeight,
}: CalendarGridProps) {
  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i,
  );
  const totalHeight = hours.length * hourHeight;

  function formatHour(h: number): string {
    if (h === 12) return "12 PM";
    if (h > 12) return `${h - 12} PM`;
    return h === 0 ? "12 AM" : `${h} AM`;
  }

  function toDateString(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  const now = new Date();

  function getCurrentTimePosition(): number | null {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60;
    if (currentMinutes < startMinutes || currentMinutes > (endHour + 1) * 60)
      return null;
    return ((currentMinutes - startMinutes) / 60) * hourHeight;
  }

  const currentTimePos = getCurrentTimePosition();
  const currentDayIndex = weekDays.findIndex(isToday);

  return (
    <div className="bg-sahara-surface border border-sahara-border/20 rounded-2xl overflow-hidden shadow-sm flex flex-col">
      {/* Day Headers */}
      <div className="grid border-b border-sahara-border/10" style={{ gridTemplateColumns: `56px repeat(${weekDays.length}, 1fr)` }}>
        <div className="p-3 border-r border-sahara-border/10" />
        {weekDays.map((day, idx) => (
          <div
            key={idx}
            className={cn(
              "p-3 text-center border-r last:border-r-0 border-sahara-border/10",
              isToday(day) && "bg-sahara-primary-light/30",
            )}
          >
            <span className="text-[9px] font-bold text-sahara-text-muted uppercase tracking-[0.15em] block">
              {DAY_LABELS[day.getDay() === 0 ? 6 : day.getDay() - 1]}
            </span>
            <p
              className={cn(
                "font-serif text-lg mt-0.5",
                isToday(day)
                  ? "text-sahara-primary font-bold"
                  : "text-sahara-text",
              )}
            >
              {day.getDate()}
            </p>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div
        className="flex-1 overflow-y-auto relative"
        style={{ minHeight: Math.min(totalHeight, 520), maxHeight: 560 }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `56px repeat(${weekDays.length}, 1fr)`,
            minHeight: totalHeight,
          }}
        >
          {/* Time labels column */}
          <div className="border-r border-sahara-border/10 bg-sahara-bg/20 relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-b border-sahara-border/5 pr-2 text-right"
                style={{ height: hourHeight }}
              >
                <span className="text-[9px] font-bold text-sahara-text-muted tabular-nums leading-none inline-block mt-1">
                  {formatHour(hour)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, idx) => {
            const daySessions = getDaySessions(sessions, toDateString(day));
            const dayTotalSec = daySessions.reduce(
              (sum, s) => sum + s.duration_sec,
              0,
            );

            return (
              <div
                key={idx}
                className={cn(
                  "relative border-r last:border-r-0 border-sahara-border/10",
                  isToday(day) && "bg-sahara-primary/2",
                )}
              >
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-sahara-border/5"
                    style={{ height: hourHeight }}
                  />
                ))}

                {/* Session blocks */}
                {daySessions.map((session) => (
                  <CalendarSessionBlock
                    key={session.id}
                    session={session}
                    hourHeight={hourHeight}
                    startHour={startHour}
                  />
                ))}

                {/* Day total badge (bottom-right of column) */}
                {dayTotalSec > 0 && (
                  <div className="absolute bottom-1 right-1 z-20">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-sahara-surface/90 backdrop-blur-sm border border-sahara-border/15 text-sahara-text-secondary tabular-nums shadow-xs">
                      {dayTotalSec >= 3600
                        ? `${Math.round(dayTotalSec / 3600)}h`
                        : `${Math.round(dayTotalSec / 60)}m`}
                    </span>
                  </div>
                )}

                {/* Current time line */}
                {currentTimePos !== null && idx === currentDayIndex && (
                  <div
                    className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                    style={{ top: currentTimePos }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-sahara-primary -ml-[3.5px] shadow-sm" />
                    <div className="flex-1 border-t border-sahara-primary/60" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state overlay */}
        {sessions.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center opacity-40">
              <p className="text-xs font-bold text-sahara-text-muted uppercase tracking-wider">
                No sessions this week
              </p>
              <p className="text-[10px] text-sahara-text-muted mt-1">
                Completed sessions will appear here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
