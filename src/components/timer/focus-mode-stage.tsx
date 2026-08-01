import {
  animate,
  m,
  useMotionValue,
  useReducedMotion,
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

const FULLSCREEN_VERTICAL_LIFT_RATIO = 0.05;
const FULLSCREEN_VERTICAL_LIFT_MAX = 64;

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
  const reducedMotion = useReducedMotion();

  const positionStage = useCallback(() => {
    const boundary = boundaryRef.current;
    const stage = stageRef.current;

    if (!boundary || !stage) return;

    const boundaryRect = boundary.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const fullscreenVerticalLift = Math.min(
      FULLSCREEN_VERTICAL_LIFT_MAX,
      boundaryRect.height * FULLSCREEN_VERTICAL_LIFT_RATIO,
    );
    const targetY = isFullscreenFocus
      ? boundaryRect.top + boundaryRect.height / 2 -
        (stageRect.top + stageRect.height / 2) -
        fullscreenVerticalLift
      : 0;

    animationRef.current?.stop();
    // Reduced-motion users should get the repositioning without the spring.
    if (reducedMotion) {
      y.set(targetY);
      return;
    }
    animationRef.current = animate(y, targetY, STAGE_TRANSITION);
  }, [boundaryRef, isFullscreenFocus, reducedMotion, y]);

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

      // In fullscreen, targetY is derived from the boundary/stage heights, so
      // a height change requires repositioning. Outside fullscreen targetY is a
      // fixed 0, so there is nothing to recompute on resize.
      if (heightChanged && isFullscreenFocus) schedulePositionStage(0);
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
