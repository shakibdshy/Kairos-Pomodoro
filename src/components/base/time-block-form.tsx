import { useState, useEffect } from "react";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { Button } from "@/components/ui/button";
import { useCategoriesStore } from "@/features/categories/use-categories-store";
import { useTaskStore } from "@/features/tasks/use-task-store";
import type { TimeBlockWithMeta, TimeBlockInput } from "@/lib/db";
import { DEFAULT_CATEGORY_COLOR } from "@/lib/constants";

interface TimeBlockFormProps {
  open: boolean;
  onClose: () => void;
  /** Existing block when editing; null/undefined when creating. */
  block?: TimeBlockWithMeta | null;
  /** Default date for a new block (click-to-create). */
  defaultDate?: Date | null;
  /** Default start hour for a new block (from click position). */
  defaultHour?: number;
  onSubmit: (input: TimeBlockInput) => Promise<void>;
}

function toLocalInput(d: Date): string {
  // yyyy-MM-ddTHH:mm — what <input type="datetime-local"> expects.
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(s: string): string {
  // Convert datetime-local value to a full ISO datetime the DB stores.
  return new Date(s).toISOString();
}

export function TimeBlockForm({
  open,
  onClose,
  block,
  defaultDate,
  defaultHour,
  onSubmit,
}: TimeBlockFormProps) {
  const isEdit = !!block;
  const categories = useCategoriesStore((s) => s.categories);
  const loadCategories = useCategoriesStore((s) => s.loadCategories);
  const tasks = useTaskStore((s) => s.tasks);

  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [taskId, setTaskId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    loadCategories();

    if (block) {
      setTitle(block.title ?? "");
      setStart(toLocalInput(new Date(block.start_time)));
      setEnd(toLocalInput(new Date(block.end_time)));
      setTaskId(block.task_id ? String(block.task_id) : "");
      setCategoryId(block.category_id ? String(block.category_id) : "");
    } else {
      const base = defaultDate ?? new Date();
      const startD = new Date(base);
      startD.setHours(defaultHour ?? 9, 0, 0, 0);
      const endD = new Date(startD);
      endD.setMinutes(endD.getMinutes() + 25);
      setTitle("");
      setStart(toLocalInput(startD));
      setEnd(toLocalInput(endD));
      setTaskId("");
      setCategoryId("");
    }
  }, [open, block, defaultDate, defaultHour, loadCategories]);

  const handleSubmit = async () => {
    if (!start || !end) return;
    setSaving(true);
    try {
      const input: TimeBlockInput = {
        title: title.trim() || null,
        start_time: fromLocalInput(start),
        end_time: fromLocalInput(end),
        task_id: taskId ? Number(taskId) : null,
        category_id: categoryId ? Number(categoryId) : null,
        color: categoryId
          ? (categories.find((c) => c.id === Number(categoryId))?.color ?? null)
          : null,
      };
      await onSubmit(input);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const selectedCategoryColor = categoryId
    ? categories.find((c) => c.id === Number(categoryId))?.color
    : undefined;

  return (
    <ModalOverlay open={open} onClose={onClose} showCloseButton>
      <div className="px-6 py-5 border-b border-sahara-border/20">
        <h2 className="font-serif text-xl text-sahara-text">
          {isEdit ? "Edit Time Block" : "New Time Block"}
        </h2>
        <p className="text-xs text-sahara-text-muted mt-1">
          Plan a focus block on your calendar.
        </p>
      </div>

      <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Title */}
        <div>
          <label className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-widest">
            Title (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Deep work on report"
            className="w-full mt-2 px-4 py-3 bg-sahara-bg/40 border border-sahara-border/20 rounded-xl text-sm text-sahara-text placeholder:text-sahara-text-muted/50 focus:outline-none focus:border-sahara-primary/50 focus:ring-2 focus:ring-sahara-primary/10 transition-all"
          />
        </div>

        {/* Time range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-widest">
              Start
            </label>
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full mt-2 px-4 py-3 rounded-xl border border-sahara-border/30 bg-sahara-bg/40 text-sm font-medium text-sahara-text focus:outline-none focus:border-sahara-primary/50 focus:ring-2 focus:ring-sahara-primary/10 transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-widest">
              End
            </label>
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full mt-2 px-4 py-3 rounded-xl border border-sahara-border/30 bg-sahara-bg/40 text-sm font-medium text-sahara-text focus:outline-none focus:border-sahara-primary/50 focus:ring-2 focus:ring-sahara-primary/10 transition-all"
            />
          </div>
        </div>

        {/* Task link */}
        {tasks.length > 0 && (
          <div>
            <label className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-widest">
              Task (optional)
            </label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="w-full mt-2 px-4 py-3 bg-sahara-bg/40 border border-sahara-border/20 rounded-xl text-sm text-sahara-text focus:outline-none focus:border-sahara-primary/50 focus:ring-2 focus:ring-sahara-primary/10 transition-all appearance-none cursor-pointer"
            >
              <option value="">None</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category */}
        <div>
          <label className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-widest">
            Category (optional)
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              type="button"
              onClick={() => setCategoryId("")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                categoryId === ""
                  ? "border-sahara-primary bg-sahara-primary-light"
                  : "border-sahara-border/30 text-sahara-text-muted hover:border-sahara-primary/30"
              }`}
            >
              None
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(String(c.id))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                  categoryId === String(c.id)
                    ? "border-sahara-primary bg-sahara-primary-light"
                    : "border-sahara-border/30 text-sahara-text-muted hover:border-sahara-primary/30"
                }`}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: c.color || DEFAULT_CATEGORY_COLOR }}
                />
                {c.name}
              </button>
            ))}
          </div>
          {selectedCategoryColor && (
            <p className="text-[10px] text-sahara-text-muted mt-2">
              Block will use this category's color.
            </p>
          )}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-sahara-border/20 flex justify-end gap-2">
        <Button
          variant="ghost"
          intent="default"
          size="sm"
          onClick={onClose}
          className="text-[11px]"
        >
          Cancel
        </Button>
        <Button
          variant="solid"
          intent="sahara"
          size="sm"
          onClick={handleSubmit}
          disabled={saving || !start || !end}
          className="text-[11px]"
        >
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Block"}
        </Button>
      </div>
    </ModalOverlay>
  );
}
