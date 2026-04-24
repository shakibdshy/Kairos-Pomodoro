import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  getWeeklyData,
  type DayData,
} from "@/lib/db";
import { StatCard } from "@/components/base/stat-card";
import { WeeklyChart } from "@/components/base/weekly-chart";
import { BadgeCard } from "@/components/base/badge-card";
import { AnalyticsCategoryBreakdown } from "@/components/base/analytics-category-breakdown";

export function AnalyticsDashboard() {
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      getWeeklyData().catch(() => []),
    ]).then(([wd]) => {
      if (!cancelled) {
        setWeekData(wd);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalFocusSec = weekData.reduce((s, d) => s + d.total_seconds, 0);
  const totalSessions = weekData.reduce((s, d) => s + d.session_count, 0);
  const avgSessionSec =
    totalSessions > 0 ? Math.round(totalFocusSec / totalSessions) : 0;
  const avgDailySec = weekData.length > 0
    ? Math.round(totalFocusSec / weekData.length)
    : 0;

  if (loading && weekData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 text-sahara-primary animate-spin" />
        <p className="text-xs font-semibold text-sahara-text-muted uppercase tracking-wider">
          Loading analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10">
      {/* Overview Stats */}
      <section>
        <h2 className="font-serif text-lg md:text-xl text-sahara-text mb-4 md:mb-6">
          Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard
            label="Total Focus"
            value={formatHours(totalFocusSec)}
            icon="clock"
          />
          <StatCard
            label="Sessions"
            value={String(totalSessions)}
            icon="target"
          />
          <StatCard
            label="Avg Session"
            value={avgSessionSec > 0 ? formatMinutes(avgSessionSec) : "0m"}
            icon="trending"
          />
          <StatCard
            label="Daily Avg"
            value={avgDailySec > 0 ? formatMinutes(avgDailySec) : "0m"}
            icon="flame"
          />
        </div>
      </section>

      {/* Weekly Chart */}
      <section>
        <h2 className="font-serif text-lg md:text-xl text-sahara-text mb-4 md:mb-6">
          This Week
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
        <h2 className="font-serif text-lg md:text-xl text-sahara-text mb-4 md:mb-6">
          Achievements
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <BadgeCard
            title="Early Bird"
            description="Complete a focus session before 7 AM"
            earned={false}
          />
          <BadgeCard
            title="Marathon Runner"
            description="Complete 4+ focus sessions in one day"
            earned={false}
          />
          <BadgeCard
            title="Consistency King"
            description="Maintain a 7-day streak"
            earned={false}
          />
        </div>
      </section>

      {/* Category Breakdown */}
      <section>
        <h2 className="font-serif text-lg md:text-xl text-sahara-text mb-4 md:mb-6">
          Category Breakdown
        </h2>
        <AnalyticsCategoryBreakdown />
      </section>
    </div>
  );
}

function formatHours(sec: number): string {
  if (!sec) return "0h";
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatMinutes(sec: number): string {
  if (!sec) return "0m";
  const m = Math.round(sec / 60);
  return `${m}m`;
}
