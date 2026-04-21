import {
  Award,
  Lock,
  Trophy,
  Zap,
  Flame,
  Star,
  Target,
  Clock,
  Coffee,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface BadgeDefinition {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  locked: boolean;
  progress?: number;
  progressMax?: number;
}

interface BadgeCardProps {
  badge: BadgeDefinition;
}

export function BadgeCard({ badge }: BadgeCardProps) {
  const BadgeIcon = badge.icon;

  return (
    <div className="flex items-center gap-4 group">
      <div
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105",
          badge.locked
            ? "bg-sahara-card text-sahara-border"
            : "bg-linear-to-br from-sahara-primary-light to-orange-100 text-sahara-primary",
        )}
      >
        <BadgeIcon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h4
          className={cn(
            "font-serif text-lg leading-tight",
            badge.locked ? "text-sahara-text-muted" : "text-sahara-text",
          )}
        >
          {badge.label}
        </h4>
        <p className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-widest mt-0.5">
          {badge.description}
        </p>
        {badge.progress !== undefined &&
          badge.progressMax !== undefined &&
          !badge.locked && (
            <div className="mt-2 w-full h-1 bg-sahara-bg/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-sahara-primary transition-all duration-500"
                style={{
                  width: `${Math.min(100, (badge.progress / badge.progressMax) * 100)}%`,
                }}
              />
            </div>
          )}
      </div>
      {badge.locked && <Lock className="w-4 h-4 text-sahara-border shrink-0" />}
    </div>
  );
}

export function computeBadges(
  totalFocusSeconds: number,
  totalSessions: number,
  currentStreak: number,
  bestStreak: number,
  avgSessionSeconds: number,
  longestSessionSeconds: number,
  totalBreakSeconds: number,
  avgBreakSeconds: number,
): BadgeDefinition[] {
  const focusHours = totalFocusSeconds / 3600;

  return [
    {
      id: "first_session",
      label: "First Steps",
      description: "Complete your first session",
      icon: Star,
      locked: totalSessions === 0,
    },
    {
      id: "deep_diver",
      label: "Deep Diver",
      description: `${Math.round(longestSessionSeconds / 60)}m longest session`,
      icon: Target,
      locked: longestSessionSeconds < 2400,
      progress: longestSessionSeconds,
      progressMax: 2400,
    },
    {
      id: "steady_pace",
      label: "Steady Pace",
      description: `${formatDurationShort(avgSessionSeconds)} avg focus`,
      icon: Clock,
      locked: avgSessionSeconds < 1800,
      progress: Math.round(avgSessionSeconds),
      progressMax: 1800,
    },
    {
      id: "iron_will",
      label: "Iron Will",
      description: `${currentStreak} day streak`,
      icon: Flame,
      locked: currentStreak < 7,
      progress: currentStreak,
      progressMax: 7,
    },
    {
      id: "streak_master",
      label: "Streak Master",
      description: `Best: ${bestStreak} days`,
      icon: Zap,
      locked: bestStreak < 14,
      progress: bestStreak,
      progressMax: 14,
    },
    {
      id: "well_restored",
      label: "Well Restored",
      description: `${formatDurationShort(avgBreakSeconds)} avg break`,
      icon: Coffee,
      locked: avgBreakSeconds < 300 || totalSessions < 3,
      progress: Math.round(avgBreakSeconds),
      progressMax: 600,
    },
    {
      id: "balance_keeper",
      label: "Balance Keeper",
      description: `${formatDurationShort(totalBreakSeconds)} total rest`,
      icon: Award,
      locked: totalBreakSeconds < 3600 || totalSessions < 5,
      progress: Math.round(totalBreakSeconds / 60),
      progressMax: 120,
    },
    {
      id: "zen_master",
      label: "Zen Master",
      description: `${Math.round(focusHours)}h total focus time`,
      icon: Trophy,
      locked: focusHours < 100,
      progress: Math.round(focusHours),
      progressMax: 100,
    },
    {
      id: "consistent",
      label: "Consistent",
      description: `${totalSessions} sessions completed`,
      icon: Award,
      locked: totalSessions < 50,
      progress: totalSessions,
      progressMax: 50,
    },
  ];
}

function formatDurationShort(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hours}h ${remainMins}m` : `${hours}h`;
}
