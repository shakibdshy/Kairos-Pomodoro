import { MainLayout } from "@/components/template/main-layout";
import { TasksList } from "@/components/containers/tasks-list";
import type { Route } from "@/app/router";

interface TasksPageProps {
  onNavigate: (route: Route) => void;
  currentRoute: Route;
}

export function TasksPage({ onNavigate, currentRoute }: TasksPageProps) {
  return (
    <MainLayout onNavigate={onNavigate} currentRoute={currentRoute}>
      <div className="px-12 py-12 max-w-5xl mx-auto">
        <TasksList />
      </div>
    </MainLayout>
  );
}
