import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTaskStore } from "@/features/tasks/use-task-store";

const mockTasks = [
  {
    id: 1,
    name: "Task A",
    estimated_pomos: 3,
    completed_pomos: 1,
    category_id: null,
    created_at: "2026-01-01T00:00:00",
    archived: 0,
  },
  {
    id: 2,
    name: "Task B",
    project: "Work",
    priority: "high" as const,
    estimated_pomos: 5,
    completed_pomos: 5,
    category_id: 1,
    created_at: "2026-01-02T00:00:00",
    archived: 0,
  },
];

vi.mock("@/lib/db", () => ({
  getTasks: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "Task A",
      estimated_pomos: 3,
      completed_pomos: 1,
      category_id: null,
      created_at: "2026-01-01T00:00:00",
      archived: 0,
    },
    {
      id: 2,
      name: "Task B",
      project: "Work",
      priority: "high",
      estimated_pomos: 5,
      completed_pomos: 5,
      category_id: 1,
      created_at: "2026-01-02T00:00:00",
      archived: 0,
    },
  ]),
  addTask: vi.fn().mockResolvedValue(3),
  updateTask: vi.fn().mockResolvedValue(undefined),
  deleteTask: vi.fn().mockResolvedValue(undefined),
  toggleTaskArchived: vi.fn().mockResolvedValue(undefined),
  incrementTaskPomos: vi.fn().mockResolvedValue(undefined),
  getSetting: vi.fn().mockResolvedValue("true"),
  setSetting: vi.fn().mockResolvedValue(undefined),
}));

beforeEach(async () => {
  vi.clearAllMocks();
  useTaskStore.setState({ tasks: [], loading: false, error: null });
});

describe("useTaskStore", () => {
  describe("initial state", () => {
    it("has correct defaults", () => {
      const state = useTaskStore.getState();
      expect(state.tasks).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("loadTasks", () => {
    it("loads tasks from db", async () => {
      await useTaskStore.getState().loadTasks();
      const state = useTaskStore.getState();
      expect(state.tasks).toHaveLength(2);
      expect(state.tasks[0].name).toBe("Task A");
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("sets loading true during fetch", async () => {
      const promise = useTaskStore.getState().loadTasks();
      expect(useTaskStore.getState().loading).toBe(true);
      await promise;
      expect(useTaskStore.getState().loading).toBe(false);
    });
  });

  describe("addTask", () => {
    it("optimistically prepends new task to list", async () => {
      useTaskStore.setState({ tasks: [...mockTasks] });
      await useTaskStore.getState().addTask("New Task", 2, "Project");
      const state = useTaskStore.getState();
      expect(state.tasks).toHaveLength(3);
      expect(state.tasks[0].name).toBe("New Task");
      expect(state.tasks[0].estimated_pomos).toBe(2);
      expect(state.tasks[0].completed_pomos).toBe(0);
      expect(state.tasks[0].project).toBe("Project");
    });

    it("sets error on failure", async () => {
      const { addTask } = await import("@/lib/db");
      vi.mocked(addTask).mockRejectedValueOnce(new Error("DB error"));
      await useTaskStore.getState().addTask("Fail", 1);
      expect(useTaskStore.getState().error).toBe("Error: DB error");
    });
  });

  describe("updateTask", () => {
    it("optimistically updates task fields", async () => {
      useTaskStore.setState({ tasks: [...mockTasks] });
      await useTaskStore.getState().updateTask(1, "Updated Name", 10);
      const state = useTaskStore.getState();
      const updated = state.tasks.find((t) => t.id === 1)!;
      expect(updated.name).toBe("Updated Name");
      expect(updated.estimated_pomos).toBe(10);
      expect(updated.completed_pomos).toBe(1);
    });

    it("does not change fields that are undefined", async () => {
      useTaskStore.setState({ tasks: [...mockTasks] });
      await useTaskStore.getState().updateTask(1, undefined, undefined, "NewProject");
      const updated = useTaskStore.getState().tasks.find((t) => t.id === 1)!;
      expect(updated.name).toBe("Task A");
      expect(updated.project).toBe("NewProject");
    });
  });

  describe("deleteTask", () => {
    it("optimistically removes task", async () => {
      useTaskStore.setState({ tasks: [...mockTasks] });
      await useTaskStore.getState().deleteTask(1);
      expect(useTaskStore.getState().tasks).toHaveLength(1);
      expect(useTaskStore.getState().tasks[0].id).toBe(2);
    });

    it("sets error on failure", async () => {
      const { deleteTask } = await import("@/lib/db");
      vi.mocked(deleteTask).mockRejectedValueOnce(new Error("DB error"));
      useTaskStore.setState({ tasks: [...mockTasks] });
      await useTaskStore.getState().deleteTask(1);
      expect(useTaskStore.getState().error).toBe("Error: DB error");
    });
  });

  describe("archiveTask", () => {
    it("optimistically removes task from list", async () => {
      useTaskStore.setState({ tasks: [...mockTasks] });
      await useTaskStore.getState().archiveTask(2);
      expect(useTaskStore.getState().tasks).toHaveLength(1);
      expect(useTaskStore.getState().tasks[0].id).toBe(1);
    });
  });

  describe("incrementPomos", () => {
    it("optimistically increments completed_pomos", async () => {
      useTaskStore.setState({ tasks: [...mockTasks] });
      await useTaskStore.getState().incrementPomos(1);
      const updated = useTaskStore.getState().tasks.find((t) => t.id === 1)!;
      expect(updated.completed_pomos).toBe(2);
    });

    it("does not affect other tasks", async () => {
      useTaskStore.setState({ tasks: [...mockTasks] });
      await useTaskStore.getState().incrementPomos(1);
      const other = useTaskStore.getState().tasks.find((t) => t.id === 2)!;
      expect(other.completed_pomos).toBe(5);
    });
  });
});
