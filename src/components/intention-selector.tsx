import { useState, useEffect } from "react";
import { useCategoriesStore } from "@/features/categories/use-categories-store";
import { Button } from "@/components/ui/button";
import { X, Plus, Search, Pencil, Check, ChevronDown } from "lucide-react";
import type { Category } from "@/lib/db";
import { cn } from "@/lib/cn";

interface IntentionSelectorProps {
  selectedCategory: Category | null;
  onSelect: (category: Category | null) => void;
  disabled?: boolean;
}

const PRESET_COLORS = [
  "#C17767",
  "#8B9E6B",
  "#4A7C59",
  "#5B8FA3",
  "#9B7EBD",
  "#D4A574",
  "#E07A5F",
  "#81B29A",
  "#F2CC8F",
  "#E76F51",
];

export function IntentionSelector({
  selectedCategory,
  onSelect,
  disabled = false,
}: IntentionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const categories = useCategoriesStore((s) => s.categories);
  const loadCategories = useCategoriesStore((s) => s.loadCategories);
  const addCategory = useCategoriesStore((s) => s.addCategory);
  const updateCategory = useCategoriesStore((s) => s.updateCategory);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen, loadCategories]);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelect = (category: Category | null) => {
    onSelect(category);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleAddNew = async () => {
    if (!newName.trim()) return;
    const category = await addCategory(newName.trim(), newColor);
    onSelect(category);
    setIsAddingNew(false);
    setNewName("");
    setNewColor(PRESET_COLORS[0]);
    setIsOpen(false);
  };

  const handleEditSave = async (id: number) => {
    if (!editName.trim()) return;
    await updateCategory(id, editName.trim(), editColor);
    if (selectedCategory?.id === id) {
      onSelect({
        ...selectedCategory,
        name: editName.trim(),
        color: editColor,
      });
    }
    setEditingId(null);
  };

  return (
    <>
      <Button
        variant="outline"
        intent={selectedCategory ? "sahara" : "default"}
        size="sm"
        shape="rounded-full"
        active={!!selectedCategory}
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={cn(
          "text-left",
          !selectedCategory && "border-dashed border-sahara-border/40 hover:border-sahara-primary/30",
          selectedCategory && "hover:shadow-md",
        )}
      >
        {selectedCategory ? (
          <>
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: selectedCategory.color }}
            />
            <span className="text-xs font-bold text-sahara-text tracking-wide">
              {selectedCategory.name}
            </span>
            <ChevronDown className="w-3 h-3 text-sahara-text-muted group-hover:text-sahara-text-secondary transition-colors" />
          </>
        ) : (
          <>
            <span className="text-[11px] font-medium text-sahara-text-muted tracking-wide">
              Set Intention
            </span>
            <ChevronDown className="w-3 h-3 text-sahara-text-muted group-hover:text-sahara-text-secondary transition-colors" />
          </>
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-sahara-surface rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-sahara-border/20">
              <h2 className="font-serif text-xl text-sahara-text">
                Categories
              </h2>
              <Button
                variant="ghost"
                size="icon"
                intent="default"
                shape="rounded-full"
                onClick={() => setIsOpen(false)}
                className="text-sahara-text-muted hover:text-sahara-text"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="px-6 pt-5 pb-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sahara-text-muted" />
                <input
                  type="text"
                  placeholder="Filter Categories"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-sahara-border/30 bg-sahara-bg/50 text-sm font-medium placeholder:text-sahara-text-muted focus:outline-none focus:border-sahara-primary/50 focus:ring-2 focus:ring-sahara-primary/10 transition-all"
                />
              </div>
            </div>

            {/* Categories List */}
            <div className="px-6 pb-4 max-h-64 overflow-y-auto">
              {filteredCategories.map((category) => (
                <div key={category.id} className="group">
                  {editingId === category.id ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sahara-bg/50 mb-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleEditSave(category.id)
                        }
                        className="flex-1 px-3 py-2 rounded-lg border border-sahara-border/30 text-sm font-medium focus:outline-none focus:border-sahara-primary"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        {PRESET_COLORS.slice(0, 6).map((color) => (
                          <button
                            key={color}
                            onClick={() => setEditColor(color)}
                            className={cn(
                              "w-5 h-5 rounded-full transition-transform",
                              editColor === color
                                ? "scale-125 ring-2 ring-offset-1 ring-sahara-border"
                                : "hover:scale-110",
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <Button
                        variant="solid"
                        intent="green"
                        size="icon-sm"
                        shape="rounded-lg"
                        onClick={() => handleEditSave(category.id)}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      intent="default"
                      fullWidth
                      shape="rounded-xl"
                      active={selectedCategory?.id === category.id}
                      onClick={() => handleSelect(category)}
                      className={cn(
                        "justify-between px-4 py-3 mb-1 group/item",
                        selectedCategory?.id === category.id
                          ? "bg-sahara-primary-light ring-1 ring-sahara-primary/20"
                          : "hover:bg-sahara-card",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span
                          className={cn(
                            "text-sm font-medium",
                            selectedCategory?.id === category.id
                              ? "text-sahara-primary font-bold"
                              : "text-sahara-text",
                          )}
                        >
                          {category.name}
                        </span>
                        {selectedCategory?.id === category.id && (
                          <span className="text-[10px] font-bold tracking-wider uppercase text-sahara-primary bg-sahara-primary/10 px-2 py-0.5 rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(category.id);
                          setEditName(category.name);
                          setEditColor(category.color);
                        }}
                        className="opacity-0 group-hover/item:opacity-100 text-sahara-text-muted hover:text-sahara-text-secondary hover:bg-sahara-card"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </Button>
                  )}
                </div>
              ))}

              {filteredCategories.length === 0 && !isAddingNew && (
                <p className="text-center text-sm text-sahara-text-muted py-6">
                  No categories found
                </p>
              )}

              {/* Add New Form */}
              {isAddingNew && (
                <div className="px-4 py-3 rounded-xl bg-sahara-bg/50 border border-dashed border-sahara-border/30 mb-1">
                  <input
                    type="text"
                    placeholder="Category name..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddNew()}
                    className="w-full px-3 py-2 rounded-lg border border-sahara-border/30 text-sm font-medium focus:outline-none focus:border-sahara-primary mb-3"
                    autoFocus
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewColor(color)}
                          className={cn(
                            "w-6 h-6 rounded-full transition-transform",
                            newColor === color
                              ? "scale-125 ring-2 ring-offset-1 ring-sahara-border"
                              : "hover:scale-110",
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="xs"
                        intent="default"
                        shape="rounded-lg"
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
                        size="xs"
                        shape="rounded-lg"
                        onClick={handleAddNew}
                        disabled={!newName.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {!isAddingNew && (
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
            )}
          </div>
        </div>
      )}
    </>
  );
}
