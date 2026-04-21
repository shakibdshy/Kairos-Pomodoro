import { create } from "zustand";
import type { Task } from "@/features/tasks/task-types";
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskArchived,
  incrementTaskPomos,
} from "@/lib/db";

interface TaskStore {
  tasks: Task[];
  loading: boolean;
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

  loadTasks: async () => {
    set({ loading: true });
    const tasks = await getTasks();
    set({ tasks, loading: false });
  },

  addTask: async (name, estimatedPomos, project, priority, categoryId) => {
    await addTask(name, estimatedPomos, project, priority, categoryId);
    const tasks = await getTasks();
    set({ tasks });
  },

  updateTask: async (id, name, estimatedPomos, project, priority, categoryId) => {
    await updateTask(id, name, estimatedPomos, project, priority, categoryId);
    const tasks = await getTasks();
    set({ tasks });
  },

  deleteTask: async (id) => {
    await deleteTask(id);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
  },

  archiveTask: async (id) => {
    await toggleTaskArchived(id, true);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
  },

  incrementPomos: async (id) => {
    await incrementTaskPomos(id);
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, completed_pomos: t.completed_pomos + 1 } : t,
      ),
    }));
  },
}));
