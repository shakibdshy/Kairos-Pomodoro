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
  loadCategories: () => Promise<void>;
  addCategory: (name: string, color?: string) => Promise<Category>;
  updateCategory: (id: number, name: string, color: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
}

export const useCategoriesStore = create<CategoriesStore>((set) => ({
  categories: [],
  isLoading: false,

  loadCategories: async () => {
    set({ isLoading: true });
    try {
      const categories = await getCategories();
      set({ categories, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addCategory: async (name: string, color?: string) => {
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
    }));
    return newCategory;
  },

  updateCategory: async (id: number, name: string, color: string) => {
    await updateCategory(id, name, color);
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, name, color } : c
      ),
    }));
  },

  deleteCategory: async (id: number) => {
    await deleteCategory(id);
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
  },
}));
