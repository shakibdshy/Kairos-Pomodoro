import { useMemo, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import type { WeekSession } from "@/lib/db";
import { CalendarSessionBlock } from "./calendar-session-block";
import { CalendarDayPill } from "./calendar-day-pill";

interface CalendarGridProps {
  sessions: WeekSession[];
  weekDays: Date[];
  startHour: number;
  endHour: number;
  hourHeight: number;
}

const DAY_LABELS_FULL = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const BASE_HOUR_HEIGHT = 64;

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildSessionsByDay(
  sessions: WeekSession[],
): Map<string, WeekSession[]> {
  const map = new Map<string, WeekSession[]>();
  for (const s of sessions) {
    const key = toDateString(new Date(s.started_at));
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return map;
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
  const sorted = daySessions.toSorted(
    (a, b) =>
      new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
  );

  const positioned: PositionedSession[] = [];

  for (const session of sorted) {
    const startTime = new Date(session.started_at);
    const durationMin = Math.ceil(session.duration_sec / 60);
    const startMin =
      (startTime.getHours() - startHour) * 60 + startTime.getMinutes();

    let topPx = Math.max((startMin / 60) * BASE_HOUR_HEIGHT, 0);

    for (const existing of positioned) {
      const existingEnd = existing.topPx + existing.heightPx;
      if (topPx < existingEnd) {
        topPx = existingEnd + 4;
      }
    }

    const heightPx = Math.max((durationMin / 60) * BASE_HOUR_HEIGHT, 100);

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
      ? Math.max(
          lastInHour.topPx + lastInHour.heightPx - hourTopPx[h],
          BASE_HOUR_HEIGHT,
        )
      : BASE_HOUR_HEIGHT;

    hourTopPx.push(hourTopPx[hourTopPx.length - 1] + expandedHeight);
  }

  const totalContentBottom =
    positioned.length > 0
      ? Math.max(...positioned.map((p) => p.topPx + p.heightPx))
      : 0;

  return {
    positioned,
    hourTopPx,
    totalHeight: Math.max(totalContentBottom, hourTopPx[hourCount]),
  };
}

interface CalendarMobileViewProps {
  weekDays: Date[];
  allDayLayouts: DayLayout[];
  selectedMobileDay: number;
  onSelectMobileDay: (idx: number) => void;
  hours: number[];
  formatHour: (h: number) => string;
  currentTimePos: number | null;
  sessions: WeekSession[];
}

function CalendarMobileView({
  weekDays, allDayLayouts, selectedMobileDay, onSelectMobileDay,
  hours, formatHour, currentTimePos, sessions,
}: CalendarMobileViewProps) {
  const layout = allDayLayouts[selectedMobileDay];
  const dayDate = weekDays[selectedMobileDay];
  const today = isToday(dayDate);

  return (
    <div className="md:hidden flex flex-col">
      <div className="grid grid-cols-7 border-b border-sahara-border/30 px-1">
        {weekDays.map((day, idx) => (
          <CalendarDayPill
            key={day.toDateString()}
            date={day}
            isSelected={idx === selectedMobileDay}
            isToday={isToday(day)}
            onClick={() => onSelectMobileDay(idx)}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto relative pt-8">
        <div className="flex" style={{ minHeight: layout.totalHeight }}>
          <div className="w-12 shrink-0 border-r border-sahara-border/15 bg-sahara-bg/20 relative">
            {hours.map((hour, hIdx) => {
              const maxH = Math.max(
                layout.hourTopPx[hIdx + 1] - layout.hourTopPx[hIdx],
                BASE_HOUR_HEIGHT,
              );
              return (
                <div
                  key={hour}
                  className="pr-2 text-right border-b border-sahara-border/10"
                  style={{ height: maxH }}
                >
                  <span className="text-[10px] font-medium text-sahara-text-muted tabular-nums leading-none inline-block mt-2">
                    {formatHour(hour)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className={cn("flex-1 relative", today && "bg-sahara-primary-light/10")} style={{ minHeight: layout.totalHeight }}>
            {hours.map((_, hIdx) => (
              <div
                key={hIdx}
                className="border-b border-sahara-border/8"
                style={{ height: layout.hourTopPx[hIdx + 1] - layout.hourTopPx[hIdx] }}
              />
            ))}

            {layout.positioned.map(({ session, topPx, heightPx }) => (
              <CalendarSessionBlock key={session.id} session={session} topPx={topPx} heightPx={heightPx} />
            ))}

            {currentTimePos !== null && today && (
              <div className="absolute left-0 right-0 z-30 pointer-events-none flex items-center" style={{ top: currentTimePos }}>
                <div className="size-1.5 rounded-full bg-sahara-primary -ml-1 shadow-sm" />
                <div className="flex-1 border-t border-sahara-primary/50" />
              </div>
            )}
          </div>
        </div>

        {sessions.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center opacity-30">
              <p className="text-xs font-semibold text-sahara-text-muted uppercase tracking-wider">No sessions this day</p>
              <p className="text-[11px] text-sahara-text-muted mt-1">Completed sessions will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CalendarDesktopViewProps {
  weekDays: Date[];
  allDayLayouts: DayLayout[];
  hours: number[];
  formatHour: (h: number) => string;
  currentTimePos: number | null;
  todayIdx: number;
  desktopGridTotalHeight: number;
  sessions: WeekSession[];
}

function CalendarDesktopView({
  weekDays, allDayLayouts, hours, formatHour,
  currentTimePos, todayIdx, desktopGridTotalHeight, sessions,
}: CalendarDesktopViewProps) {
  return (
    <div className="hidden md:flex flex-col flex-1 min-h-0">
      <div className="grid border-b border-sahara-border/30" style={{ gridTemplateColumns: `64px repeat(${weekDays.length}, 1fr)` }}>
        <div className="p-4 border-r border-sahara-border/20" />
        {weekDays.map((day) => {
          const dayIdx = day.getDay() === 0 ? 6 : day.getDay() - 1;
          const today = isToday(day);
          return (
            <div key={day.toDateString()} className={cn("px-2 pt-3 pb-2 text-center border-r last:border-r-0 border-sahara-border/20 relative", today && "bg-sahara-primary-light/20")}>
              <span className={cn("text-[10px] font-medium tracking-[0.15em] block mb-0.5", today ? "text-sahara-primary" : "text-sahara-text-muted")}>{DAY_LABELS_FULL[dayIdx]}</span>
              <p className={cn("font-serif text-2xl leading-none", today ? "text-sahara-primary font-bold" : "text-sahara-text")}>{day.getDate()}</p>
              {today && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-sahara-primary rounded-full" />}
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto relative">
        <div className="grid" style={{ gridTemplateColumns: `64px repeat(${weekDays.length}, 1fr)`, minHeight: desktopGridTotalHeight }}>
          <div className="border-r border-sahara-border/20 bg-sahara-bg/30 relative shrink-0 w-16">
            {hours.map((hour, hIdx) => {
              const maxH = Math.max(...allDayLayouts.map((l) => l.hourTopPx[hIdx + 1] - l.hourTopPx[hIdx]), BASE_HOUR_HEIGHT);
              return (
                <div key={hour} className="pr-3 text-right border-b border-sahara-border/15" style={{ height: maxH }}>
                  <span className="text-[11px] font-medium text-sahara-text-muted tabular-nums leading-none inline-block mt-2">{formatHour(hour)}</span>
                </div>
              );
            })}
          </div>

          {weekDays.map((day, idx) => {
            const layout = allDayLayouts[idx];
            const today = isToday(day);
            return (
              <div key={day.toDateString()} className={cn("relative border-r last:border-r-0 border-sahara-border/15", today && "bg-sahara-primary-light/30")} style={{ minHeight: layout.totalHeight }}>
                {hours.map((_, hIdx) => (
                  <div key={hIdx} className="border-b border-sahara-border/10" style={{ height: layout.hourTopPx[hIdx + 1] - layout.hourTopPx[hIdx] }} />
                ))}
                {layout.positioned.map(({ session, topPx, heightPx }) => (
                  <CalendarSessionBlock key={session.id} session={session} topPx={topPx} heightPx={heightPx} />
                ))}
                {currentTimePos !== null && idx === todayIdx && (
                  <div className="absolute left-0 right-0 z-30 pointer-events-none flex items-center" style={{ top: currentTimePos }}>
                    <div className="size-1.5 rounded-full bg-sahara-primary -ml-1 shadow-sm" />
                    <div className="flex-1 border-t border-sahara-primary/40" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {sessions.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center opacity-30">
              <p className="text-xs font-semibold text-sahara-text-muted uppercase tracking-wider">No sessions this week</p>
              <p className="text-[11px] text-sahara-text-muted mt-1">Completed sessions will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
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

  const nowRef = useRef(new Date());
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      nowRef.current = new Date();
      setTick((t) => t + 1);
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const sessionsByDay = useMemo(() => buildSessionsByDay(sessions), [sessions]);

  const todayIdx = weekDays.findIndex(isToday);

  const [selectedMobileDay, setSelectedMobileDay] = useState(
    todayIdx >= 0 ? todayIdx : 0,
  );

  useEffect(() => {
    if (todayIdx >= 0) setSelectedMobileDay(todayIdx);
  }, [todayIdx]);

  const allDayLayouts = useMemo(
    () =>
      weekDays.map((day) =>
        computeDayLayout(
          sessionsByDay.get(toDateString(day)) ?? [],
          startHour,
          endHour,
        ),
      ),
    [sessionsByDay, weekDays, startHour, endHour],
  );

  function getCurrentTimePosition(): number | null {
    const currentMinutes = nowRef.current.getHours() * 60 + nowRef.current.getMinutes();
    const startMinutes = startHour * 60;
    if (currentMinutes < startMinutes || currentMinutes > (endHour + 1) * 60)
      return null;

    const offsetMin = currentMinutes - startMinutes;
    return (offsetMin / 60) * BASE_HOUR_HEIGHT;
  }

  const currentTimePos = getCurrentTimePosition();

  const desktopGridTotalHeight = Math.max(
    ...allDayLayouts.map((l) => l.totalHeight),
  );

  return (
    <div className="bg-sahara-surface rounded-2xl overflow-hidden shadow-sm border border-sahara-border/40 flex flex-col">
      <CalendarMobileView
        weekDays={weekDays}
        allDayLayouts={allDayLayouts}
        selectedMobileDay={selectedMobileDay}
        onSelectMobileDay={setSelectedMobileDay}
        hours={hours}
        formatHour={formatHour}
        currentTimePos={currentTimePos}
        sessions={sessions}
      />
      <CalendarDesktopView
        weekDays={weekDays}
        allDayLayouts={allDayLayouts}
        hours={hours}
        formatHour={formatHour}
        currentTimePos={currentTimePos}
        todayIdx={todayIdx}
        desktopGridTotalHeight={desktopGridTotalHeight}
        sessions={sessions}
      />
    </div>
  );
}
