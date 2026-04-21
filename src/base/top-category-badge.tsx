import { Flame } from "lucide-react";
import type { Session } from "@/lib/session-utils";
import { cn } from "@/lib/cn";

interface TopCategoryBadgeProps {
  sessions: Session[];
}

export function TopCategoryBadge({ sessions }: TopCategoryBadgeProps) {
  const categoryCounts = sessions.reduce(
    (acc: Record<string, number>, s: Session) => {
      if (s.intention) {
        acc[s.intention] = (acc[s.intention] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const topCategory = Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1],
  )[0];

  if (!topCategory) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 mb-4 px-4 py-2.5 rounded-xl bg-linear-to-r from-sahara-primary/5 to-transparent border border-sahara-primary/10",
      )}
    >
      <Flame className="w-4 h-4 text-sahara-primary" />
      <span className="text-xs font-bold text-sahara-text-secondary">
        Most focused on:
      </span>
      <span className="px-2 py-0.5 rounded-full bg-sahara-primary text-white text-[10px] font-bold tracking-wide">
        {topCategory[0]}
      </span>
      <span className="text-xs text-sahara-text-muted">
        ({topCategory[1]} sessions)
      </span>
    </div>
  );
}
