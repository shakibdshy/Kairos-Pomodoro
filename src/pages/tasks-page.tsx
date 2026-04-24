import { MainLayout } from "@/components/template/main-layout";
import { TasksList } from "@/components/containers/tasks-list";

export function TasksPage() {
  return (
    <MainLayout>
      <div className="px-4 sm:px-6 md:px-12 py-6 md:py-12 max-w-5xl mx-auto">
        <TasksList />
      </div>
    </MainLayout>
  );
}
