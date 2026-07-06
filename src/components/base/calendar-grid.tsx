import { useMemo, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import type { WeekSession, TimeBlockWithMeta } from "@/lib/db";
import { CalendarSessionBlock } from "./calendar-session-block";
import { CalendarTimeBlock } from "./calendar-time-block";
import { CalendarDayPill } from "./calendar-day-pill";

interface CalendarGridProps {
  sessions: WeekSession[];
  timeBlocks: TimeBlockWithMeta[];
  weekDays: Date[];
  startHour: number;
  endHour: number;
  /** Called when the user clicks an empty slot to create a block. */
  onCreateBlock?: (date: Date, hour: number) => void;
  /** Called when the user clicks edit on a block. */
  onEditBlock?: (block: TimeBlockWithMeta) => void;
  /** Called when the user clicks delete on a block. */
  onDeleteBlock?: (block: TimeBlockWithMeta) => void;
  /** Called when the user clicks "start focus" on a block. */
  onStartFocusFromBlock?: (block: TimeBlockWithMeta) => void;
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

function resolveHourFromY(y: number, layout: DayLayout, hours: number[]): number {
  for (let i = 0; i < hours.length; i++) {
    if (y >= layout.hourTopPx[i] && y < layout.hourTopPx[i + 1]) {
      return hours[i];
    }
  }
  return hours[hours.length - 1] ?? 0;
}

function buildSessionsByDay(
  sessions: WeekSession[],
  /** Session ids that are already shown as logged time blocks — skip them so
   * the same focus time isn't rendered twice on the calendar. */
  hiddenSessionIds: Set<number>,
): Map<string, WeekSession[]> {
  const map = new Map<string, WeekSession[]>();
  for (const s of sessions) {
    if (hiddenSessionIds.has(s.id)) continue;
    const key = toDateString(new Date(s.started_at));
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return map;
}

function buildBlocksByDay(
  blocks: TimeBlockWithMeta[],
): Map<string, TimeBlockWithMeta[]> {
  const map = new Map<string, TimeBlockWithMeta[]>();
  for (const b of blocks) {
    const key = toDateString(new Date(b.start_time));
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(b);
  }
  return map;
}

interface PositionedSession {
  session: WeekSession;
  topPx: number;
  heightPx: number;
}

interface PositionedBlock {
  block: TimeBlockWithMeta;
  topPx: number;
  heightPx: number;
}

interface DayLayout {
  positioned: PositionedSession[];
  positionedBlocks: PositionedBlock[];
  hourTopPx: number[];
  totalHeight: number;
}

export function computeDayLayout(
  daySessions: WeekSession[],
  dayBlocks: TimeBlockWithMeta[],
  startHour: number,
  endHour: number,
): DayLayout {
  const sorted = daySessions.toSorted(
    (a, b) =>
      new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
  );

  // Every card sits on a single uniform `BASE_HOUR_HEIGHT` scale shared with
  // the time axis, gridlines, and "now" line. Cards are positioned purely from
  // their start time — never shifted to dodge overlaps and never allowed to
  // inflate their hour row — so a card's pixel position always matches the
  // time its label shows. (Previously sessions expanded their hour row and
  // overlapping cards were nudged down, which detached position from time.)
  const positioned: PositionedSession[] = sorted.map((session) => {
    const startTime = new Date(session.started_at);
    const durationMin = Math.ceil(session.duration_sec / 60);
    const startMin =
      (startTime.getHours() - startHour) * 60 + startTime.getMinutes();
    const topPx = Math.max((startMin / 60) * BASE_HOUR_HEIGHT, 0);
    const heightPx = Math.max((durationMin / 60) * BASE_HOUR_HEIGHT, 36);
    return { session, topPx, heightPx };
  });

  // Planned blocks use the same scale and are never overlap-shifted either.
  const positionedBlocks: PositionedBlock[] = dayBlocks
    .toSorted(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    )
    .map((block) => {
      const startTime = new Date(block.start_time);
      const endTime = new Date(block.end_time);
      const durationMin = Math.max(
        1,
        Math.round((endTime.getTime() - startTime.getTime()) / 60000),
      );
      const startMin =
        (startTime.getHours() - startHour) * 60 + startTime.getMinutes();
      const topPx = Math.max((startMin / 60) * BASE_HOUR_HEIGHT, 0);
      const heightPx = Math.max((durationMin / 60) * BASE_HOUR_HEIGHT, 36);
      return { block, topPx, heightPx };
    });

  // Uniform hour rows: hour h starts at h * BASE_HOUR_HEIGHT, never expanded
  // by content. This is what keeps the shared time axis honest across columns.
  const hourCount = endHour - startHour + 1;
  const hourTopPx = Array.from(
    { length: hourCount + 1 },
    (_, h) => h * BASE_HOUR_HEIGHT,
  );

  const totalContentBottom = Math.max(
    0,
    ...positioned.map((p) => p.topPx + p.heightPx),
    ...positionedBlocks.map((p) => p.topPx + p.heightPx),
  );

  return {
    positioned,
    positionedBlocks,
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
  onCreateBlock?: (date: Date, hour: number) => void;
  onEditBlock?: (block: TimeBlockWithMeta) => void;
  onDeleteBlock?: (block: TimeBlockWithMeta) => void;
  onStartFocusFromBlock?: (block: TimeBlockWithMeta) => void;
}

function CalendarMobileView({
  weekDays, allDayLayouts, selectedMobileDay, onSelectMobileDay,
  hours, formatHour, currentTimePos, sessions,
  onCreateBlock, onEditBlock, onDeleteBlock, onStartFocusFromBlock,
}: CalendarMobileViewProps) {
  const layout = allDayLayouts[selectedMobileDay];
  const dayDate = weekDays[selectedMobileDay];
  const today = isToday(dayDate);
  const hasBlocks = layout.positionedBlocks.length > 0;

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
              const rowH = layout.hourTopPx[hIdx + 1] - layout.hourTopPx[hIdx];
              return (
                <div
                  key={hour}
                  className="pr-2 text-right border-b border-sahara-border/10"
                  style={{ height: rowH }}
                >
                  <span className="text-[10px] font-medium text-sahara-text-muted tabular-nums leading-none inline-block mt-2">
                    {formatHour(hour)}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            className={cn("flex-1 relative", today && "bg-sahara-primary-light/10")}
            style={{ minHeight: layout.totalHeight }}
            onClick={(e) => {
              if (!onCreateBlock) return;
              const target = e.currentTarget.getBoundingClientRect();
              const y = e.clientY - target.top;
              const hour = resolveHourFromY(y, layout, hours);
              onCreateBlock(dayDate, hour);
            }}
          >
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

            {layout.positionedBlocks.map(({ block, topPx, heightPx }) => (
              <CalendarTimeBlock
                key={`b-${block.id}`}
                block={block}
                topPx={topPx}
                heightPx={heightPx}
                onEdit={onEditBlock}
                onDelete={onDeleteBlock}
                onStartFocus={onStartFocusFromBlock}
              />
            ))}

            {currentTimePos !== null && today && (
              <div className="absolute left-0 right-0 z-30 pointer-events-none flex items-center" style={{ top: currentTimePos }}>
                <div className="size-1.5 rounded-full bg-sahara-primary -ml-1 shadow-sm" />
                <div className="flex-1 border-t border-sahara-primary/50" />
              </div>
            )}
          </div>
        </div>

        {sessions.length === 0 && !hasBlocks && (
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
  onCreateBlock?: (date: Date, hour: number) => void;
  onEditBlock?: (block: TimeBlockWithMeta) => void;
  onDeleteBlock?: (block: TimeBlockWithMeta) => void;
  onStartFocusFromBlock?: (block: TimeBlockWithMeta) => void;
}

function CalendarDesktopView({
  weekDays, allDayLayouts, hours, formatHour,
  currentTimePos, todayIdx, desktopGridTotalHeight, sessions,
  onCreateBlock, onEditBlock, onDeleteBlock, onStartFocusFromBlock,
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
              // Rows are uniform across all columns (see computeDayLayout), so
              // the shared axis reads one column's height — no per-column max.
              const rowH = allDayLayouts[0].hourTopPx[hIdx + 1] - allDayLayouts[0].hourTopPx[hIdx];
              return (
                <div key={hour} className="pr-3 text-right border-b border-sahara-border/15" style={{ height: rowH }}>
                  <span className="text-[11px] font-medium text-sahara-text-muted tabular-nums leading-none inline-block mt-2">{formatHour(hour)}</span>
                </div>
              );
            })}
          </div>

          {weekDays.map((day, idx) => {
            const layout = allDayLayouts[idx];
            const today = isToday(day);
            return (
              <div
                key={day.toDateString()}
                className={cn(
                  "relative border-r last:border-r-0 border-sahara-border/15 cursor-pointer",
                  today && "bg-sahara-primary-light/30",
                )}
                style={{ minHeight: layout.totalHeight }}
                onClick={(e) => {
                  if (!onCreateBlock) return;
                  const target = e.currentTarget.getBoundingClientRect();
                  const y = e.clientY - target.top;
                  const hour = resolveHourFromY(y, layout, hours);
                  onCreateBlock(day, hour);
                }}
              >
                {hours.map((_, hIdx) => (
                  <div key={hIdx} className="border-b border-sahara-border/10" style={{ height: layout.hourTopPx[hIdx + 1] - layout.hourTopPx[hIdx] }} />
                ))}
                {layout.positioned.map(({ session, topPx, heightPx }) => (
                  <CalendarSessionBlock key={session.id} session={session} topPx={topPx} heightPx={heightPx} />
                ))}
                {layout.positionedBlocks.map(({ block, topPx, heightPx }) => (
                  <CalendarTimeBlock
                    key={`b-${block.id}`}
                    block={block}
                    topPx={topPx}
                    heightPx={heightPx}
                    onEdit={onEditBlock}
                    onDelete={onDeleteBlock}
                    onStartFocus={onStartFocusFromBlock}
                  />
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
  timeBlocks,
  weekDays,
  startHour,
  endHour,
  onCreateBlock,
  onEditBlock,
  onDeleteBlock,
  onStartFocusFromBlock,
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

  // Session ids logged from a time block — those rows are rendered (and
  // counted in stats) via the time block card, so skip them as plain sessions.
  const loggedSessionIds = useMemo(
    () =>
      new Set(
        timeBlocks
          .map((b) => b.session_id)
          .filter((id): id is number => id != null),
      ),
    [timeBlocks],
  );

  const sessionsByDay = useMemo(
    () => buildSessionsByDay(sessions, loggedSessionIds),
    [sessions, loggedSessionIds],
  );
  const blocksByDay = useMemo(() => buildBlocksByDay(timeBlocks), [timeBlocks]);

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
          blocksByDay.get(toDateString(day)) ?? [],
          startHour,
          endHour,
        ),
      ),
    [sessionsByDay, blocksByDay, weekDays, startHour, endHour],
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
        onCreateBlock={onCreateBlock}
        onEditBlock={onEditBlock}
        onDeleteBlock={onDeleteBlock}
        onStartFocusFromBlock={onStartFocusFromBlock}
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
        onCreateBlock={onCreateBlock}
        onEditBlock={onEditBlock}
        onDeleteBlock={onDeleteBlock}
        onStartFocusFromBlock={onStartFocusFromBlock}
      />
    </div>
  );
}
