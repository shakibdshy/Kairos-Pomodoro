import { MainLayout } from "@/components/template/main-layout";
import { TimerControls } from "@/components/containers/timer-controls";
import { TodayFocus } from "@/components/containers/today-focus";
import { TodaySessions } from "@/components/containers/today-sessions";
import { Text } from "@/components/ui/text";
import type { Route } from "@/app/router";

interface TimerPageProps {
  onNavigate: (route: Route) => void;
  currentRoute: Route;
}

export function TimerPage({ onNavigate, currentRoute }: TimerPageProps) {
  return (
    <MainLayout onNavigate={onNavigate} currentRoute={currentRoute}>
      <div className="flex flex-col items-center gap-8 px-12 py-6 max-w-4xl mx-auto">
        <TimerControls />
        <div className="w-full border-t border-sahara-border/30 pt-8">
          <Text variant="h3" className="mb-4 font-serif text-2xl">
            Today's Focus
          </Text>
          <TodayFocus />
        </div>
        <TodaySessions />
      </div>
    </MainLayout>
  );
}
