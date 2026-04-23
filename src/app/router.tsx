import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { TimerPage } from "@/pages/timer-page";
import { TasksPage } from "@/pages/tasks-page";
import { CalendarPage } from "@/pages/calendar-page";
import { AnalyticsPage } from "@/pages/analytics-page";
import { SettingsPage } from "@/pages/settings-page";
import { OnboardingPage } from "@/pages/onboarding-page";

export function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TimerPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
