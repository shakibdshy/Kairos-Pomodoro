import { MainLayout } from "@/components/template/main-layout";
import { TimerControls } from "@/components/containers/timer-controls";
import { TodayFocus } from "@/components/containers/today-focus";
import { TodaySessions } from "@/components/containers/today-sessions";
import { Text } from "@/components/ui/text";
import { useUIStore } from "@/features/ui/use-ui-store";
import { m, AnimatePresence, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/cn";

export function TimerPage() {
  const isFullscreenFocus = useUIStore((s) => s.isFullscreenFocus);

  return (
    <LayoutGroup id="timer-focus-mode">
      <MainLayout>
        <m.div
          layout="position"
          transition={{
            type: "spring",
            damping: 28,
            stiffness: 180,
            mass: 0.8,
          }}
          className={cn(
            "flex flex-col items-center gap-6 md:gap-8 px-4 sm:px-6 md:px-12 py-4 md:py-6 max-w-4xl mx-auto min-h-full w-full transition-[padding,gap] duration-500 ease-out",
            isFullscreenFocus ? "justify-center h-full overflow-hidden" : "justify-start",
          )}
        >
          <TimerControls />

          <AnimatePresence initial={false} mode="sync">
            {!isFullscreenFocus && (
              <m.div
                key="stats-section"
                layout="position"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ type: "spring", damping: 26, stiffness: 210 }}
                className="w-full border-t border-sahara-border/30 pt-6 md:pt-8"
              >
                <Text
                  variant="h3"
                  className="mb-3 md:mb-4 font-serif text-xl md:text-2xl"
                >
                  Today&apos;s Focus
                </Text>
                <TodayFocus />
                <div className="mt-8">
                  <TodaySessions />
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </m.div>
      </MainLayout>
    </LayoutGroup>
  );
}
