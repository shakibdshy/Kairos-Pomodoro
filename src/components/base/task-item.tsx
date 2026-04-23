import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { Task } from "@/features/tasks/task-types";

interface TaskItemProps {
  task: Task;
  isActive: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onSelect: () => void;
}

export function TaskItem({
  task,
  isActive,
  onToggle,
  onDelete,
  onSelect,
}: TaskItemProps) {
  const isComplete = task.completed_pomos >= task.estimated_pomos;

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors cursor-pointer",
        isActive
          ? "bg-sahara-primary-light border border-sahara-primary/30"
          : "hover:bg-sahara-card",
      )}
      onClick={onSelect}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
          isComplete
            ? "border-sahara-primary bg-sahara-primary text-white"
            : "border-sahara-border/40",
        )}
      >
        {isComplete && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <Text
          variant="body"
          className={cn(
            "truncate",
            isComplete && "line-through text-sahara-text-muted",
          )}
        >
          {task.name}
        </Text>
      </div>

      <span className="text-xs text-sahara-text-muted tabular-nums shrink-0">
        {task.completed_pomos}/{task.estimated_pomos}
      </span>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="shrink-0 opacity-0 group-hover:opacity-100 text-sahara-text-muted hover:text-sahara-primary"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </Button>
    </div>
  );
}
