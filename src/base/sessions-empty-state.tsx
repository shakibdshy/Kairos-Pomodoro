import { Sparkles } from "lucide-react";

export function SessionsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 bg-sahara-bg/30 rounded-2xl border border-dashed border-sahara-border/20">
      <Sparkles className="w-10 h-10 text-sahara-text-muted/40 mb-4" />
      <p className="font-serif text-lg text-sahara-text-secondary mb-2">
        No sessions yet today
      </p>
      <p className="text-sm text-sahara-text-muted text-center max-w-xs">
        Start your first focus session to begin tracking your deep work time.
      </p>
    </div>
  );
}
