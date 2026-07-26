import { useEffect } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { Award, CalendarDays, Flame, Sun, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAchievementStore } from "@/features/achievements/use-achievement-store";
import type { AchievementIcon } from "@/features/achievements/achievement-catalog";

const ICONS: Record<AchievementIcon, typeof Award> = {
  award: Award,
  calendar: CalendarDays,
  flame: Flame,
  sun: Sun,
  trophy: Trophy,
};

export function AchievementAnnouncementHost() {
  const current = useAchievementStore((state) => state.queue[0]);
  const loaded = useAchievementStore((state) => state.loaded);
  const loadPending = useAchievementStore((state) => state.loadPending);
  const dismissCurrent = useAchievementStore((state) => state.dismissCurrent);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!loaded) void loadPending();
  }, [loaded, loadPending]);

  return (
    <AnimatePresence mode="wait">
      {current && (
        <m.div
          key={current.id}
          className="fixed inset-0 z-[110] flex items-center justify-center p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="achievement-title"
          aria-describedby="achievement-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.22 }}
        >
          <button
            className="absolute inset-0 cursor-default bg-sahara-text/30 backdrop-blur-md"
            aria-label="Close achievement announcement"
            onClick={() => void dismissCurrent()}
          />

          <m.div
            className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-sahara-primary/35 bg-sahara-surface px-7 py-8 text-center shadow-[0_24px_100px_rgba(0,0,0,0.35)]"
            initial={reducedMotion ? undefined : { opacity: 0, scale: 0.82, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, scale: 0.9, y: 8 }}
            transition={{ type: "spring", stiffness: 230, damping: 18 }}
          >
            <button
              className="absolute right-4 top-4 rounded-full p-2 text-sahara-text-muted transition-colors hover:bg-sahara-card hover:text-sahara-text"
              onClick={() => void dismissCurrent()}
              aria-label="Dismiss achievement"
            >
              <X className="size-4" />
            </button>

            <div className="pointer-events-none absolute -left-16 -top-20 size-48 rounded-full bg-sahara-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 size-48 rounded-full bg-sahara-primary/10 blur-3xl" />

            <div className="relative mx-auto mb-5 flex size-28 items-center justify-center rounded-full border border-sahara-primary/45 bg-sahara-primary-light/50 shadow-[0_0_0_12px_color-mix(in_srgb,var(--c-primary)_8%,transparent),0_0_42px_color-mix(in_srgb,var(--c-primary)_28%,transparent)]">
              <div className="absolute inset-3 rounded-full border border-sahara-primary/25" />
              {(() => {
                const Icon = ICONS[current.icon];
                return <Icon className="relative size-11 text-sahara-primary" strokeWidth={1.5} />;
              })()}
            </div>

            <p className="relative text-[10px] font-black uppercase tracking-[0.28em] text-sahara-primary">
              Achievement unlocked
            </p>
            <h2 id="achievement-title" className="relative mt-2 font-serif text-3xl font-semibold text-sahara-text">
              {current.title}
            </h2>
            <p id="achievement-description" className="relative mx-auto mt-2 max-w-xs text-sm leading-relaxed text-sahara-text-muted">
              {current.description}
            </p>

            <Button
              variant="solid"
              intent="sahara"
              size="md"
              shape="rounded-full"
              className="relative mt-7 min-w-40"
              onClick={() => void dismissCurrent()}
            >
              Continue
            </Button>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
