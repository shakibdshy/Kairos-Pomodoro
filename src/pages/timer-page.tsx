import { MainLayout } from "@/components/template/main-layout";
import { TimerControls } from "@/components/containers/timer-controls";
import { FocusModeStage } from "@/components/timer/focus-mode-stage";
import { TodayFocus } from "@/components/containers/today-focus";
import { TodaySessions } from "@/components/containers/today-sessions";
import { Text } from "@/components/ui/text";
import { useUIStore } from "@/features/ui/use-ui-store";
import { m, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/cn";

export function TimerPage() {
  const isFullscreenFocus = useUIStore((s) => s.isFullscreenFocus);
  const pageRef = useRef<HTMLDivElement>(null);

  return (
    <MainLayout>
      <div
        ref={pageRef}
        data-focus-mode-boundary
        className={cn(
          "flex flex-col items-center gap-6 md:gap-8 px-4 sm:px-6 md:px-12 py-4 md:py-6 max-w-4xl mx-auto min-h-full w-full transition-[padding,gap] duration-500 ease-out",
          isFullscreenFocus && "h-full overflow-hidden",
        )}
      >
        <FocusModeStage
          boundaryRef={pageRef}
          isFullscreenFocus={isFullscreenFocus}
        >
          <TimerControls />
        </FocusModeStage>

        <AnimatePresence initial={false} mode="sync">
          {!isFullscreenFocus && (
            <m.div
              key="stats-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
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
      </div>
    </MainLayout>
  );
}
