import { MainLayout } from "@/components/template/main-layout";
import type { PageProps } from "@/app/router";
import { CalendarDashboard } from "@/components/containers/calendar";

export function CalendarPage({ onNavigate, currentRoute }: PageProps) {
  return (
    <MainLayout onNavigate={onNavigate} currentRoute={currentRoute}>
      <CalendarDashboard />
    </MainLayout>
  );
}
