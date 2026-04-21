import { Text } from "@/ui/text";
import type { Task } from "@/features/tasks/task-types";

interface TaskItemProps {
  task: Task;
  isActive: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onSelect: () => void;
}

export function TaskItem({ task, isActive, onToggle, onDelete, onSelect }: TaskItemProps) {
  return (
    <div
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors cursor-pointer ${
        isActive
          ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
          : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
      }`}
      onClick={onSelect}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
          task.completed_pomos >= task.estimated_pomos
            ? "border-green-500 bg-green-500 text-white"
            : "border-neutral-300 dark:border-neutral-600"
        }`}
      >
        {task.completed_pomos >= task.estimated_pomos && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <Text
          variant="body"
          className={`truncate ${
            task.completed_pomos >= task.estimated_pomos
              ? "line-through text-neutral-400"
              : ""
          }`}
        >
          {task.name}
        </Text>
      </div>

      <span className="text-xs text-neutral-400 tabular-nums shrink-0">
        {task.completed_pomos}/{task.estimated_pomos}
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="shrink-0 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
