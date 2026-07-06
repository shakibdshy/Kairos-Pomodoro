import { useState, useEffect, useCallback, useRef, useReducer } from "react";
import { Loader2, Plus } from "lucide-react";
import {
  getWeekSessions,
  getWeekSummary,
  getWeekTimeBlocks,
  deleteTimeBlock,
  addTimeBlock,
  updateTimeBlock,
  addLoggedSession,
  updateLoggedSession,
  deleteSession,
  type WeekSession,
  type WeekSummary,
  type TimeBlockWithMeta,
  type TimeBlockInput,
} from "@/lib/db";
import { CalendarWeekNav } from "@/components/base/calendar-week-nav";
import { CalendarGrid } from "@/components/base/calendar-grid";
import { CalendarWeekStats } from "@/components/base/calendar-week-stats";
import { TimeBlockForm } from "@/components/base/time-block-form";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { useNavigate } from "react-router-dom";

const START_HOUR = 6;
const END_HOUR = 22;

const EMPTY_SUMMARY: WeekSummary = {
  total_seconds: 0,
  total_sessions: 0,
  work_sessions: 0,
  break_sessions: 0,
  avg_daily_seconds: 0,
  peak_day: null,
  peak_day_seconds: 0,
};

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface CalendarData {
  sessions: WeekSession[];
  summary: WeekSummary;
  timeBlocks: TimeBlockWithMeta[];
}

const CALENDAR_INIT: CalendarData = {
  sessions: [],
  summary: EMPTY_SUMMARY,
  timeBlocks: [],
};

type CalendarAction =
  | { type: "LOADED"; sessions: WeekSession[]; summary: WeekSummary; timeBlocks: TimeBlockWithMeta[] }
  | { type: "ERROR" };

function calendarReducer(_state: CalendarData, action: CalendarAction): CalendarData {
  switch (action.type) {
    case "LOADED":
      return { sessions: action.sessions, summary: action.summary, timeBlocks: action.timeBlocks };
    case "ERROR":
      return { sessions: [], summary: EMPTY_SUMMARY, timeBlocks: [] };
  }
}

