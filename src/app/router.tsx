import { useState, useEffect } from "react";
import { TimerPage } from "@/pages/timer-page";
import { TasksPage } from "@/pages/tasks-page";
import { CalendarPage } from "@/pages/calendar-page";
import { AnalyticsPage } from "@/pages/analytics-page";
import { SettingsPage } from "@/pages/settings-page";
import { OnboardingPage } from "@/pages/onboarding-page";
import { useTaskStore } from "@/features/tasks/use-task-store";

export type Route = "timer" | "tasks" | "calendar" | "analytics" | "notes" | "library" | "settings" | "onboarding";

export function Router() {
  const [currentRoute, setCurrentRoute] = useState<Route>("timer");
  const loadTasks = useTaskStore((s) => s.loadTasks);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const renderRoute = () => {
    switch (currentRoute) {
      case "timer":
        return <TimerPage onNavigate={setCurrentRoute} currentRoute={currentRoute} />;
      case "tasks":
        return <TasksPage onNavigate={setCurrentRoute} currentRoute={currentRoute} />;
      case "calendar":
        return <CalendarPage onNavigate={setCurrentRoute} currentRoute={currentRoute} />;
      case "analytics":
        return <AnalyticsPage onNavigate={setCurrentRoute} currentRoute={currentRoute} />;
      case "settings":
        return <SettingsPage onNavigate={setCurrentRoute} currentRoute={currentRoute} />;
      case "onboarding":
        return <OnboardingPage onNavigate={setCurrentRoute} />;
      case "notes":
      case "library":
        return (
          <div className="flex items-center justify-center h-full text-sahara-text-muted font-serif italic">
            Coming soon...
          </div>
        );
      default:
        return <TimerPage onNavigate={setCurrentRoute} currentRoute={currentRoute} />;
    }
  };

  return <div className="h-full w-full">{renderRoute()}</div>;
}
