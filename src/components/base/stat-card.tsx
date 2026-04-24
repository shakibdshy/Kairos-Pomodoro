import { Clock, Target, TrendingUp, Flame } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: "clock" | "target" | "trending" | "flame";
}

const ICON_MAP = {
  clock: Clock,
  target: Target,
  trending: TrendingUp,
  flame: Flame,
} as const;

export function StatCard({ label, value, icon }: StatCardProps) {
  const Icon = ICON_MAP[icon];
  return (
    <div className="bg-sahara-card/50 border border-sahara-border/20 rounded-xl p-3 md:p-4 flex items-center gap-2.5 md:gap-3">
      <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-sahara-primary-light/60 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 md:w-5 md:h-5 text-sahara-primary" />
      </div>
      <div>
        <p className="text-[9px] md:text-xs font-bold text-sahara-text-muted uppercase tracking-wider">
          {label}
        </p>
        <p className="text-base md:text-lg font-bold text-sahara-text tabular-nums mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}
