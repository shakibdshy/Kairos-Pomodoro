import { MainLayout } from "@/components/template/main-layout";
import type { Route } from "@/app/router";
import { CalendarDashboard } from "@/components/containers/calendar";

interface CalendarPageProps {
  onNavigate: (route: Route) => void;
  currentRoute: Route;
}

export function CalendarPage({ onNavigate, currentRoute }: CalendarPageProps) {
  return (
    <MainLayout onNavigate={onNavigate} currentRoute={currentRoute}>
      <CalendarDashboard />
    </MainLayout>
  );
}
