import { useTimerStore } from "@/features/timer/use-timer-store";
import { Text } from "@/ui/text";
import { formatSeconds, getPhaseColor } from "@/lib/time";

export function MiniTimer() {
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining);
  const phase = useTimerStore((s) => s.phase);
  const status = useTimerStore((s) => s.status);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);

  return (
    <div
      className="flex items-center gap-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-lg px-3 py-1.5 shadow-lg border border-neutral-200 dark:border-neutral-700 select-none"
      data-tauri-drag-region
    >
      <Text
        variant="body"
        className={`font-mono text-sm font-semibold ${getPhaseColor(phase)}`}
      >
        {formatSeconds(secondsRemaining)}
      </Text>
      <button
        onClick={status === "running" ? pause : status === "paused" ? resume : undefined}
        className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
      >
        {status === "running" ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}
