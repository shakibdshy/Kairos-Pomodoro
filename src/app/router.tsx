import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TimerPage } from "@/pages/timer-page";
import { TasksPage } from "@/pages/tasks-page";
import { CalendarPage } from "@/pages/calendar-page";
import { AnalyticsPage } from "@/pages/analytics-page";
import { SettingsPage } from "@/pages/settings-page";
import { OnboardingPage } from "@/pages/onboarding-page";

export type Route =
  | "timer"
  | "tasks"
  | "calendar"
  | "analytics"
  | "settings"
  | "onboarding";

export interface PageProps {
  onNavigate: (route: Route) => void;
  currentRoute: Route;
}

export function Router() {
  const [currentRoute, setCurrentRoute] = useState<Route>("timer");

  const renderRoute = () => {
    switch (currentRoute) {
      case "timer":
        return (
          <TimerPage onNavigate={setCurrentRoute} currentRoute={currentRoute} />
        );
      case "tasks":
        return (
          <TasksPage onNavigate={setCurrentRoute} currentRoute={currentRoute} />
        );
      case "calendar":
        return (
          <CalendarPage
            onNavigate={setCurrentRoute}
            currentRoute={currentRoute}
          />
        );
      case "analytics":
        return (
          <AnalyticsPage
            onNavigate={setCurrentRoute}
            currentRoute={currentRoute}
          />
        );
      case "settings":
        return (
          <SettingsPage
            onNavigate={setCurrentRoute}
            currentRoute={currentRoute}
          />
        );
      case "onboarding":
        return (
          <OnboardingPage
            onNavigate={setCurrentRoute}
            currentRoute={currentRoute}
          />
        );
      default: {
        const _exhaustive: never = currentRoute;
        void _exhaustive;
        return (
          <div className="flex items-center justify-center h-full flex-col gap-4 text-sahara-text-muted">
            <p className="font-serif text-2xl">Page not found</p>
            <Button
              variant="link"
              intent="sahara"
              size="xs"
              className="uppercase tracking-widest"
              onClick={() => setCurrentRoute("timer")}
            >
              Go to Timer
            </Button>
          </div>
        );
      }
    }
  };

  return <div className="h-full w-full">{renderRoute()}</div>;
}
