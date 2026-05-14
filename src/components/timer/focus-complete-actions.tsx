import { useTimerStore } from "@/features/timer/use-timer-store";
import { useUIStore } from "@/features/ui/use-ui-store";
import { Button } from "@/components/ui/button";
import { Coffee, Flag, Pause } from "lucide-react";
import { FullscreenButton } from "@/components/timer/idle-actions";

interface FocusCompleteActionsProps {
  isWorkPhase: boolean;
  overtimeSeconds: number;
  isFullscreenFocus: boolean;
  onStartBreak: () => void;
}

export function FocusCompleteActions({
  isWorkPhase,
  overtimeSeconds,
  isFullscreenFocus,
  onStartBreak,
}: FocusCompleteActionsProps) {
  const pause = useTimerStore((s) => s.pause);
  const endWithoutBreak = useTimerStore((s) => s.endWithoutBreak);

  return (
    <>
      <Button
        variant="solid"
        intent="emerald"
        size="md"
        shape="rounded-full"
        onClick={onStartBreak}
        className="gap-1.5 md:gap-2 text-[10px] md:text-xs"
      >
        <Coffee className="size-3.5 md:w-4 md:h-4" />
        {isWorkPhase ? "Start Break" : "Back to Work"}
      </Button>

      <Button
        variant="outline"
        intent="slate"
        size="sm"
        shape="rounded-full"
        onClick={() => endWithoutBreak()}
        className="gap-1 md:gap-1.5 text-[10px]"
      >
        <Flag className="size-3.5 md:w-4 md:h-4" />
        End Session
      </Button>

      <div className="h-6 md:h-8 w-px bg-sahara-border/20 mx-0.5 md:mx-1 hidden sm:block" />

      {overtimeSeconds > 0 && (
        <Button
          variant="solid"
          intent="sahara"
          size="md"
          shape="rounded-full"
          onClick={pause}
          className="gap-1.5 md:gap-2 text-[10px] md:text-xs"
        >
          <Pause className="size-3.5 md:w-4 md:h-4 fill-current" />
          Pause Overtime
        </Button>
      )}

      <div className="h-6 md:h-8 w-px bg-sahara-border/20 mx-0.5 md:mx-1 hidden sm:block" />

      <FullscreenButton
        isFullscreenFocus={isFullscreenFocus}
        onClick={() => useUIStore.getState().setFullscreenFocus(!isFullscreenFocus)}
      />
    </>
  );
}
