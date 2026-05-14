import { create } from "zustand";
import type { Category } from "@/lib/db";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/db";
import { generateCategoryColor } from "@/lib/category-colors";

interface CategoriesStore {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  loadCategories: () => Promise<void>;
  addCategory: (name: string, color?: string) => Promise<Category>;
  updateCategory: (id: number, name: string, color: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
}

export const useCategoriesStore = create<CategoriesStore>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  loadCategories: async () => {
    set({ isLoading: true });
    try {
      const categories = await getCategories();
      set({ categories, isLoading: false, error: null });
    } catch (err) {
      console.error("[CategoriesStore] Failed to load categories:", err);
      set({ isLoading: false, error: String(err) });
    }
  },

  addCategory: async (name: string, color?: string) => {
    try {
      const categoryColor = color || generateCategoryColor();
      const id = await addCategory(name, categoryColor);
      const newCategory: Category = {
        id,
        name,
        color: categoryColor,
        created_at: new Date().toISOString(),
      };
      set((state) => ({
        categories: [...state.categories, newCategory],
        error: null,
      }));
      return newCategory;
    } catch (err) {
      console.error("[CategoriesStore] Failed to add category:", err);
      set({ error: String(err) });
      throw err;
    }
  },

  updateCategory: async (id: number, name: string, color: string) => {
    try {
      await updateCategory(id, name, color);
      set((state) => ({
        categories: state.categories.map((c) =>
          c.id === id ? { ...c, name, color } : c,
        ),
        error: null,
      }));
    } catch (err) {
      console.error("[CategoriesStore] Failed to update category:", err);
      set({ error: String(err) });
    }
  },

  deleteCategory: async (id: number) => {
    try {
      await deleteCategory(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        error: null,
      }));
    } catch (err) {
      console.error("[CategoriesStore] Failed to delete category:", err);
      set({ error: String(err) });
    }
  },
}));
