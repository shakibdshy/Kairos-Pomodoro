import { useState, useEffect, useCallback } from "react";
import { Plus, Target } from "lucide-react";
import { Text } from "@/components/ui/text";
import { useTaskStore } from "@/features/tasks/use-task-store";
import { useTimerStore } from "@/features/timer/use-timer-store";
import type { Task } from "@/features/tasks/task-types";
import { TaskCard } from "@/components/base/task-card";
import { AddTaskModal } from "@/components/base/add-task-modal";

export function TasksList() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const tasks = useTaskStore((s) => s.tasks);
  const loading = useTaskStore((s) => s.loading);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const activeTaskId = useTimerStore((s) => s.activeTaskId);
  const setActiveTask = useTimerStore((s) => s.setActiveTask);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleToggleActive = useCallback(
    (task: Task) => {
      setActiveTask(task.id === activeTaskId ? null : task.id);
    },
    [activeTaskId, setActiveTask],
  );

  const handleAddTask = useCallback(
    async (data: {
      name: string;
      estimatedPomos: number;
      project: string;
      priority: string;
      categoryId: number | null;
    }) => {
      await addTask(
        data.name,
        data.estimatedPomos,
        data.project || undefined,
        data.priority || undefined,
        data.categoryId ?? undefined,
      );
      await loadTasks();
    },
    [addTask, loadTasks],
  );

  const handleEditTask = useCallback(
    async (data: {
      name: string;
      estimatedPomos: number;
      project: string;
      priority: string;
      categoryId: number | null;
    }) => {
      if (!editingTask) return;
      await updateTask(
        editingTask.id,
        data.name,
        data.estimatedPomos,
        data.project || null,
        data.priority || null,
        data.categoryId,
      );
      setEditingTask(null);
      await loadTasks();
    },
    [editingTask, updateTask, loadTasks],
  );

  const handleDeleteTask = useCallback(
    async (taskId: number) => {
      await deleteTask(taskId);
      if (taskId === activeTaskId) {
        setActiveTask(null);
      }
    },
    [deleteTask, activeTaskId, setActiveTask],
  );

  const incompleteTasks = tasks.filter(
    (t) => t.completed_pomos < t.estimated_pomos,
  );
  const completedTasks = tasks.filter(
    (t) => t.completed_pomos >= t.estimated_pomos,
  );

  return (
    <div className="w-full">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-serif text-4xl text-sahara-text">
            Today&apos;s Focus
          </h1>
          <p className="text-sahara-text-muted mt-2 font-medium text-sm">
            Curate your tasks for maximum deep work.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-sahara-primary text-white px-6 py-3 rounded-xl font-bold text-xs tracking-widest hover:bg-sahara-primary/90 transition-colors shadow-lg shadow-sahara-primary/20"
        >
          <Plus className="w-4 h-4" />
          NEW TASK
        </button>
      </header>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border rounded-2xl p-6 h-48" />
          ))}
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-sahara-card/30 rounded-3xl border border-dashed border-sahara-border/50">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-sahara-text-muted shadow-sm mb-4">
            <Target className="w-6 h-6" />
          </div>
          <Text variant="h3" className="text-xl">
            No tasks yet
          </Text>
          <p className="text-sm text-sahara-text-muted mt-2 max-w-xs">
            Start by adding a task you want to focus on today.
          </p>
        </div>
      )}

      {!loading && incompleteTasks.length > 0 && (
        <div className="space-y-3 mb-8">
          <Text
            variant="body"
            className="text-xs font-bold text-sahara-text-muted uppercase tracking-wider"
          >
            In Progress ({incompleteTasks.length})
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {incompleteTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isActive={task.id === activeTaskId}
                onToggleActive={() => handleToggleActive(task)}
                onEdit={() => setEditingTask(task)}
                onDelete={() => handleDeleteTask(task.id)}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && completedTasks.length > 0 && (
        <div className="space-y-3">
          <Text
            variant="body"
            className="text-xs font-bold text-sahara-text-muted uppercase tracking-wider"
          >
            Completed ({completedTasks.length})
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isActive={false}
                onToggleActive={() => {}}
                onDelete={() => handleDeleteTask(task.id)}
              />
            ))}
          </div>
        </div>
      )}

      <AddTaskModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddTask}
      />

      <AddTaskModal
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleEditTask}
        editTask={editingTask}
      />
    </div>
  );
}
