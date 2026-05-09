import { useState } from "react";
import { X, Plus, Check, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategoriesStore } from "@/features/categories/use-categories-store";
import type { Category } from "@/lib/db/types";

interface CategoryManagerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (category: Category) => void;
}

export function CategoryManager({
  open,
  onClose,
  onSelect,
}: CategoryManagerProps) {
  const categories = useCategoriesStore((s) => s.categories);
  const addCategory = useCategoriesStore((s) => s.addCategory);
  const updateCategory = useCategoriesStore((s) => s.updateCategory);
  const deleteCategory = useCategoriesStore((s) => s.deleteCategory);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    await deleteCategory(id);
    setDeleteConfirmId(null);
  };

  if (!open) return null;

  const handleSaveEdit = async (id: number, currentColor: string) => {
    if (!editName.trim()) return;
    await updateCategory(id, editName.trim(), currentColor);
    setEditingId(null);
  };

  const handleAddNew = async () => {
    if (!newName.trim()) return;
    const category = await addCategory(newName.trim());
    onSelect(category);
    setIsAddingNew(false);
    setNewName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-sahara-surface rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-sahara-border/20">
          <h2 className="font-serif text-xl text-sahara-text">
            {isAddingNew
              ? "New Category"
              : editingId
                ? "Edit Category"
                : "Categories"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            intent="default"
            shape="rounded-full"
            onClick={onClose}
            className="text-sahara-text-muted hover:text-sahara-text"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {isAddingNew ? (
          /* Add New Form */
          <div className="px-6 py-5 space-y-4">
            <input
              type="text"
              placeholder="Category name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddNew()}
              className="w-full px-4 py-3 rounded-xl border border-sahara-border/30 bg-sahara-bg/50 text-sm font-medium focus:outline-none focus:border-sahara-primary/50"
              autoFocus
            />
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => {
                  setIsAddingNew(false);
                  setNewName("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                intent="green"
                size="md"
                fullWidth
                onClick={handleAddNew}
                disabled={!newName.trim()}
                className="gap-2"
              >
                <Plus className="w-4 h-4" /> Create Category
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Categories List */}
            <div className="px-6 py-4 max-h-72 overflow-y-auto">
              {categories.length === 0 && (
                <p className="text-center text-sm text-sahara-text-muted py-6">
                  No categories yet
                </p>
              )}
              {categories.map((category) => (
                <div key={category.id}>
                  {editingId === category.id ? (
                    /* Edit Inline Form */
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sahara-bg/50 mb-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          handleSaveEdit(category.id, category.color)
                        }
                        className="flex-1 px-3 py-2 rounded-lg border border-sahara-border/30 text-sm font-medium focus:outline-none focus:border-sahara-primary"
                        autoFocus
                      />
                      <Button
                        variant="solid"
                        intent="green"
                        size="icon-sm"
                        shape="rounded-lg"
                        onClick={() =>
                          handleSaveEdit(category.id, category.color)
                        }
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    /* Display Row */
                    <div className="group flex items-center justify-between px-4 py-3 rounded-xl mb-1 hover:bg-sahara-card transition-colors">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-base font-medium text-sahara-text">
                          {category.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {deleteConfirmId === category.id ? (
                          <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-lg">
                            <span className="text-sm font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">
                              Delete?
                            </span>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="text-sm cursor-pointer font-bold text-white px-1.5 py-0.5 rounded bg-red-600 hover:bg-red-700 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-sm cursor-pointer font-medium text-sahara-text-muted hover:text-sahara-text px-1.5 py-0.5 rounded hover:bg-sahara-border/20 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => {
                                setEditingId(category.id);
                                setEditName(category.name);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-sahara-text-muted hover:text-sahara-text-secondary"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeleteConfirmId(category.id)}
                              className="opacity-0 group-hover:opacity-100 text-sahara-text-muted hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <Button
                variant="solid"
                intent="green"
                fullWidth
                onClick={() => setIsAddingNew(true)}
                className="gap-2 bg-green-500/90 hover:bg-green-500"
              >
                <Plus className="w-4 h-4" />
                ADD NEW CATEGORY
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
