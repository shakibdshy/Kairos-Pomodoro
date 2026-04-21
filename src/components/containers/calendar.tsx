import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2 } from "lucide-react";
import {
  getWeekSessions,
  getWeekSummary,
  type WeekSession,
  type WeekSummary,
} from "@/lib/db";
import { CalendarWeekNav } from "@/components/base/calendar-week-nav";
import { CalendarGrid } from "@/components/base/calendar-grid";
import { CalendarWeekStats } from "@/components/base/calendar-week-stats";

const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_HEIGHT = 64;

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

export function CalendarDashboard() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [sessions, setSessions] = useState<WeekSession[]>([]);
  const [summary, setSummary] = useState<WeekSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef<string | null>(null);

  const monday = getMonday(new Date(Date.now() + weekOffset * 7 * 86400000));
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const weekDays = getWeekDates(monday);
  const weekKey = `${toISODate(monday)}_${toISODate(sunday)}`;

  useEffect(() => {
    if (loadedRef.current === weekKey) return;
    loadedRef.current = weekKey;

    let cancelled = false;
    setLoading(true);

    const startStr = toISODate(monday);
    const endStr = toISODate(sunday);

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 5000),
    );

    Promise.race([
      Promise.all([
        getWeekSessions(startStr, endStr).catch(() => []),
        getWeekSummary(startStr, endStr).catch(() => EMPTY_SUMMARY),
      ]),
      timeout,
    ])
      .then(([sessData, summaryData]) => {
        if (!cancelled) {
          setSessions(sessData);
          setSummary(summaryData);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSessions([]);
          setSummary(EMPTY_SUMMARY);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [weekKey]);

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

  if (loading && sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="w-8 h-8 text-sahara-primary animate-spin" />
        <p className="text-xs font-bold text-sahara-text-muted uppercase tracking-wider">
          Loading calendar...
        </p>
      </div>
    );
  }

  return (
    <div className="px-10 py-8 max-w-7xl mx-auto h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-[0.2em] mb-1">
            Time Distribution
          </p>
          <h1 className="font-serif text-3xl text-sahara-text">
            Your Weekly Timeline
          </h1>
        </div>
        <CalendarWeekNav
          weekStart={monday}
          weekEnd={sunday}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
        />
      </div>

      {/* Week Stats */}
      <CalendarWeekStats summary={summary} />

      {/* Calendar Grid */}
      <div className="flex-1 min-h-0">
        <CalendarGrid
          sessions={sessions}
          weekDays={weekDays}
          startHour={START_HOUR}
          endHour={END_HOUR}
          hourHeight={HOUR_HEIGHT}
        />
      </div>
    </div>
  );
}
