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
        "flex items-center gap-3 mb-6 px-5 py-3.5 rounded-2xl bg-linear-to-r from-sahara-primary/10 via-sahara-primary/5 to-transparent border border-sahara-primary/15 shadow-sm shadow-sahara-primary/5",
      )}
    >
      <div className="w-8 h-8 rounded-full bg-sahara-primary/20 flex items-center justify-center shrink-0">
        <Flame className="w-4 h-4 text-sahara-primary" />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
        <span className="text-xs md:text-sm font-black text-sahara-text-secondary uppercase tracking-widest">
          Top Focus:
        </span>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-sahara-primary text-white text-[11px] md:text-xs font-black tracking-tight shadow-md shadow-sahara-primary/20">
            {topCategory[0]}
          </span>
          <span className="text-[11px] md:text-xs font-bold text-sahara-text-muted tabular-nums">
            {topCategory[1]} Sessions Recorded Today
          </span>
        </div>
      </div>
    </div>
  );
}
