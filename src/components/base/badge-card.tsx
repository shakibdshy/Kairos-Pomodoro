import { cn } from "@/lib/cn";
import type { AchievementIcon } from "@/features/achievements/achievement-catalog";
import { ACHIEVEMENT_ICONS } from "@/features/achievements/achievement-icons";

interface BadgeCardProps {
  title: string;
  description: string;
  earned: boolean;
  icon?: AchievementIcon;
}

export function BadgeCard({ title, description, earned, icon = "award" }: BadgeCardProps) {
  const Icon = ACHIEVEMENT_ICONS[icon];
  return (
    <div
      className={cn(
        "flex items-center gap-3 md:gap-4 p-3.5 md:p-5 rounded-xl border transition-all",
        earned
          ? "bg-sahara-primary-light/20 border-sahara-primary/30"
          : "bg-sahara-card/50 border-sahara-border/20 opacity-60",
      )}
    >
      <div
        className={cn(
          "size-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0",
          earned
            ? "bg-sahara-primary text-sahara-on-primary shadow-md shadow-sahara-primary/30"
            : "bg-sahara-card text-sahara-text-muted",
        )}
      >
        <Icon className="size-5 md:w-6 md:h-6" />
      </div>
      <div>
        <h4
          className={cn(
            "font-serif text-sm md:text-base font-semibold",
            earned ? "text-sahara-primary" : "text-sahara-text-muted",
          )}
        >
          {title}
        </h4>
        <p className="text-[10px] md:text-xs text-sahara-text-muted mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
