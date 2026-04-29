import { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { HashRouter, Routes, Route } from "react-router-dom";
import { TimerPage } from "@/pages/timer-page";
import { TasksPage } from "@/pages/tasks-page";
import { CalendarPage } from "@/pages/calendar-page";
import { AnalyticsPage } from "@/pages/analytics-page";
import { SettingsPage } from "@/pages/settings-page";
import { OnboardingPage } from "@/pages/onboarding-page";
import { useOnboardingStore } from "@/features/onboarding/use-onboarding-store";

function OnboardingGuard() {
  const loaded = useOnboardingStore((s) => s.loaded);
  const complete = useOnboardingStore((s) => s.complete);
  const check = useOnboardingStore((s) => s.check);

  useEffect(() => {
    if (!loaded) check();
  }, [loaded, check]);

  if (!loaded) return null;
  if (!complete) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

export function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<OnboardingGuard />}>
          <Route path="/" element={<TimerPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
