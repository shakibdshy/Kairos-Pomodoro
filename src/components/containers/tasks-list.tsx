import { useState, useEffect } from "react";
import { useTaskStore } from "@/features/tasks/use-task-store";
import { useTimerStore } from "@/features/timer/use-timer-store";
import {
  Plus,
  Search,
  Filter,
  ListTodo,
  LayoutGrid,
  Target,
  Clock,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { AddTaskModal } from "@/components/base/add-task-modal";

export function TasksList() {
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const incrementPomos = useTaskStore((s) => s.incrementPomos);

  const activeTaskId = useTimerStore((s) => s.activeTaskId);
  const setActiveTask = useTimerStore((s) => s.setActiveTask);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (tasks.length === 0) {
      addTask("Build Kairos MVP", 8, "Kairos");
      addTask("Read Deep Work", 2, "Learning");
      addTask("Review PR #42", 3, "Work");
    }
  }, [tasks.length, addTask]);

  const filteredTasks = tasks.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.project || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddTask = async (data: {
    name: string;
    estimatedPomos: number;
    project: string;
    priority: string;
    categoryId: number | null;
  }) => {
    await addTask(data.name, data.estimatedPomos);
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6 md:mb-10">
        <p className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-[0.2em] mb-1">
          Task Management
        </p>
        <h1 className="font-serif text-2xl md:text-4xl text-sahara-text">
          Your Tasks
        </h1>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 md:mb-8">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sahara-text-muted" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-sahara-card border border-sahara-border/20 rounded-xl pl-9 pr-4 py-2.5 text-sm text-sahara-text placeholder:text-sahara-text-muted/50 outline-none focus:border-sahara-primary/40 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto ml-auto">
          <Button
            variant={viewMode === "list" ? "solid" : "outline"}
            intent={viewMode === "list" ? "sahara" : "default"}
            size="icon"
            shape="rounded-lg"
            onClick={() => setViewMode("list")}
            className="border-sahara-border/30"
          >
            <ListTodo className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "solid" : "outline"}
            intent={viewMode === "grid" ? "sahara" : "default"}
            size="icon"
            shape="rounded-lg"
            onClick={() => setViewMode("grid")}
            className="border-sahara-border/30"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Filter className="w-4 h-4 text-sahara-text-muted hidden sm:block ml-1" />
          <Button
            variant="solid"
            intent="sahara"
            size="sm"
            shape="rounded-xl"
            onClick={() => setShowAddModal(true)}
            className="gap-1.5 ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Task</span>
          </Button>
        </div>
      </div>

      <AddTaskModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddTask}
      />

      {/* Task Grid/List */}
      {filteredTasks.length === 0 && searchQuery ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Filter className="w-12 h-12 text-sahara-border mb-4" />
          <p className="text-sm font-bold text-sahara-text-muted">
            No tasks found
          </p>
          <p className="text-xs text-sahara-text-muted/60 mt-1">
            Try a different search term
          </p>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
              : "space-y-2.5 md:space-y-3",
          )}
        >
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "group relative bg-sahara-surface border border-sahara-border/15 rounded-xl md:rounded-2xl p-3.5 md:p-5 transition-all hover:border-sahara-primary/25 hover:shadow-sm cursor-pointer",
                activeTaskId === task.id &&
                  "border-sahara-primary/40 shadow-md shadow-sahara-primary/5",
              )}
              onClick={() =>
                setActiveTask(activeTaskId === task.id ? null : task.id)
              }
            >
              <div className="flex items-start justify-between gap-2 mb-2 md:mb-3">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider",
                    activeTaskId === task.id
                      ? "bg-sahara-primary-light text-sahara-primary"
                      : "bg-sahara-card text-sahara-text-muted",
                  )}
                >
                  {task.project || "General"}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      incrementPomos(task.id);
                    }}
                    className="p-1 rounded-lg hover:bg-sahara-card transition-colors cursor-pointer"
                    title="Complete pomodoro"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id).catch(() => {});
                      if (activeTaskId === task.id) setActiveTask(null);
                    }}
                    className="p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>

              <h3
                className={cn(
                  "font-serif text-base md:text-lg leading-snug",
                  task.completed_pomos > 0 &&
                    task.completed_pomos >= task.estimated_pomos
                    ? "line-through text-sahara-text-muted"
                    : "text-sahara-text",
                )}
              >
                {task.name}
              </h3>

              <div className="flex items-center gap-3 mt-2 md:mt-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Target className="w-3 h-3 md:w-3.5 md:h-3.5 text-sahara-primary" />
                  <span className="text-[10px] md:text-xs font-bold text-sahara-text-secondary tabular-nums">
                    {task.completed_pomos}/{task.estimated_pomos}{" "}
                    <span className="text-sahara-text-muted font-normal">
                      pomos
                    </span>
                  </span>
                </div>

                {activeTaskId === task.id && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
                    <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 animate-pulse" />
                    Active
                  </div>
                )}

                {task.completed_pomos > 0 &&
                  task.completed_pomos >= task.estimated_pomos && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sahara-bg text-sahara-text-muted text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      Done
                    </span>
                  )}
              </div>

              {task.estimated_pomos > 0 && (
                <div className="mt-2 md:mt-3 h-1.5 bg-sahara-bg/60 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      task.completed_pomos >= task.estimated_pomos
                        ? "bg-green-500"
                        : "bg-sahara-primary",
                    )}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          (task.completed_pomos / task.estimated_pomos) * 100,
                        ),
                      )}%`,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
