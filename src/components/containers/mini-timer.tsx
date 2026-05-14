import { useTimerStore } from "@/features/timer/use-timer-store";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { formatSeconds, getPhaseColor } from "@/lib/time";
import { Pause, Play } from "lucide-react";

export function MiniTimer() {
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining);
  const phase = useTimerStore((s) => s.phase);
  const status = useTimerStore((s) => s.status);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);

  return (
    <div
      className="flex items-center gap-2 bg-sahara-surface/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-lg px-3 py-1.5 shadow-lg border border-neutral-200 dark:border-neutral-700 select-none"
      data-tauri-drag-region
    >
      <Text
        variant="body"
        className={`font-mono text-sm font-semibold ${getPhaseColor(phase)}`}
      >
        {formatSeconds(secondsRemaining)}
      </Text>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={
          status === "running"
            ? pause
            : status === "paused"
              ? resume
              : undefined
        }
        className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
      >
        {status === "running" ? (
          <Pause className="size-3" />
        ) : (
          <Play className="size-3" />
        )}
      </Button>
    </div>
  );
}
