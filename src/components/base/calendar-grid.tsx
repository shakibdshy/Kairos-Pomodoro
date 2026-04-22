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

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const BASE_HOUR_HEIGHT = 64;

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

interface PositionedSession {
  session: WeekSession;
  topPx: number;
  heightPx: number;
}

interface DayLayout {
  positioned: PositionedSession[];
  hourTopPx: number[];
  totalHeight: number;
}

function computeDayLayout(
  daySessions: WeekSession[],
  startHour: number,
  endHour: number,
): DayLayout {
  const sorted = [...daySessions].sort(
    (a, b) =>
      new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
  );

  const positioned: PositionedSession[] = [];

  for (const session of sorted) {
    const startTime = new Date(session.started_at);
    const durationMin = Math.ceil(session.duration_sec / 60);
    const startMin =
      (startTime.getHours() - startHour) * 60 + startTime.getMinutes();

    let topPx = (startMin / 60) * BASE_HOUR_HEIGHT;

    for (const existing of positioned) {
      const existingEnd = existing.topPx + existing.heightPx;
      if (topPx < existingEnd) {
        topPx = existingEnd + 4;
      }
    }

    const heightPx = Math.max((durationMin / 60) * BASE_HOUR_HEIGHT, 52);

    positioned.push({ session, topPx, heightPx });
  }

  const hourCount = endHour - startHour + 1;
  const hourTopPx: number[] = [0];

  for (let h = 0; h < hourCount; h++) {
    const hourStartMin = h * 60;
    const hourEndMin = (h + 1) * 60;

    const lastInHour = positioned
      .filter((p) => {
        const s = p.session;
        const sStart = new Date(s.started_at);
        const sStartMin =
          (sStart.getHours() - startHour) * 60 + sStart.getMinutes();
        return sStartMin >= hourStartMin && sStartMin < hourEndMin;
      })
      .pop();

    const expandedHeight = lastInHour
      ? Math.max(lastInHour.topPx + lastInHour.heightPx - hourTopPx[h], BASE_HOUR_HEIGHT)
      : BASE_HOUR_HEIGHT;

    hourTopPx.push(hourTopPx[hourTopPx.length - 1] + expandedHeight);
  }

  const totalContentBottom = positioned.length > 0
    ? Math.max(...positioned.map((p) => p.topPx + p.heightPx))
    : 0;

  return {
    positioned,
    hourTopPx,
    totalHeight: Math.max(totalContentBottom, hourTopPx[hourCount]),
  };
}

export function CalendarGrid({
  sessions,
  weekDays,
  startHour,
  endHour,
}: CalendarGridProps) {
  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i,
  );

  function formatHour(h: number): string {
    return `${String(h).padStart(2, "0")}:00`;
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

    const todayIdx = weekDays.findIndex(isToday);
    if (todayIdx < 0) return null;

    const offsetMin = currentMinutes - startMinutes;
    return (offsetMin / 60) * BASE_HOUR_HEIGHT;
  }

  const dayLayouts = weekDays.map((day) =>
    computeDayLayout(getDaySessions(sessions, toDateString(day)), startHour, endHour),
  );

  const gridTotalHeight = Math.max(...dayLayouts.map((l) => l.totalHeight));

  const currentTimePos = getCurrentTimePosition();
  const currentDayIndex = weekDays.findIndex(isToday);

  return (
    <div className="bg-sahara-surface rounded-2xl overflow-hidden shadow-sm border border-sahara-border/40 flex flex-col">
      {/* Day Headers */}
      <div
        className="grid border-b border-sahara-border/30"
        style={{
          gridTemplateColumns: `64px repeat(${weekDays.length}, 1fr)`,
        }}
      >
        <div className="p-4 border-r border-sahara-border/20" />
        {weekDays.map((day, idx) => {
          const dayIdx =
            day.getDay() === 0 ? 6 : day.getDay() - 1;
          const today = isToday(day);

          return (
            <div
              key={idx}
              className={cn(
                "px-2 pt-3 pb-2 text-center border-r last:border-r-0 border-sahara-border/20 relative",
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-medium tracking-[0.15em] block mb-0.5",
                  today ? "text-sahara-primary" : "text-sahara-text-muted",
                )}
              >
                {DAY_LABELS[dayIdx]}
              </span>
              <p
                className={cn(
                  "font-serif text-2xl leading-none",
                  today
                    ? "text-sahara-primary font-bold"
                    : "text-sahara-text",
                )}
              >
                {day.getDate()}
              </p>
              {today && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-sahara-primary rounded-full" />
              )}
            </div>
          );
        })}
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-y-auto relative">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `64px repeat(${weekDays.length}, 1fr)`,
            minHeight: gridTotalHeight,
          }}
        >
          {/* Time labels column */}
          <div className="border-r border-sahara-border/20 bg-sahara-bg/30 relative">
            {hours.map((hour, hIdx) => {
              const maxH = Math.max(
                ...dayLayouts.map((l) => l.hourTopPx[hIdx + 1] - l.hourTopPx[hIdx]),
                BASE_HOUR_HEIGHT,
              );

              return (
                <div
                  key={hour}
                  className="pr-3 text-right border-b border-sahara-border/15"
                  style={{ height: maxH }}
                >
                  <span className="text-[11px] font-medium text-sahara-text-muted tabular-nums leading-none inline-block mt-2">
                    {formatHour(hour)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Day columns */}
          {weekDays.map((day, idx) => {
            const layout = dayLayouts[idx];
            const today = isToday(day);

            return (
              <div
                key={idx}
                className={cn(
                  "relative border-r last:border-r-0 border-sahara-border/15",
                  today && "bg-sahara-primary-light/30",
                )}
                style={{ minHeight: layout.totalHeight }}
              >
                {/* Hour row backgrounds */}
                {hours.map((_, hIdx) => {
                  const h =
                    layout.hourTopPx[hIdx + 1] - layout.hourTopPx[hIdx];
                  return (
                    <div
                      key={hIdx}
                      className="border-b border-sahara-border/10"
                      style={{ height: h }}
                    />
                  );
                })}

                {/* Session blocks — full width, vertically stacked */}
                {layout.positioned.map(({ session, topPx, heightPx }) => (
                  <CalendarSessionBlock
                    key={session.id}
                    session={session}
                    topPx={topPx}
                    heightPx={heightPx}
                  />
                ))}

                {/* Current time line */}
                {currentTimePos !== null && idx === currentDayIndex && (
                  <div
                    className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                    style={{ top: currentTimePos }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-sahara-primary -ml-1 shadow-sm" />
                    <div className="flex-1 border-t border-sahara-primary/40" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state overlay */}
        {sessions.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center opacity-30">
              <p className="text-xs font-semibold text-sahara-text-muted uppercase tracking-wider">
                No sessions this week
              </p>
              <p className="text-[11px] text-sahara-text-muted mt-1">
                Completed sessions will appear here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
