import { MainLayout } from "@/components/template/main-layout";
import { CalendarDashboard } from "@/components/containers/calendar";

export function CalendarPage() {
  return (
    <MainLayout>
      <CalendarDashboard />
    </MainLayout>
  );
}
