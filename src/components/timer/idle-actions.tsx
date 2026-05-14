import { useTimerStore } from "@/features/timer/use-timer-store";
import { useUIStore } from "@/features/ui/use-ui-store";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Maximize2, Minimize2 } from "lucide-react";

interface IdleActionsProps {
  phase: "work" | "short_break" | "long_break";
  secondsRemaining: number;
  durations: { work: number; short: number; long: number };
  isFullscreenFocus: boolean;
}

export function IdleActions({
  phase,
  secondsRemaining,
  durations,
  isFullscreenFocus,
}: IdleActionsProps) {
  const start = useTimerStore((s) => s.start);
  const reset = useTimerStore((s) => s.reset);
  const setFullscreenFocus = useUIStore((s) => s.setFullscreenFocus);

  const isModified =
    (phase === "work" && secondsRemaining !== durations.work) ||
    (phase === "short_break" && secondsRemaining !== durations.short) ||
    (phase === "long_break" && secondsRemaining !== durations.long);

  return (
    <>
      <Button
        variant="solid"
        intent="sahara"
        size="lg"
        shape="rounded-full"
        onClick={() => {
          start();
          setFullscreenFocus(true);
        }}
        className="gap-1.5 md:gap-2 text-xs md:text-xs px-6 md:px-8 py-3 md:py-3.5"
      >
        <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current ml-0.5" />
        START FOCUS
      </Button>

      {isModified && (
        <>
          <div className="h-6 md:h-8 w-px bg-sahara-border/20 mx-0.5 md:mx-1 hidden sm:block" />
          <Button
            variant="outline"
            size="icon"
            intent="default"
            shape="rounded-full"
            aria-label="Reset"
            onClick={reset}
            className="border-sahara-border/30 text-sahara-text-secondary p-2 md:p-3"
          >
            <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </Button>
        </>
      )}

      <div className="h-6 md:h-8 w-px bg-sahara-border/20 mx-0.5 md:mx-1 hidden sm:block" />

      <FullscreenButton
        isFullscreenFocus={isFullscreenFocus}
        onClick={() => setFullscreenFocus(!isFullscreenFocus)}
      />
    </>
  );
}

export function FullscreenButton({
  isFullscreenFocus,
  onClick,
  size = "md",
}: {
  isFullscreenFocus: boolean;
  onClick: () => void;
  size?: "sm" | "md";
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      intent="default"
      shape="rounded-full"
      onClick={onClick}
      title={isFullscreenFocus ? "Exit Focus Mode" : "Enter Focus Mode"}
      className={
        size === "sm"
          ? "border-sahara-border/30 text-sahara-text-secondary hover:border-sahara-primary/40 hover:text-sahara-primary"
          : "border-sahara-border/30 text-sahara-text-secondary hover:border-sahara-primary/40 hover:text-sahara-primary p-2 md:p-3"
      }
    >
      {isFullscreenFocus ? (
        <Minimize2 className="w-3.5 h-3.5" />
      ) : (
        <Maximize2 className="w-3.5 h-3.5" />
      )}
    </Button>
  );
}
