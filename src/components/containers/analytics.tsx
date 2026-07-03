import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import {
  getWeeklyData,
  getDailyScore,
  getEarnedBadges,
  getCurrentStreak,
  getBestStreak,
  getAllTimeStats,
  type DayData,
  type BadgeAward,
} from "@/lib/db";
import { StatCard } from "@/components/base/stat-card";
import { WeeklyChart } from "@/components/base/weekly-chart";
import { BadgeCard } from "@/components/base/badge-card";
import { ScoreRing } from "@/components/base/score-ring";
import { AnalyticsCategoryBreakdown } from "@/components/base/analytics-category-breakdown";
import { DateRangePicker } from "@/components/base/date-range-picker";
import { MoodDistribution } from "@/components/base/mood-distribution";
import { SessionNotes } from "@/components/base/session-notes";
import { CompletedTasks } from "@/components/base/completed-tasks";
import { formatTotalTime, formatDuration } from "@/lib/session-utils";
import { type DatePeriod, getDateRange } from "@/lib/date-range";

interface AnalyticsDashboardProps {
  period?: DatePeriod;
  onPeriodChange?: (p: DatePeriod) => void;
}

export function AnalyticsDashboard({ period: externalPeriod, onPeriodChange }: AnalyticsDashboardProps) {
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [score, setScore] = useState(0);
  const [badges, setBadges] = useState<BadgeAward[]>([]);
  const [streaks, setStreaks] = useState({ current: 0, best: 0 });
  const [allTime, setAllTime] = useState({
    total_focus_seconds: 0,
    total_sessions: 0,
    avg_session_seconds: 0,
    longest_session_seconds: 0,
    total_break_seconds: 0,
    avg_break_seconds: 0,
  });
  const loadingRef = useRef(true);
  const [internalPeriod, setInternalPeriod] = useState<DatePeriod>("last7days");

  const period = externalPeriod ?? internalPeriod;
  const setPeriod = onPeriodChange ?? setInternalPeriod;

  const range = getDateRange(period);

  useEffect(() => {
    let cancelled = false;
    loadingRef.current = true;

    Promise.all([
      getWeeklyData(range.startDate, range.endDate).catch(() => []),
      getDailyScore().catch(() => 0),
      getEarnedBadges().catch(() => [] as BadgeAward[]),
      Promise.all([getCurrentStreak(), getBestStreak()])
        .then(([current, best]) => ({ current, best }))
        .catch(() => ({ current: 0, best: 0 })),
      getAllTimeStats().catch(() => allTime),
    ]).then(([wd, sc, bd, st, at]) => {
      if (!cancelled) {
        setWeekData(wd);
        setScore(sc);
        setBadges(bd);
        setStreaks(st);
        setAllTime(at);
        loadingRef.current = false;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [range.startDate, range.endDate]);

  const totalFocusSec = weekData.reduce((s, d) => s + d.total_seconds, 0);
  const totalSessions = weekData.reduce((s, d) => s + d.session_count, 0);
  const avgSessionSec =
    totalSessions > 0 ? Math.round(totalFocusSec / totalSessions) : 0;
  const avgDailySec = weekData.length > 0
    ? Math.round(totalFocusSec / weekData.length)
    : 0;

  if (loadingRef.current && weekData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="size-8 text-sahara-primary animate-spin" />
        <p className="text-xs font-semibold text-sahara-text-muted uppercase tracking-wider">
          Loading analytics…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10">
      {/* Score + Streaks */}
      <section>
        <h2 className="font-serif text-lg font-semibold tracking-wide md:text-2xl text-sahara-text mb-4 md:mb-6">
          Today
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
          <div className="bg-sahara-surface border border-sahara-border/20 rounded-xl md:rounded-2xl p-5 md:p-6 flex flex-col items-center justify-center">
            <ScoreRing score={score} />
            <p className="text-xs text-sahara-text-muted mt-3 text-center">
              Productivity score
            </p>
          </div>
          <div className="bg-sahara-surface border border-sahara-border/20 rounded-xl md:rounded-2xl p-5 md:p-6 flex flex-col justify-center">
            <p className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-widest mb-2">
              Current Streak
            </p>
            <p className="font-serif text-4xl md:text-5xl font-bold text-sahara-text tabular-nums leading-none">
              {streaks.current}
            </p>
            <p className="text-xs text-sahara-text-muted mt-1">
              day{streaks.current === 1 ? "" : "s"} in a row
            </p>
          </div>
          <div className="bg-sahara-surface border border-sahara-border/20 rounded-xl md:rounded-2xl p-5 md:p-6 flex flex-col justify-center">
            <p className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-widest mb-2">
              Best Streak
            </p>
            <p className="font-serif text-4xl md:text-5xl font-bold text-sahara-text tabular-nums leading-none">
              {streaks.best}
            </p>
            <p className="text-xs text-sahara-text-muted mt-1">
              all-time longest run
            </p>
          </div>
        </div>
      </section>

      {/* Overview Stats */}
      <section>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="font-serif text-lg font-semibold tracking-wide md:text-2xl text-sahara-text">
            Overview
          </h2>
          <DateRangePicker value={period} onChange={setPeriod} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard
            label="Total Focus"
            value={formatTotalTime(totalFocusSec)}
            icon="clock"
          />
          <StatCard
            label="Sessions"
            value={String(totalSessions)}
            icon="target"
          />
          <StatCard
            label="Avg Session"
            value={avgSessionSec > 0 ? formatDuration(avgSessionSec) : "0m"}
            icon="trending"
          />
          <StatCard
            label="Daily Avg"
            value={avgDailySec > 0 ? formatTotalTime(avgDailySec) : "0m"}
            icon="flame"
          />
        </div>
      </section>

      {/* All-time stats */}
      <section>
        <h2 className="font-serif text-lg font-semibold tracking-wide md:text-2xl text-sahara-text mb-4 md:mb-6">
          All-Time
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard
            label="Total Focus"
            value={formatTotalTime(allTime.total_focus_seconds)}
            icon="clock"
          />
          <StatCard
            label="Sessions"
            value={String(allTime.total_sessions)}
            icon="target"
          />
          <StatCard
            label="Longest Session"
            value={
              allTime.longest_session_seconds > 0
                ? formatDuration(allTime.longest_session_seconds)
                : "0m"
            }
            icon="trending"
          />
          <StatCard
            label="Total Breaks"
            value={formatTotalTime(allTime.total_break_seconds)}
            icon="flame"
          />
        </div>
      </section>

      {/* Weekly Chart */}
      <section>
        <h2 className="font-serif text-lg font-semibold tracking-wide md:text-2xl text-sahara-text mb-4 md:mb-6">
          {range.label}
        </h2>
        <div className="bg-sahara-surface border border-sahara-border/20 rounded-xl md:rounded-2xl p-3.5 md:p-5">
          <WeeklyChart data={weekData.map(d => ({
            day_name: d.day_name || "",
            focus_seconds: d.total_seconds,
          }))} />
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="font-serif text-lg font-semibold tracking-wide md:text-2xl text-sahara-text mb-4 md:mb-6">
          Achievements
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {badges.length > 0 ? (
            badges.map((b) => (
              <BadgeCard
                key={b.id}
                title={b.title}
                description={b.description}
                earned={b.earned}
              />
            ))
          ) : (
            <>
              <BadgeCard title="Early Bird" description="Complete a focus session before 7 AM" earned={false} />
              <BadgeCard title="Marathon Runner" description="Complete 4+ focus sessions in one day" earned={false} />
              <BadgeCard title="Consistency King" description="Maintain a 7-day streak" earned={false} />
            </>
          )}
        </div>
      </section>

      {/* Category Breakdown & Tasks */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div>
            <h2 className="font-serif text-lg font-semibold tracking-wide md:text-2xl text-sahara-text mb-4 md:mb-6">
              Category Breakdown
            </h2>
            <AnalyticsCategoryBreakdown startDate={range.startDate} endDate={range.endDate} />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold tracking-wide md:text-2xl text-sahara-text mb-4 md:mb-6">
              Tasks
            </h2>
            <CompletedTasks startDate={range.startDate} endDate={range.endDate} />
          </div>
        </div>
      </section>

      {/* Mood Distribution */}
      <section>
        <h2 className="font-serif text-lg font-semibold tracking-wide md:text-2xl text-sahara-text mb-4 md:mb-6">
          Mood Insights
        </h2>
        <MoodDistribution startDate={range.startDate} endDate={range.endDate} />
      </section>

      {/* Session Notes */}
      <section>
        <h2 className="font-serif text-lg font-semibold tracking-wide md:text-2xl text-sahara-text mb-4 md:mb-6">
          Session Notes
        </h2>
        <SessionNotes startDate={range.startDate} endDate={range.endDate} />
      </section>
    </div>
  );
}