export function CalendarDashboard() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [data, dispatch] = useReducer(calendarReducer, CALENDAR_INIT);
  const loadingRef = useRef(true);
  const loadedRef = useRef<string | null>(null);
  // Bump to force the data-load effect to re-run (after a block CRUD op).
  const [reloadNonce, setReloadNonce] = useState(0);

  const monday = getMonday(new Date(Date.now() + weekOffset * 7 * 86400000));
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const weekDays = getWeekDates(monday);
  const weekKey = `${toISODate(monday)}_${toISODate(sunday)}`;

  useEffect(() => {
    if (loadedRef.current === weekKey) return;
    loadedRef.current = weekKey;

    let cancelled = false;
    loadingRef.current = true;

    const startStr = toISODate(monday);
    const endStr = toISODate(sunday);

    let timeoutId: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("timeout")), 5000);
    });

    Promise.race([
      Promise.all([
        getWeekSessions(startStr, endStr).catch(() => [] as WeekSession[]),
        getWeekSummary(startStr, endStr).catch(() => EMPTY_SUMMARY),
        getWeekTimeBlocks(startStr, endStr).catch(() => [] as TimeBlockWithMeta[]),
      ]),
      timeout,
    ])
      .then(([sessData, summaryData, blockData]) => {
        if (!cancelled) dispatch({ type: "LOADED", sessions: sessData, summary: summaryData, timeBlocks: blockData });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "ERROR" });
      })
      .finally(() => {
        if (!cancelled) { loadingRef.current = false; }
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [weekKey, reloadNonce]);

  const handlePrev = useCallback(() => {
    loadedRef.current = null;
    setWeekOffset((o) => o - 1);
  }, []);
  const handleNext = useCallback(() => {
    loadedRef.current = null;
    setWeekOffset((o) => o + 1);
  }, []);
  const handleToday = useCallback(() => {
    loadedRef.current = null;
    setWeekOffset(0);
  }, []);

  // --- Time-blocking state & handlers ---
  const navigate = useNavigate();
  const setActiveTask = useTimerStore((s) => s.setActiveTask);
  const setSelectedCategory = useTimerStore((s) => s.setSelectedCategory);
  const setCustomIntention = useTimerStore((s) => s.setCustomIntention);

  const [formOpen, setFormOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlockWithMeta | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | null>(null);
  const [defaultHour, setDefaultHour] = useState<number | undefined>(undefined);

  const reload = useCallback(() => {
    loadedRef.current = null;
    setReloadNonce((n) => n + 1);
  }, []);

  const openCreate = useCallback((date: Date, hour: number) => {
    setEditingBlock(null);
    setDefaultDate(date);
    setDefaultHour(hour);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((block: TimeBlockWithMeta) => {
    setEditingBlock(block);
    setDefaultDate(null);
    setDefaultHour(undefined);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (block: TimeBlockWithMeta) => {
      await deleteTimeBlock(block.id);
      // Drop the linked session so stats (Total Focus, sessions, streaks)
      // stay consistent with the calendar.
      if (block.session_id) {
        await deleteSession(block.session_id);
      }
      reload();
    },
    [reload],
  );

  const handleSubmit = useCallback(
    async (input: TimeBlockInput) => {
      // A logged focus time IS a counted session: it contributes to Total
      // Focus, New Session, streaks — just like a completed countdown timer.
      const startDate = new Date(input.start_time);
      const endDate = new Date(input.end_time);
      const durationSec = Math.max(
        0,
        Math.round((endDate.getTime() - startDate.getTime()) / 1000),
      );
      const sessionPayload = {
        taskId: input.task_id ?? null,
        phase: "work",
        startedAt: input.start_time,
        endedAt: input.end_time,
        durationSec,
        categoryId: input.category_id ?? null,
        intention: input.title,
      };

      if (editingBlock) {
        await updateTimeBlock(editingBlock.id, input);
        if (editingBlock.session_id) {
          await updateLoggedSession(editingBlock.session_id, sessionPayload);
        } else {
          // Block predates the session link — create one now and attach it.
          const sid = await addLoggedSession(sessionPayload);
          await updateTimeBlock(editingBlock.id, { session_id: sid });
        }
      } else {
        const sessionId = await addLoggedSession(sessionPayload);
        await addTimeBlock({ ...input, session_id: sessionId });
      }
      reload();
    },
    [editingBlock, reload],
  );

  const handleStartFocusFromBlock = useCallback(
    async (block: TimeBlockWithMeta) => {
      // Configure the timer with the block's task/category/intention, then
      // navigate to the Timer page so the user hits Start.
      if (block.task_id) {
        await setActiveTask(block.task_id);
      }
      if (block.category_id) {
        // setSelectedCategory expects a Category object; we have id/name/color on the block.
        setSelectedCategory({
          id: block.category_id,
          name: block.category_name ?? "",
          color: block.category_color ?? "#c2652a",
          created_at: "",
        });
      }
      setCustomIntention(block.title ?? null);
      navigate("/");
    },
    [setActiveTask, setSelectedCategory, setCustomIntention, navigate],
  );

  if (loadingRef.current && data.sessions.length === 0 && data.timeBlocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="size-8 text-sahara-primary animate-spin" />
        <p className="text-xs font-semibold text-sahara-text-muted uppercase tracking-wider">
          Loading calendar…
        </p>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-6 md:px-10 py-6 md:py-8 max-w-7xl mx-auto h-full flex flex-col gap-5 md:gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-[9px] md:text-[10px] font-bold text-sahara-text-muted uppercase tracking-[0.15em] md:tracking-[0.2em] mb-1">
            Time Distribution
          </p>
          <h1 className="font-serif text-xl md:text-3xl text-sahara-text">
            Your Weekly Timeline
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="solid"
            intent="sahara"
            size="sm"
            shape="rounded-full"
            onClick={() => openCreate(new Date(), 9)}
            className="gap-1.5 text-[10px] sm:text-xs font-bold tracking-widest uppercase"
          >
            <Plus className="size-3.5" />
            Add Time
          </Button>
          <CalendarWeekNav
            weekStart={monday}
            weekEnd={sunday}
            onPrev={handlePrev}
            onNext={handleNext}
            onToday={handleToday}
          />
        </div>
      </div>

      {/* Week Stats */}
      <CalendarWeekStats summary={data.summary} />

      {/* Calendar Grid */}
      <div className="flex-1 min-h-0 overflow-auto">
        <CalendarGrid
          sessions={data.sessions}
          timeBlocks={data.timeBlocks}
          weekDays={weekDays}
          startHour={START_HOUR}
          endHour={END_HOUR}
          onCreateBlock={openCreate}
          onEditBlock={openEdit}
          onDeleteBlock={handleDelete}
          onStartFocusFromBlock={handleStartFocusFromBlock}
        />
      </div>

      {/* Time block form (create / edit) */}
      <TimeBlockForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        block={editingBlock}
        defaultDate={defaultDate}
        defaultHour={defaultHour}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
