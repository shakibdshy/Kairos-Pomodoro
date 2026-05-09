import { CheckCircle2 } from "lucide-react";
import type { Session } from "@/lib/session-utils";
import { formatTime, formatDuration } from "@/lib/session-utils";

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

  const accentColor = getAccentColor(session);
  const tagLabel = session.intention || session.category_name;

  return (
    <div className="group relative flex items-stretch gap-0 bg-sahara-surface rounded-2xl border border-sahara-border/15 overflow-hidden hover:border-sahara-border/40 hover:shadow-sm transition-all duration-300">
      <div
        className="w-1.5 shrink-0 transition-opacity group-hover:opacity-100"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex-1 flex items-center justify-between px-4 md:px-5 py-3.5 md:py-4 min-w-0">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-sahara-card/50 border border-sahara-border/10 shrink-0">
            <CheckCircle2
              className="w-4 h-4 md:w-5 md:h-5 shrink-0 transition-transform group-hover:scale-110 duration-300"
              style={{ color: accentColor }}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm md:text-base font-bold text-sahara-text capitalize tracking-tight">
                {getPhaseLabel(session.phase)}
              </p>

              {tagLabel && (
                <span
                  className="shrink-0 px-2.5 py-0.5 rounded-md text-[10px] md:text-[11px] font-bold tracking-wide uppercase"
                  style={{
                    backgroundColor: `${accentColor}15`,
                    color: accentColor,
                  }}
                >
                  {tagLabel}
                </span>
              )}

              {session.mood && MOOD_EMOJI[session.mood] && (
                <span
                  className="shrink-0 text-sm md:text-base ml-0.5"
                  title={session.mood}
                >
                  {MOOD_EMOJI[session.mood]}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1.5">
              <p className="text-xs md:text-sm text-sahara-text-secondary font-medium tabular-nums">
                {formatTime(session.started_at)} &mdash;{" "}
                {session.ended_at
                  ? formatTime(session.ended_at)
                  : "In Progress"}
              </p>
              {session.task_name && (
                <>
                  <span className="w-1 h-1 rounded-full bg-sahara-border/60" />
                  <p className="text-xs md:text-sm text-sahara-text-secondary font-medium truncate max-w-32 md:max-w-48">
                    {session.task_name}
                  </p>
                </>
              )}
            </div>

            {firstNoteLine && (
              <p className="text-xs md:text-sm text-sahara-text-muted mt-1.5 truncate max-w-48 md:max-w-72 border-l-2 border-sahara-border/30 pl-2">
                {firstNoteLine}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right ml-4">
          <p className="text-lg md:text-xl font-bold text-sahara-primary tabular-nums tracking-tight">
            {formatDuration(session.duration_sec)}
          </p>
        </div>
      </div>
    </div>
  );
}
