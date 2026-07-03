import { cn } from "@/lib/cn";

interface ScoreRingProps {
  /** 0–100 */
  score: number;
  size?: number;
  label?: string;
  className?: string;
}

/** Compact circular progress ring for the daily productivity score. */
export function ScoreRing({ score, size = 96, label = "Today", className }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const stroke = Math.max(6, Math.round(size * 0.08));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={cn("flex flex-col items-center justify-center", className)}
      style={{ width: size }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-sahara-ring-track"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="stroke-sahara-primary transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-2xl md:text-3xl font-bold text-sahara-text tabular-nums leading-none">
            {clamped}
          </span>
          <span className="text-[8px] md:text-[9px] font-bold text-sahara-text-muted uppercase tracking-widest mt-0.5">
            / 100
          </span>
        </div>
      </div>
      {label && (
        <span className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-widest mt-2">
          {label}
        </span>
      )}
    </div>
  );
}
