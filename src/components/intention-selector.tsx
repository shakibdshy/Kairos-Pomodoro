import { useState } from "react";
import { useCategoriesStore } from "@/features/categories/use-categories-store";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import { CategoryManager } from "@/components/base/category-manager";
import type { Category } from "@/lib/db";
import { cn } from "@/lib/cn";
import { ModalOverlay } from "@/components/ui/modal-overlay";

interface IntentionSelectorProps {
  selectedCategory: Category | null;
  onSelect: (category: Category | null) => void;
  /** Current free-text intention (controlled). */
  customIntention?: string | null;
  /** Called when the user edits the free-text intention. */
  onCustomIntentionChange?: (intention: string | null) => void;
  disabled?: boolean;
}

export function IntentionSelector({
  selectedCategory,
  onSelect,
  customIntention,
  onCustomIntentionChange,
  disabled = false,
}: IntentionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showManager, setShowManager] = useState(false);

  const categories = useCategoriesStore((s) => s.categories);
  const loadCategories = useCategoriesStore((s) => s.loadCategories);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelect = (category: Category | null) => {
    onSelect(category);
    setIsOpen(false);
    setSearchQuery("");
  };

  // The label shown on the trigger button: free-text wins, else category, else prompt.
  const displayLabel = customIntention || selectedCategory?.name;

  return (
    <>
      <Button
        variant="outline"
        intent={selectedCategory ? "sahara" : "default"}
        size="sm"
        shape="rounded-full"
        active={!!selectedCategory}
        onClick={() => { if (!disabled) { loadCategories(); setIsOpen(true); } }}
        disabled={disabled}
        className={cn(
          "text-left gap-1.5",
          !selectedCategory && "border border-sahara-border/20 bg-sahara-surface/30 hover:border-sahara-primary/30 hover:bg-sahara-surface/50",
          selectedCategory && "hover:shadow-md",
        )}
      >
        {displayLabel ? (
          <>
            {selectedCategory && (
              <div
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: selectedCategory.color }}
              />
            )}
            <span className="text-xs font-bold text-sahara-text tracking-wide truncate max-w-[160px]">
              {displayLabel}
            </span>
            <ChevronDown className="size-3 text-sahara-text-muted" />
          </>
        ) : (
          <>
            <span className="text-[11px] font-medium text-sahara-text-muted tracking-wide">
              Set Intention
            </span>
            <ChevronDown className="size-3 text-sahara-text-muted" />
          </>
        )}
      </Button>

      <ModalOverlay open={isOpen} onClose={() => setIsOpen(false)} showCloseButton>
        <div className="px-6 py-5 border-b border-sahara-border/20">
          <h2 className="font-serif text-xl text-sahara-text">
            Set Intention
          </h2>
          <p className="text-xs text-sahara-text-muted mt-1">
            Name what you want to focus on this session.
          </p>
        </div>

        {/* Free-text intention prompt */}
        {onCustomIntentionChange && (
          <div className="px-6 pt-5">
            <label className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-widest">
              What's your focus?
            </label>
            <input
              type="text"
              placeholder="e.g. Draft the intro without editing"
              value={customIntention ?? ""}
              onChange={(e) => onCustomIntentionChange(e.target.value || null)}
              className="w-full mt-2 px-4 py-3 rounded-xl border border-sahara-border/30 bg-sahara-bg/50 text-sm font-medium placeholder:text-sahara-text-muted focus:outline-none focus:border-sahara-primary/50 focus:ring-2 focus:ring-sahara-primary/10 transition-all"
            />
          </div>
        )}

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
                  className="size-3 rounded-full shrink-0"
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
            <Plus className="size-4" />
            MANAGE CATEGORIES
          </Button>
        </div>
      </ModalOverlay>

      <CategoryManager
        open={showManager}
        onClose={() => setShowManager(false)}
        onSelect={(category) => handleSelect(category)}
      />
    </>
  );
}
