import type { AchievementDisplay } from "@/features/achievements/achievement-catalog";
import { BadgeCard } from "@/components/base/badge-card";
import { cn } from "@/lib/cn";

interface AchievementSectionProps {
  title: string;
  description: string;
  badges: AchievementDisplay[];
  accent?: "primary" | "flame" | "calendar";
}

const ACCENT_STYLES = {
  primary: "bg-sahara-primary",
  flame: "bg-orange-400",
  calendar: "bg-emerald-500",
} as const;

export function AchievementSection({
  title,
  description,
  badges,
  accent = "primary",
}: AchievementSectionProps) {
  if (badges.length === 0) return null;

  return (
    <section aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-heading`}>
      <div className="mb-4 flex items-end justify-between gap-4 md:mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className={cn("size-2 rounded-full shadow-[0_0_12px_currentColor]", ACCENT_STYLES[accent])} />
            <h2
              id={`${title.toLowerCase().replaceAll(" ", "-")}-heading`}
              className="font-serif text-lg font-semibold tracking-wide text-sahara-text md:text-2xl"
            >
              {title}
            </h2>
          </div>
          <p className="mt-1 text-xs text-sahara-text-muted md:ml-[18px]">{description}</p>
        </div>
        <span className="hidden shrink-0 text-[10px] font-black uppercase tracking-[0.18em] text-sahara-text-muted sm:block">
          {badges.filter((badge) => badge.earned).length}/{badges.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 md:gap-4">
        {badges.map((badge) => (
          <BadgeCard
            key={badge.id}
            title={badge.title}
            description={badge.description}
            earned={badge.earned}
            icon={badge.icon}
          />
        ))}
      </div>
    </section>
  );
}
