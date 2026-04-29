import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { TimerPage } from "@/pages/timer-page";
import { TasksPage } from "@/pages/tasks-page";
import { CalendarPage } from "@/pages/calendar-page";
import { AnalyticsPage } from "@/pages/analytics-page";
import { SettingsPage } from "@/pages/settings-page";
import { OnboardingPage } from "@/pages/onboarding-page";
import { getSetting } from "@/lib/db";

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    getSetting("onboarding_complete").then((value) => {
      setOnboardingComplete(value === "true");
    });
  }, []);

  if (onboardingComplete === null) {
    return null;
  }

  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

export function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <OnboardingGuard>
              <TimerPage />
            </OnboardingGuard>
          }
        />
        <Route
          path="/tasks"
          element={
            <OnboardingGuard>
              <TasksPage />
            </OnboardingGuard>
          }
        />
        <Route
          path="/calendar"
          element={
            <OnboardingGuard>
              <CalendarPage />
            </OnboardingGuard>
          }
        />
        <Route
          path="/analytics"
          element={
            <OnboardingGuard>
              <AnalyticsPage />
            </OnboardingGuard>
          }
        />
        <Route
          path="/settings"
          element={
            <OnboardingGuard>
              <SettingsPage />
            </OnboardingGuard>
          }
        />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
