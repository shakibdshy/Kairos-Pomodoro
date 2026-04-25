import { useState, useEffect } from "react";
import { X, Plus, Edit3, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Task } from "@/features/tasks/task-types";
import type { Category } from "@/lib/db";
import { getCategories } from "@/lib/db";

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    estimatedPomos: number;
    project: string;
    priority: string;
    categoryId: number | null;
  }) => void;
  editTask?: Task | null;
}

const PRIORITY_OPTIONS = [
  { value: "", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function AddTaskModal({
  open,
  onClose,
  onSubmit,
  editTask,
}: AddTaskModalProps) {
  const [name, setName] = useState("");
  const [estimatedPomos, setEstimatedPomos] = useState(4);
  const [project, setProject] = useState("");
  const [priority, setPriority] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (open) {
      getCategories()
        .then(setCategories)
        .catch((err) => {
          console.error("[AddTaskModal] Failed to load categories:", err);
          setCategories([]);
        });
    }
  }, [open]);

  useEffect(() => {
    if (editTask) {
      setName(editTask.name);
      setEstimatedPomos(editTask.estimated_pomos);
      setProject(editTask.project || "");
      setPriority(editTask.priority || "");
      setCategoryId(editTask.category_id ?? null);
    } else {
      setName("");
      setEstimatedPomos(4);
      setProject("");
      setPriority("");
      setCategoryId(null);
    }
  }, [editTask, open]);

  useEffect(() => {
    if (!open) return;
    const handler = () => onClose();
    window.addEventListener("app:escape", handler);
    return () => window.removeEventListener("app:escape", handler);
  }, [open, onClose]);

  if (!open) return null;

  const isEditing = !!editTask;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      estimatedPomos,
      project: project.trim() || "",
      priority: priority || "",
      categoryId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-sahara-text/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-sahara-surface rounded-2xl border border-sahara-border/20 shadow-xl w-full max-w-md mx-4 p-8 animate-in fade-in zoom-in-95 duration-200">
        <Button
          variant="ghost"
          size="icon-lg"
          intent="default"
          shape="rounded-lg"
          onClick={onClose}
          className="absolute top-4 right-4 text-sahara-text-muted hover:text-sahara-text hover:bg-sahara-bg"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-sahara-primary-light flex items-center justify-center text-sahara-primary">
            {isEditing ? (
              <Edit3 className="w-5 h-5" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-serif text-xl text-sahara-text font-semibold">
              {isEditing ? "Edit Task" : "New Task"}
            </h3>
            <p className="text-xs text-sahara-text-muted mt-0.5">
              {isEditing ? "Update task details" : "Add a task to focus on"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-sahara-text-muted uppercase tracking-wider mb-1.5">
              Task Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What are you working on?"
              autoFocus
              className="w-full px-4 py-3 bg-sahara-bg/40 border border-sahara-border/20 rounded-xl text-sm text-sahara-text placeholder:text-sahara-text-muted/50 focus:outline-none focus:border-sahara-primary/50 focus:ring-2 focus:ring-sahara-primary/10 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-sahara-text-muted uppercase tracking-wider mb-1.5">
                Estimated Pomos
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={estimatedPomos}
                onChange={(e) =>
                  setEstimatedPomos(
                    Math.max(1, parseInt(e.target.value, 10) || 1),
                  )
                }
                className="w-full px-4 py-3 bg-sahara-bg/40 border border-sahara-border/20 rounded-xl text-sm text-sahara-text tabular-nums focus:outline-none focus:border-sahara-primary/50 focus:ring-2 focus:ring-sahara-primary/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-sahara-text-muted uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 bg-sahara-bg/40 border border-sahara-border/20 rounded-xl text-sm text-sahara-text focus:outline-none focus:border-sahara-primary/50 focus:ring-2 focus:ring-sahara-primary/10 transition-all appearance-none cursor-pointer"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-sahara-text-muted uppercase tracking-wider mb-1.5">
              <span className="inline-flex items-center gap-1.5">
                <Tag className="w-3 h-3" />
                Category (Intent)
              </span>
            </label>
            <select
              value={categoryId ?? ""}
              onChange={(e) =>
                setCategoryId(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full px-4 py-3 bg-sahara-bg/40 border border-sahara-border/20 rounded-xl text-sm text-sahara-text focus:outline-none focus:border-sahara-primary/50 focus:ring-2 focus:ring-sahara-primary/10 transition-all appearance-none cursor-pointer"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {categoryId && (
              <div className="flex items-center gap-2 mt-2">
                {categories
                  .filter((c) => c.id === categoryId)
                  .map((cat) => (
                    <span
                      key={cat.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${cat.color}18`,
                        color: cat.color,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </span>
                  ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-sahara-text-muted uppercase tracking-wider mb-1.5">
              Project (Container)
            </label>
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="e.g., Kairos-Pomodoro, Client Work"
              className="w-full px-4 py-3 bg-sahara-bg/40 border border-sahara-border/20 rounded-xl text-sm text-sahara-text placeholder:text-sahara-text-muted/50 focus:outline-none focus:border-sahara-primary/50 focus:ring-2 focus:ring-sahara-primary/10 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              intent="default"
              size="md"
              fullWidth
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="solid"
              intent={name.trim() ? "sahara" : "default"}
              fullWidth
              disabled={!name.trim()}
              className="gap-2"
            >
              {isEditing ? (
                <>
                  <Edit3 className="w-4 h-4" /> SAVE CHANGES
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> CREATE TASK
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
