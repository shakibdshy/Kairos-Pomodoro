import { MainLayout } from "@/template/main-layout";
import { useTaskStore } from "@/features/tasks/use-task-store";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { Plus, Target, Clock, MoreVertical, CheckCircle2 } from "lucide-react";
import type { Route } from "@/app/router";
import { cn } from "@/lib/cn";

interface TasksPageProps {
  onNavigate: (route: Route) => void;
  currentRoute: Route;
}

export function TasksPage({ onNavigate, currentRoute }: TasksPageProps) {
  const tasks = useTaskStore((s) => s.tasks);
  const activeTaskId = useTimerStore((s) => s.activeTaskId);
  const setActiveTask = useTimerStore((s) => s.setActiveTask);

  return (
    <MainLayout onNavigate={onNavigate} currentRoute={currentRoute}>
      <div className="px-12 py-12 max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-serif text-4xl text-sahara-text">
              Today's Focus
            </h1>
            <p className="text-sahara-text-muted mt-2 font-medium">
              Curate your tasks for maximum deep work.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-sahara-primary text-white px-6 py-3 rounded-xl font-bold text-xs tracking-widest hover:bg-sahara-primary/90 transition-colors shadow-lg shadow-sahara-primary/20">
            <Plus className="w-4 h-4" />
            NEW TASK
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => {
            const isActive = task.id === activeTaskId;
            return (
              <div
                key={task.id}
                onClick={() => setActiveTask(isActive ? null : task.id)}
                className={cn(
                  "group relative bg-white border rounded-2xl p-6 transition-all cursor-pointer hover:shadow-md",
                  isActive
                    ? "border-sahara-primary ring-1 ring-sahara-primary/20 shadow-lg shadow-sahara-primary/5"
                    : "border-sahara-border/20 hover:border-sahara-primary/30",
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                      task.completed_pomos >= task.estimated_pomos
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-sahara-border/40 group-hover:border-sahara-primary/40",
                    )}
                  >
                    {task.completed_pomos >= task.estimated_pomos && (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <button className="text-sahara-text-muted hover:text-sahara-text transition-colors p-1">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <h3
                  className={cn(
                    "font-serif text-xl mb-2",
                    task.completed_pomos >= task.estimated_pomos
                      ? "text-sahara-text-muted line-through"
                      : "text-sahara-text",
                  )}
                >
                  {task.name}
                </h3>

                {task.project && (
                  <p className="text-[10px] font-bold tracking-widest text-sahara-text-muted uppercase mb-4">
                    Project: {task.project}
                  </p>
                )}

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-sahara-border/10">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-sahara-text-muted" />
                    <span className="text-xs font-bold text-sahara-text-secondary tabular-nums">
                      {task.completed_pomos}/{task.estimated_pomos}{" "}
                      <span className="text-[10px] text-sahara-text-muted uppercase tracking-widest ml-1">
                        Pomos
                      </span>
                    </span>
                  </div>

                  {isActive ? (
                    <div className="flex items-center gap-1.5 text-sahara-primary">
                      <Target className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">
                        Active
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold tracking-widest uppercase text-sahara-text-muted group-hover:text-sahara-primary transition-colors">
                      Link Session
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {tasks.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-sahara-card/30 rounded-3xl border border-dashed border-sahara-border/50">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-sahara-text-muted shadow-sm mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl text-sahara-text">
                No tasks yet
              </h3>
              <p className="text-sm text-sahara-text-muted mt-2 max-w-xs">
                Start by adding a task you want to focus on today.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
