import { CheckCircle2 } from "lucide-react";
import type { Session } from "@/lib/session-utils";
import { formatTime, formatDuration } from "@/lib/session-utils";
import { cn } from "@/lib/cn";

interface SessionCardProps {
  session: Session;
}

const MOOD_EMOJI: Record<string, string> = {
  great: "\u{1F604}",
  good: "\u{1F642}",
  okay: "\u{1F610}",
  bad: "\u{1F615}",
  terrible: "\u{1F61E}",
};

function getPhaseLabel(phase: string): string {
  if (phase === "work") return "Focus";
  if (phase === "short_break") return "Short Break";
  if (phase === "long_break") return "Long Break";
  return phase.replace("_", " ");
}

function getAccentColor(session: Session): string {
  if (session.category_color) return session.category_color;
  return session.phase === "work" ? "#22c55e" : "#60a5fa";
}

export function SessionCard({ session }: SessionCardProps) {
  const firstNoteLine = session.notes
    ? session.notes.split("\n")[0].trim()
    : null;

  return (
    <div className="group relative flex items-stretch gap-0 bg-sahara-surface rounded-xl border border-sahara-border/15 overflow-hidden hover:border-sahara-border/30 transition-all">
      <div
        className="w-1 shrink-0"
        style={{ backgroundColor: getAccentColor(session) }}
      />

      <div className="flex-1 flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 min-w-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <CheckCircle2
            className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0"
            style={{ color: getAccentColor(session) }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 md:gap-2">
              <p className="text-xs md:text-sm font-bold text-sahara-text capitalize truncate">
                {getPhaseLabel(session.phase)}
              </p>
              {session.intention && (
                <span className="shrink-0 px-1.5 md:px-2 py-0.5 rounded-full bg-sahara-card text-[9px] md:text-[10px] font-bold text-sahara-text-muted truncate max-w-20 md:max-w-30">
                  {session.intention}
                </span>
              )}
              {session.mood && MOOD_EMOJI[session.mood] && (
                <span className="shrink-0 text-xs md:text-sm" title={session.mood}>
                  {MOOD_EMOJI[session.mood]}
                </span>
              )}
            </div>
            <p className="text-[9px] md:text-[10px] text-sahara-text-muted font-medium tracking-wider uppercase mt-0.5">
              {formatTime(session.started_at)} &mdash;{" "}
              {session.ended_at
                ? formatTime(session.ended_at)
                : "In Progress"}
            </p>
            {firstNoteLine && (
              <p className="text-[9px] md:text-[10px] text-sahara-text-muted/60 mt-0.5 truncate max-w-48 md:max-w-72">
                {firstNoteLine}
              </p>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right ml-2 md:ml-4">
          <p className="text-xs md:text-sm font-bold text-sahara-text-secondary tabular-nums">
            {formatDuration(session.duration_sec)}
          </p>
        </div>
      </div>
    </div>
  );
}
