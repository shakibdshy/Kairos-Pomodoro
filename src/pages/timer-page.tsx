import { MainLayout } from "@/components/template/main-layout";
import { TimerControls } from "@/components/containers/timer-controls";
import { TodayFocus } from "@/components/containers/today-focus";
import { TodaySessions } from "@/components/containers/today-sessions";
import { Text } from "@/components/ui/text";

export function TimerPage() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center gap-6 md:gap-8 px-4 sm:px-6 md:px-12 py-4 md:py-6 max-w-4xl mx-auto">
        <TimerControls />
        <div className="w-full border-t border-sahara-border/30 pt-6 md:pt-8">
          <Text
            variant="h3"
            className="mb-3 md:mb-4 font-serif text-xl md:text-2xl"
          >
            Today's Focus
          </Text>
          <TodayFocus />
        </div>
        <TodaySessions />
      </div>
    </MainLayout>
  );
}
