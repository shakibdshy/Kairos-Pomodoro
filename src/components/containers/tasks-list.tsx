import { useReducer, useEffect } from "react";
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
import type { Task } from "@/features/tasks/task-types";

interface ListState {
  searchQuery: string;
  viewMode: "list" | "grid";
  showAddModal: boolean;
  taskToEdit: Task | null;
  showDone: boolean;
}

type ListAction =
  | { type: "SET_SEARCH"; query: string }
  | { type: "SET_VIEW_MODE"; mode: "list" | "grid" }
  | { type: "OPEN_ADD_MODAL"; taskToEdit?: Task | null }
  | { type: "CLOSE_ADD_MODAL" }
  | { type: "TOGGLE_DONE" };

const INITIAL_LIST_STATE: ListState = {
  searchQuery: "",
  viewMode: "list",
  showAddModal: false,
  taskToEdit: null,
  showDone: true,
};

function listReducer(state: ListState, action: ListAction): ListState {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, searchQuery: action.query };
    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.mode };
    case "OPEN_ADD_MODAL":
      return { ...state, showAddModal: true, taskToEdit: action.taskToEdit ?? null };
    case "CLOSE_ADD_MODAL":
      return { ...state, showAddModal: false, taskToEdit: null };
    case "TOGGLE_DONE":
      return { ...state, showDone: !state.showDone };
    default:
      return state;
  }
}

export function TasksList() {
  const navigate = useNavigate();
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const incrementPomos = useTaskStore((s) => s.incrementPomos);

  const activeTaskId = useTimerStore((s) => s.activeTaskId);
  const setActiveTask = useTimerStore((s) => s.setActiveTask);

  const [listState, dispatch] = useReducer(listReducer, INITIAL_LIST_STATE);
  const { searchQuery, viewMode, showAddModal, taskToEdit, showDone } = listState;

  const categories = useCategoriesStore((s) => s.categories);
  const loadCategories = useCategoriesStore((s) => s.loadCategories);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const { active: activeTasks, done: doneTasks } = useTaskFilter(
    tasks,
    searchQuery,
  );

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
    await addTask(
      data.name,
      data.estimatedPomos,
      data.project,
      data.priority,
      data.categoryId,
    );
    dispatch({ type: "CLOSE_ADD_MODAL" });
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
    dispatch({ type: "CLOSE_ADD_MODAL" });
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-sahara-text-muted" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => dispatch({ type: "SET_SEARCH", query: e.target.value })}
            className="w-full bg-sahara-card border border-sahara-border/20 rounded-full pl-9 pr-4 py-2.5 text-sm text-sahara-text placeholder:text-sahara-text-muted/50 outline-none focus:border-sahara-primary/40 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto ml-auto">
          <Button
            variant={viewMode === "list" ? "solid" : "outline"}
            intent={viewMode === "list" ? "sahara" : "default"}
            size="icon"
            shape="rounded-full"
            onClick={() => dispatch({ type: "SET_VIEW_MODE", mode: "list" })}
            className="border-sahara-border/30"
          >
            <ListTodo className="size-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "solid" : "outline"}
            intent={viewMode === "grid" ? "sahara" : "default"}
            size="icon"
            shape="rounded-full"
            onClick={() => dispatch({ type: "SET_VIEW_MODE", mode: "grid" })}
            className="border-sahara-border/30"
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Filter className="size-4 text-sahara-text-muted hidden sm:block ml-1" />
          <Button
            variant="solid"
            intent="sahara"
            size="sm"
            shape="rounded-full"
            onClick={() => dispatch({ type: "OPEN_ADD_MODAL" })}
            className="gap-1.5 ml-1 md:ml-2 px-4 shadow-lg shadow-sahara-primary/20 hover:shadow-xl hover:shadow-sahara-primary/30 text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all"
          >
            <Plus className="size-3.5 md:size-4" />
            <span className="hidden sm:inline">Add Task</span>
          </Button>
        </div>
      </div>

      <AddTaskModal
        open={showAddModal}
        onClose={() => dispatch({ type: "CLOSE_ADD_MODAL" })}
        onSubmit={taskToEdit ? handleEditTask : handleAddTask}
        editTask={taskToEdit}
        categories={categories}
      />

      {/* Task Sections */}
      {activeTasks.length === 0 && doneTasks.length === 0 && searchQuery ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Filter className="size-12 text-sahara-border mb-4" />
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
                <Target className="size-4 text-sahara-primary" />
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
                    onEdit={() =>
                      dispatch({ type: "OPEN_ADD_MODAL", taskToEdit: task })
                    }
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
              <Target className="size-10 text-sahara-border mb-3" />
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
                onClick={() => dispatch({ type: "TOGGLE_DONE" })}
                className="flex items-center gap-2 mb-4 w-full text-left"
              >
                {showDone ? (
                  <ChevronDown className="size-4 text-sahara-text-muted" />
                ) : (
                  <ChevronRight className="size-4 text-sahara-text-muted" />
                )}
                <CheckCircle2 className="size-4 text-green-500" />
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
                      onToggleActive={() => setActiveTask(task.id)}
                      onEdit={() =>
                        dispatch({ type: "OPEN_ADD_MODAL", taskToEdit: task })
                      }
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
