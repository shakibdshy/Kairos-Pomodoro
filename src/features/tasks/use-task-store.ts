import { create } from "zustand";
import type { Task } from "@/features/tasks/task-types";
import { getTasks, addTask, toggleTaskArchived } from "@/lib/db";

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  loadTasks: () => Promise<void>;
  addTask: (
    name: string,
    estimatedPomos: number,
    project?: string,
    priority?: string,
  ) => Promise<void>;
  archiveTask: (id: number) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  loading: false,

  loadTasks: async () => {
    set({ loading: true });
    const tasks = await getTasks();
    set({ tasks, loading: false });
  },

  addTask: async (
    name: string,
    estimatedPomos: number,
    project?: string,
    priority?: string,
  ) => {
    await addTask(name, estimatedPomos, project, priority);
    const tasks = await getTasks();
    set({ tasks });
  },

  archiveTask: async (id: number) => {
    await toggleTaskArchived(id, true);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
  },
}));
