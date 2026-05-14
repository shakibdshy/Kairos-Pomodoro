import { useTimerStore } from "@/features/timer/use-timer-store";
import { useUIStore } from "@/features/ui/use-ui-store";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { FullscreenButton } from "@/components/timer/idle-actions";
import type { TimerStatus } from "@/features/timer/timer-types";

interface RunningActionsProps {
  status: TimerStatus;
  isFullscreenFocus: boolean;
  onFinish: () => void;
  onAbandon: () => void;
}

export function RunningActions({
  status,
  isFullscreenFocus,
  onFinish,
  onAbandon,
}: RunningActionsProps) {
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);
  const reset = useTimerStore((s) => s.reset);

  return (
    <>
      {status === "running" ? (
        <Button
          variant="solid"
          intent="sahara"
          size="md"
          shape="rounded-full"
          onClick={pause}
          className="gap-1.5 md:gap-2 text-[10px] md:text-xs"
        >
          <Pause className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
          PAUSE
        </Button>
      ) : (
        <Button
          variant="solid"
          intent="sahara"
          size="md"
          shape="rounded-full"
          onClick={resume}
          className="gap-1.5 md:gap-2 text-[10px] md:text-xs"
        >
          <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current ml-0.5" />
          RESUME
        </Button>
      )}

      <Separator />

      <Button
        variant="outline"
        intent="green"
        size="sm"
        shape="rounded-full"
        onClick={onFinish}
        className="gap-1 md:gap-1.5 text-[10px]"
      >
        <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
        Finish
      </Button>

      <Button
        variant="outline"
        intent="red"
        size="sm"
        shape="rounded-full"
        onClick={onAbandon}
        className="gap-1 md:gap-1.5 text-[10px]"
      >
        <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
        Abandon
      </Button>

      <Separator />

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

      <Separator />

      <FullscreenButton
        isFullscreenFocus={isFullscreenFocus}
        onClick={() => useUIStore.getState().setFullscreenFocus(!isFullscreenFocus)}
      />
    </>
  );
}

function Separator() {
  return (
    <div className="h-6 md:h-8 w-px bg-sahara-border/20 mx-0.5 md:mx-1 hidden sm:block" />
  );
}
