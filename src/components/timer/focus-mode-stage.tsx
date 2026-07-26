import {
  animate,
  m,
  useMotionValue,
  type AnimationPlaybackControls,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/cn";

interface FocusModeStageProps {
  boundaryRef: RefObject<HTMLDivElement | null>;
  isFullscreenFocus: boolean;
  children: ReactNode;
  className?: string;
}

const STAGE_TRANSITION = {
  type: "spring" as const,
  stiffness: 190,
  damping: 26,
  mass: 0.85,
};

export function FocusModeStage({
  boundaryRef,
  isFullscreenFocus,
  children,
  className,
}: FocusModeStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const animationRef = useRef<AnimationPlaybackControls | null>(null);
  const positionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const positionStage = useCallback(() => {
    const boundary = boundaryRef.current;
    const stage = stageRef.current;

    if (!boundary || !stage) return;

    const boundaryRect = boundary.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const targetY = isFullscreenFocus
      ? boundaryRect.top + boundaryRect.height / 2 -
        (stageRect.top + stageRect.height / 2)
      : 0;

    animationRef.current?.stop();
    animationRef.current = animate(y, targetY, STAGE_TRANSITION);
  }, [boundaryRef, isFullscreenFocus, y]);

  const schedulePositionStage = useCallback(
    (delay: number) => {
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }

      positionTimeoutRef.current = setTimeout(() => {
        positionTimeoutRef.current = null;
        positionStage();
      }, delay);
    },
    [positionStage],
  );

  useLayoutEffect(() => {
    schedulePositionStage(isFullscreenFocus ? 320 : 0);
  }, [isFullscreenFocus, schedulePositionStage]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;

    const previousHeights = new WeakMap<Element, number>();
    const observer = new ResizeObserver((entries) => {
      const heightChanged = entries.some((entry) => {
        const nextHeight = entry.contentRect.height;
        const previousHeight = previousHeights.get(entry.target);

        previousHeights.set(entry.target, nextHeight);

        return (
          previousHeight === undefined ||
          Math.abs(previousHeight - nextHeight) > 0.5
        );
      });

      if (heightChanged && !isFullscreenFocus) schedulePositionStage(0);
    });
    const boundary = boundaryRef.current;
    const stage = stageRef.current;

    if (boundary) observer.observe(boundary);
    if (stage) observer.observe(stage);

    return () => observer.disconnect();
  }, [
    boundaryRef,
    isFullscreenFocus,
    schedulePositionStage,
  ]);

  useEffect(() => {
    return () => {
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }
      animationRef.current?.stop();
    };
  }, []);

  return (
    <div
      ref={stageRef}
      data-focus-mode-stage
      className={cn("w-fit max-w-full", className)}
    >
      <m.div style={{ y }}>{children}</m.div>
    </div>
  );
}
