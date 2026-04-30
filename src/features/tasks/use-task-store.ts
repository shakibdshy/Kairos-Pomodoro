import { create } from "zustand";
import type { Task } from "@/features/tasks/task-types";
import {
  getTasks,
  addTask as dbAddTask,
  updateTask as dbUpdateTask,
  deleteTask as dbDeleteTask,
  toggleTaskArchived,
  incrementTaskPomos,
  getSetting,
  setSetting,
} from "@/lib/db";

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  loadTasks: () => Promise<void>;
  addTask: (
    name: string,
    estimatedPomos: number,
    project?: string,
    priority?: string,
    categoryId?: number | null,
  ) => Promise<void>;
  updateTask: (
    id: number,
    name?: string,
    estimatedPomos?: number,
    project?: string | null,
    priority?: string | null,
    categoryId?: number | null,
  ) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  archiveTask: (id: number) => Promise<void>;
  incrementPomos: (id: number) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  loading: false,
  error: null,

  loadTasks: async () => {
    set({ loading: true, error: null });
    try {
      let tasks = await getTasks();
      const hasSeeded = await getSetting("has_seeded_tasks");

      if (tasks.length === 0) {
        if (!hasSeeded) {
          await dbAddTask("Plan your first project", 4, "Personal");
          await dbAddTask("Review important documents", 2, "Work");
          await dbAddTask("Learn something new today", 3, "Learning");
          await setSetting("has_seeded_tasks", "true");
          tasks = await getTasks();
        }
      } else if (!hasSeeded) {
        await setSetting("has_seeded_tasks", "true");
      }

      set({ tasks, loading: false });
    } catch (err) {
      console.error("[TaskStore] Failed to load tasks:", err);
      set({ loading: false, error: String(err) });
    }
  },

  addTask: async (name, estimatedPomos, project, priority, categoryId) => {
    try {
      const id = await dbAddTask(
        name,
        estimatedPomos,
        project,
        priority,
        categoryId,
      );
      const newTask: Task = {
        id,
        name,
        estimated_pomos: estimatedPomos,
        completed_pomos: 0,
        project: project ?? undefined,
        priority: priority as Task["priority"] | undefined,
        category_id: categoryId ?? null,
        created_at: new Date().toISOString(),
        archived: 0,
      };
      set((state) => ({
        tasks: [newTask, ...state.tasks],
        error: null,
      }));
    } catch (err) {
      console.error("[TaskStore] Failed to add task:", err);
      set({ error: String(err) });
    }
  },

  updateTask: async (
    id,
    name,
    estimatedPomos,
    project,
    priority,
    categoryId,
  ) => {
    try {
      await dbUpdateTask(
        id,
        name,
        estimatedPomos,
        project,
        priority,
        categoryId,
      );
      set((state) => ({
        tasks: state.tasks.map((t) => {
          if (t.id !== id) return t;
          return {
            ...t,
            ...(name !== undefined && { name }),
            ...(estimatedPomos !== undefined && {
              estimated_pomos: estimatedPomos,
            }),
            ...(project !== undefined && { project: project ?? undefined }),
            ...(priority !== undefined && {
              priority: priority as Task["priority"] | undefined,
            }),
            ...(categoryId !== undefined && {
              category_id: categoryId ?? null,
            }),
          };
        }),
        error: null,
      }));
    } catch (err) {
      console.error("[TaskStore] Failed to update task:", err);
      set({ error: String(err) });
    }
  },

  deleteTask: async (id) => {
    try {
      await dbDeleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        error: null,
      }));
    } catch (err) {
      console.error("[TaskStore] Failed to delete task:", err);
      set({ error: String(err) });
    }
  },

  archiveTask: async (id) => {
    try {
      await toggleTaskArchived(id, true);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        error: null,
      }));
    } catch (err) {
      console.error("[TaskStore] Failed to archive task:", err);
      set({ error: String(err) });
    }
  },

  incrementPomos: async (id) => {
    try {
      await incrementTaskPomos(id);
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, completed_pomos: t.completed_pomos + 1 } : t,
        ),
        error: null,
      }));
    } catch (err) {
      console.error("[TaskStore] Failed to increment pomos:", err);
      set({ error: String(err) });
    }
  },
}));
