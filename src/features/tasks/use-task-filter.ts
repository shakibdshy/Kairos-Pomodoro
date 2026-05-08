import { useMemo } from "react";
import type { Task } from "@/features/tasks/task-types";

export function useTaskFilter(tasks: Task[], searchQuery: string) {
  return useMemo(() => {
    const filtered = tasks.filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.project || "").toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const active = filtered.filter(
      (t) => t.completed_pomos < t.estimated_pomos,
    );
    const done = filtered.filter(
      (t) => t.completed_pomos >= t.estimated_pomos,
    );

    return { filtered, active, done };
  }, [tasks, searchQuery]);
}
