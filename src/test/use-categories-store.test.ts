import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCategoriesStore } from "@/features/categories/use-categories-store";

vi.mock("@/lib/db", () => ({
  getCategories: vi.fn().mockResolvedValue([
    { id: 1, name: "Work", color: "#FF0000", created_at: "2026-01-01" },
    { id: 2, name: "Personal", color: "#00FF00", created_at: "2026-01-02" },
  ]),
  addCategory: vi.fn().mockResolvedValue(3),
  updateCategory: vi.fn().mockResolvedValue(undefined),
  deleteCategory: vi.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
  vi.clearAllMocks();
  useCategoriesStore.setState({ categories: [], isLoading: false });
});

describe("useCategoriesStore", () => {
  describe("initial state", () => {
    it("has correct defaults", () => {
      const state = useCategoriesStore.getState();
      expect(state.categories).toEqual([]);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("loadCategories", () => {
    it("loads categories from db", async () => {
      await useCategoriesStore.getState().loadCategories();
      const state = useCategoriesStore.getState();
      expect(state.categories).toHaveLength(2);
      expect(state.categories[0].name).toBe("Work");
      expect(state.isLoading).toBe(false);
    });

    it("sets isLoading during fetch", async () => {
      const promise = useCategoriesStore.getState().loadCategories();
      expect(useCategoriesStore.getState().isLoading).toBe(true);
      await promise;
      expect(useCategoriesStore.getState().isLoading).toBe(false);
    });

    it("sets isLoading false on error", async () => {
      const { getCategories } = await import("@/lib/db");
      vi.mocked(getCategories).mockRejectedValueOnce(new Error("fail"));
      await useCategoriesStore.getState().loadCategories();
      expect(useCategoriesStore.getState().isLoading).toBe(false);
    });
  });

  describe("addCategory", () => {
    it("appends new category to state", async () => {
      const category = await useCategoriesStore.getState().addCategory("Focus", "#FF0000");
      expect(category.name).toBe("Focus");
      expect(category.color).toBe("#FF0000");
      expect(category.id).toBe(3);
      expect(useCategoriesStore.getState().categories).toHaveLength(1);
    });

    it("assigns a random HSL color when not specified", async () => {
      const category = await useCategoriesStore.getState().addCategory("No Color");
      expect(category.color).toMatch(/^#[0-9a-f]{6}$/);
    });

    it("assigns a random color regardless of existing categories", async () => {
      useCategoriesStore.setState({
        categories: [
          { id: 1, name: "A", color: "#C17767", created_at: "" },
          { id: 2, name: "B", color: "#8B9E6B", created_at: "" },
        ],
      });
      const category = await useCategoriesStore.getState().addCategory("C");
      expect(category.color).toMatch(/^#[0-9a-f]{6}$/);
    });
  });

  describe("updateCategory", () => {
    it("updates category in state", async () => {
      useCategoriesStore.setState({
        categories: [
          { id: 1, name: "Old", color: "#000", created_at: "" },
        ],
      });
      await useCategoriesStore.getState().updateCategory(1, "New", "#FFF");
      const updated = useCategoriesStore.getState().categories[0];
      expect(updated.name).toBe("New");
      expect(updated.color).toBe("#FFF");
    });
  });

  describe("deleteCategory", () => {
    it("removes category from state", async () => {
      useCategoriesStore.setState({
        categories: [
          { id: 1, name: "A", color: "#000", created_at: "" },
          { id: 2, name: "B", color: "#111", created_at: "" },
        ],
      });
      await useCategoriesStore.getState().deleteCategory(1);
      expect(useCategoriesStore.getState().categories).toHaveLength(1);
      expect(useCategoriesStore.getState().categories[0].id).toBe(2);
    });
  });
});
