import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskStore } from "@/features/tasks/use-task-store";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { useTaskFilter } from "@/features/tasks/use-task-filter";
import { useCategoriesStore } from "@/features/categories/use-categories-store";
import {
  Plus,
  Search,
  Filter,
  ListTodo,
  LayoutGrid,
  Target,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { AddTaskModal } from "@/components/base/add-task-modal";
import { TaskListCard } from "@/components/base/task-list-card";

export function TasksList() {
  const navigate = useNavigate();
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const incrementPomos = useTaskStore((s) => s.incrementPomos);

  const activeTaskId = useTimerStore((s) => s.activeTaskId);
  const setActiveTask = useTimerStore((s) => s.setActiveTask);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<typeof tasks[number] | null>(null);
  const [showDone, setShowDone] = useState(true);
  const categories = useCategoriesStore((s) => s.categories);

  const { active: activeTasks, done: doneTasks } = useTaskFilter(tasks, searchQuery);

  const handleFocus = async (taskId: number) => {
    await setActiveTask(taskId);
    navigate("/");
  };

  const handleAddTask = async (data: {
    name: string;
    estimatedPomos: number;
    project: string;
    priority: string;
    categoryId: number | null;
  }) => {
    await addTask(data.name, data.estimatedPomos, data.project, data.priority, data.categoryId);
    setShowAddModal(false);
  };

  const handleEditTask = async (data: {
    name: string;
    estimatedPomos: number;
    project: string;
    priority: string;
    categoryId: number | null;
  }) => {
    if (!taskToEdit) return;
    await updateTask(
      taskToEdit.id,
      data.name,
      data.estimatedPomos,
      data.project || null,
      data.priority || null,
      data.categoryId,
    );
    setTaskToEdit(null);
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
        onClose={() => {
          setShowAddModal(false);
          setTaskToEdit(null);
        }}
        onSubmit={taskToEdit ? handleEditTask : handleAddTask}
        editTask={taskToEdit}
        categories={categories}
      />

      {/* Task Sections */}
      {activeTasks.length === 0 && doneTasks.length === 0 && searchQuery ? (
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
        <div className="space-y-8">
          {/* Active Tasks */}
          {activeTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-sahara-primary" />
                <span className="text-xs font-bold text-sahara-text-muted uppercase tracking-wider">
                  Active ({activeTasks.length})
                </span>
              </div>
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
                    : "space-y-2.5 md:space-y-3",
                )}
              >
                  {activeTasks.map((task) => (
                    <TaskListCard
                      key={task.id}
                      task={task}
                      isActive={activeTaskId === task.id}
                      onToggleActive={() =>
                        setActiveTask(activeTaskId === task.id ? null : task.id)
                      }
                      onFocus={() => handleFocus(task.id)}
                      onEdit={() => {
                        setTaskToEdit(task);
                        setShowAddModal(true);
                      }}
                      onDelete={async () => {
                        await deleteTask(task.id);
                        if (activeTaskId === task.id) setActiveTask(null);
                      }}
                      onCompletePomo={() => incrementPomos(task.id)}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Active tasks empty state (when search yields results only in done) */}
          {activeTasks.length === 0 && doneTasks.length > 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Target className="w-10 h-10 text-sahara-border mb-3" />
              <p className="text-sm font-bold text-sahara-text-muted">
                No active tasks
              </p>
              <p className="text-xs text-sahara-text-muted/60 mt-1">
                All tasks are completed!
              </p>
            </div>
          )}

          {/* Done Tasks */}
          {doneTasks.length > 0 && (
            <div>
              <button
                onClick={() => setShowDone(!showDone)}
                className="flex items-center gap-2 mb-4 w-full text-left"
              >
                {showDone ? (
                  <ChevronDown className="w-4 h-4 text-sahara-text-muted" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-sahara-text-muted" />
                )}
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-xs font-bold text-sahara-text-muted uppercase tracking-wider">
                  Completed ({doneTasks.length})
                </span>
              </button>

              {showDone && (
                <div
                  className={cn(
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
                      : "space-y-2.5 md:space-y-3",
                  )}
                >
                  {doneTasks.map((task) => (
                    <TaskListCard
                      key={task.id}
                      task={task}
                      isActive={false}
                      onToggleActive={() =>
                        setActiveTask(task.id)
                      }
                      onEdit={() => {
                        setTaskToEdit(task);
                        setShowAddModal(true);
                      }}
                      onDelete={async () => {
                        await deleteTask(task.id);
                      }}
                      onCompletePomo={() => incrementPomos(task.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


