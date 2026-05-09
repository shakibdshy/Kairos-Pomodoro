import { useState, useEffect } from "react";
import { useCategoriesStore } from "@/features/categories/use-categories-store";
import { Button } from "@/components/ui/button";
import { X, Plus, ChevronDown } from "lucide-react";
import { CategoryManager } from "@/components/base/category-manager";
import type { Category } from "@/lib/db/types";
import { cn } from "@/lib/cn";

interface IntentionSelectorProps {
  selectedCategory: Category | null;
  onSelect: (category: Category | null) => void;
  disabled?: boolean;
}

export function IntentionSelector({
  selectedCategory,
  onSelect,
  disabled = false,
}: IntentionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showManager, setShowManager] = useState(false);

  const categories = useCategoriesStore((s) => s.categories);
  const loadCategories = useCategoriesStore((s) => s.loadCategories);

  useEffect(() => {
    if (isOpen) loadCategories();
  }, [isOpen, loadCategories]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = () => setIsOpen(false);
    window.addEventListener("app:escape", handler);
    return () => window.removeEventListener("app:escape", handler);
  }, [isOpen]);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelect = (category: Category | null) => {
    onSelect(category);
    setIsOpen(false);
    setSearchQuery("");
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
          "text-left gap-1.5",
          !selectedCategory && "border border-sahara-border/20 bg-sahara-surface/30 hover:border-sahara-primary/30 hover:bg-sahara-surface/50",
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
            <ChevronDown className="w-3 h-3 text-sahara-text-muted" />
          </>
        ) : (
          <>
            <span className="text-[11px] font-medium text-sahara-text-muted tracking-wide">
              Set Intention
            </span>
            <ChevronDown className="w-3 h-3 text-sahara-text-muted" />
          </>
        )}
      </Button>

      {/* Selection Dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-sahara-surface rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-sahara-border/20">
              <h2 className="font-serif text-xl text-sahara-text">
                Set Intention
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

            <div className="px-6 pt-5 pb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter Categories"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sahara-border/30 bg-sahara-bg/50 text-sm font-medium placeholder:text-sahara-text-muted focus:outline-none focus:border-sahara-primary/50 focus:ring-2 focus:ring-sahara-primary/10 transition-all"
                />
              </div>
            </div>

            <div className="px-6 pb-4 max-h-64 overflow-y-auto">
              {filteredCategories.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  size="sm"
                  intent="default"
                  fullWidth
                  shape="rounded-xl"
                  active={selectedCategory?.id === category.id}
                  onClick={() => handleSelect(category)}
                  className={cn(
                    "justify-between px-4 py-3 mb-1",
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
                </Button>
              ))}

              {filteredCategories.length === 0 && (
                <p className="text-center text-sm text-sahara-text-muted py-6">
                  No categories found
                </p>
              )}
            </div>

            <div className="px-6 pb-6">
              <Button
                variant="solid"
                intent="green"
                fullWidth
                onClick={() => {
                  setIsOpen(false);
                  setShowManager(true);
                }}
                className="gap-2 bg-green-500/90 hover:bg-green-500"
              >
                <Plus className="w-4 h-4" />
                MANAGE CATEGORIES
              </Button>
            </div>
          </div>
        </div>
      )}

      <CategoryManager
        open={showManager}
        onClose={() => setShowManager(false)}
        onSelect={(category) => handleSelect(category)}
      />
    </>
  );
}
