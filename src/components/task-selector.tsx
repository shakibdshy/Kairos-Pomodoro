import { useState, useEffect } from "react";
import { useTaskStore } from "@/features/tasks/use-task-store";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { useTaskFilter } from "@/features/tasks/use-task-filter";
import { Button } from "@/components/ui/button";
import { X, CheckCircle2, ChevronDown, ListTodo } from "lucide-react";
import { cn } from "@/lib/cn";

interface TaskSelectorProps {
  disabled?: boolean;
}

export function TaskSelector({ disabled = false }: TaskSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const tasks = useTaskStore((s) => s.tasks);
  const activeTaskId = useTimerStore((s) => s.activeTaskId);
  const setActiveTask = useTimerStore((s) => s.setActiveTask);

  const activeTask = tasks.find((t) => t.id === activeTaskId);
  
  // Use the standard task filter to get active tasks
  const { active: availableTasks } = useTaskFilter(tasks, searchQuery);

  useEffect(() => {
    if (!isOpen) return;
    const handler = () => setIsOpen(false);
    window.addEventListener("app:escape", handler);
    return () => window.removeEventListener("app:escape", handler);
  }, [isOpen]);

  const handleSelect = (taskId: number | null) => {
    setActiveTask(taskId);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <Button
        variant="outline"
        intent={activeTask ? "sahara" : "default"}
        size="sm"
        shape="rounded-full"
        active={!!activeTask}
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={cn(
          "text-left gap-1.5 max-w-[200px] md:max-w-[250px]",
          !activeTask && "border border-sahara-border/20 bg-sahara-surface/30 hover:border-sahara-primary/30 hover:bg-sahara-surface/50",
          activeTask && "hover:shadow-md",
        )}
      >
        {activeTask ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-sahara-primary shrink-0" />
            <span className="text-xs font-bold text-sahara-text tracking-wide truncate">
              {activeTask.name}
            </span>
            <ChevronDown className="w-3 h-3 text-sahara-text-muted shrink-0" />
          </>
        ) : (
          <>
            <ListTodo className="w-3.5 h-3.5 text-sahara-text-muted shrink-0" />
            <span className="text-[11px] font-medium text-sahara-text-muted tracking-wide truncate">
              Select Task
            </span>
            <ChevronDown className="w-3 h-3 text-sahara-text-muted shrink-0" />
          </>
        )}
      </Button>

      {/* Selection Dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-sahara-surface rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-sahara-border/20">
              <h2 className="font-serif text-xl text-sahara-text">
                Select Task
              </h2>
              <Button
                variant="ghost"
                size="icon"
                intent="default"
                shape="rounded-full"
                onClick={() => setIsOpen(false)}
                className="text-sahara-text-muted hover:text-sahara-text"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="px-6 pt-5 pb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search active tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sahara-border/30 bg-sahara-bg/50 text-sm font-medium placeholder:text-sahara-text-muted focus:outline-none focus:border-sahara-primary/50 focus:ring-2 focus:ring-sahara-primary/10 transition-all"
                />
              </div>
            </div>

            <div className="px-6 pb-6 max-h-64 overflow-y-auto">
              <Button
                variant="ghost"
                size="sm"
                intent="default"
                fullWidth
                shape="rounded-xl"
                active={activeTaskId === null}
                onClick={() => handleSelect(null)}
                className={cn(
                  "justify-between px-4 py-3 mb-1",
                  activeTaskId === null
                    ? "bg-sahara-primary-light ring-1 ring-sahara-primary/20"
                    : "hover:bg-sahara-card",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full border-2 border-sahara-text-muted shrink-0" />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      activeTaskId === null ? "text-sahara-primary font-bold" : "text-sahara-text-muted"
                    )}
                  >
                    No Task (Independent Session)
                  </span>
                </div>
              </Button>

              {availableTasks.map((task) => (
                <Button
                  key={task.id}
                  variant="ghost"
                  size="sm"
                  intent="default"
                  fullWidth
                  shape="rounded-xl"
                  active={activeTaskId === task.id}
                  onClick={() => handleSelect(task.id)}
                  className={cn(
                    "justify-between px-4 py-3 mb-1",
                    activeTaskId === task.id
                      ? "bg-sahara-primary-light ring-1 ring-sahara-primary/20"
                      : "hover:bg-sahara-card",
                  )}
                >
                  <div className="flex items-center gap-3 w-full min-w-0">
                    <CheckCircle2 className={cn(
                      "w-4 h-4 shrink-0", 
                      activeTaskId === task.id ? "text-sahara-primary" : "text-sahara-text-muted"
                    )} />
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span
                        className={cn(
                          "text-sm font-medium truncate w-full text-left",
                          activeTaskId === task.id
                            ? "text-sahara-primary font-bold"
                            : "text-sahara-text",
                        )}
                      >
                        {task.name}
                      </span>
                      <span className="text-[10px] text-sahara-text-muted">
                        {task.completed_pomos} / {task.estimated_pomos} Pomos
                      </span>
                    </div>
                  </div>
                </Button>
              ))}

              {availableTasks.length === 0 && searchQuery && (
                <p className="text-center text-sm text-sahara-text-muted py-6">
                  No matching tasks found
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
