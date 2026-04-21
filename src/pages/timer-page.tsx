import { MainLayout } from "@/template/main-layout";
import { TimerControls } from "@/containers/timer-controls";
import { TaskList } from "@/containers/task-list";
import { Text } from "@/ui/text";
import type { Route } from "@/app/router";

interface TimerPageProps {
  onNavigate: (route: Route) => void;
  currentRoute: Route;
}

export function TimerPage({ onNavigate, currentRoute }: TimerPageProps) {
  return (
    <MainLayout onNavigate={onNavigate} currentRoute={currentRoute}>
      <div className="flex flex-col items-center gap-8 px-12 py-12 max-w-4xl mx-auto">
        <TimerControls />
        <div className="w-full border-t border-sahara-border/30 pt-8">
          <Text variant="h3" className="mb-4 font-serif text-2xl">
            Today's Focus
          </Text>
          <TaskList />
        </div>
      </div>
    </MainLayout>
  );
}
