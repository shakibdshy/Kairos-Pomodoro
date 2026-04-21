import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Flame,
  CheckCircle2,
  Timer,
  TrendingUp,
  Coffee,
} from "lucide-react";
import {
  getWeeklyData,
  getAllTimeStats,
  getCurrentStreak,
  getBestStreak,
  getAllCategoryBreakdown,
} from "@/lib/db";
import type { DayData, CategoryBreakdown } from "@/lib/db";
import { formatTotalTime, formatDuration } from "@/lib/session-utils";
import { StatCard } from "@/components/base/stat-card";
import { WeeklyChart } from "@/components/base/weekly-chart";
import { BadgeCard, computeBadges } from "@/components/base/badge-card";
import { AnalyticsCategoryBreakdown } from "@/components/base/analytics-category-breakdown";

const EMPTY_STATS = {
  total_focus_seconds: 0,
  total_sessions: 0,
  avg_session_seconds: 0,
  longest_session_seconds: 0,
  total_break_seconds: 0,
  avg_break_seconds: 0,
};

export interface AnalyticsData {
  weeklyData: DayData[];
  stats: typeof EMPTY_STATS;
  currentStreak: number;
  bestStreak: number;
  categoryBreakdown: CategoryBreakdown[];
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [weeklyData, stats, currentStreak, bestStreak, categoryBreakdown] =
        await Promise.all([
          getWeeklyData().catch(() => []),
          getAllTimeStats().catch(() => ({ ...EMPTY_STATS })),
          getCurrentStreak().catch(() => 0),
          getBestStreak().catch(() => 0),
          getAllCategoryBreakdown().catch(() => []),
        ]);
      setData({
        weeklyData: weeklyData ?? [],
        stats: stats ?? { ...EMPTY_STATS },
        currentStreak: currentStreak ?? 0,
        bestStreak: bestStreak ?? 0,
        categoryBreakdown: categoryBreakdown ?? [],
      });
    } catch (error) {
      console.error("Failed to load analytics data:", error);
      setData({
        weeklyData: [],
        stats: { ...EMPTY_STATS },
        currentStreak: 0,
        bestStreak: 0,
        categoryBreakdown: [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border rounded-3xl p-8 h-48" />
          ))}
        </div>
        <div className="bg-white border rounded-3xl p-8 h-96" />
      </div>
    );
  }

  if (!data) return null;

  const { weeklyData, stats, currentStreak, bestStreak, categoryBreakdown } =
    data;

  const focusHours = Math.floor(stats.total_focus_seconds / 3600);
  const focusMins = Math.round((stats.total_focus_seconds % 3600) / 60);
  const weekTotalSec = weeklyData.reduce((s, d) => s + d.total_seconds, 0);
  const prevWeekChange =
    weekTotalSec > 0 ? "+" + formatTotalTime(weekTotalSec) : undefined;

  const badges = computeBadges(
    stats.total_focus_seconds,
    stats.total_sessions,
    currentStreak,
    bestStreak,
    stats.avg_session_seconds,
    stats.longest_session_seconds,
    stats.total_break_seconds,
    stats.avg_break_seconds,
  );

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Left Column — Stats + Chart */}
      <div className="col-span-8 space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <StatCard
            icon={Clock}
            label="Total Focus Time"
            value={`${focusHours}`}
            unit="h"
            subValue={focusMins > 0 ? `${focusMins}` : undefined}
            subUnit={focusMins > 0 ? "m" : undefined}
            change={prevWeekChange}
          />
          <StatCard
            icon={Flame}
            label="Current Streak"
            value={`${currentStreak}`}
            unit="Days"
            change={`Personal Best: ${bestStreak}`}
          />
        </div>

        <WeeklyChart data={weeklyData} />

        <AnalyticsCategoryBreakdown
          breakdowns={categoryBreakdown}
          title="All-Time Category Breakdown"
        />
      </div>

      {/* Right Column — Sessions + Badges */}
      <div className="col-span-4 space-y-8">
        <StatCard
          icon={CheckCircle2}
          label="Sessions Completed"
          value={`${stats.total_sessions}`}
          variant="compact"
        />

        <div className="bg-white border border-sahara-border/20 rounded-3xl p-8 shadow-sm shadow-sahara-primary/5 space-y-6">
          <h3 className="font-serif text-2xl text-sahara-text">Achievements</h3>
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>

        <div className="bg-white border border-sahara-border/20 rounded-3xl p-8 shadow-sm shadow-sahara-primary/5 space-y-4">
          <h3 className="font-serif text-xl text-sahara-text mb-4">
            Quick Stats
          </h3>
          <div className="flex items-center gap-3">
            <Timer className="w-5 h-5 text-blue-500 shrink-0" />
            <span className="text-xs font-bold text-sahara-text-muted uppercase tracking-wider">
              Avg Focus
            </span>
            <span className="text-sm font-bold text-sahara-text ml-auto tabular-nums">
              {formatDuration(Math.round(stats.avg_session_seconds))}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-green-500 shrink-0" />
            <span className="text-xs font-bold text-sahara-text-muted uppercase tracking-wider">
              Longest Session
            </span>
            <span className="text-sm font-bold text-sahara-text ml-auto tabular-nums">
              {formatDuration(stats.longest_session_seconds)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-orange-500 shrink-0" />
            <span className="text-xs font-bold text-sahara-text-muted uppercase tracking-wider">
              Total Break
            </span>
            <span className="text-sm font-bold text-sahara-text ml-auto tabular-nums">
              {formatTotalTime(stats.total_break_seconds)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Coffee className="w-5 h-5 text-purple-500 shrink-0" />
            <span className="text-xs font-bold text-sahara-text-muted uppercase tracking-wider">
              Avg Break
            </span>
            <span className="text-sm font-bold text-sahara-text ml-auto tabular-nums">
              {formatDuration(Math.round(stats.avg_break_seconds))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
