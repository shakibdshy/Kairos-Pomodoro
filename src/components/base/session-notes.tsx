import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { getSessionNotes, type SessionNoteEntry } from "@/lib/db";
import { formatDuration } from "@/lib/session-utils";
import { formatTimeAmPm } from "@/lib/time";

const MOOD_EMOJI: Record<string, string> = {
  distracted: "😔",
  neutral: "😊",
  focused: "🤩",
};

function formatSessionTime(startedAt: string, endedAt: string | null): string {
  const start = new Date(startedAt);
  const end = endedAt ? new Date(endedAt) : new Date();
  return `${formatTimeAmPm(start)} – ${formatTimeAmPm(end)}`;
}

function formatSessionDate(startedAt: string): string {
  const date = new Date(startedAt);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface SessionNotesProps {
  startDate?: string;
  endDate?: string;
}

export function SessionNotes({ startDate, endDate }: SessionNotesProps) {
  const [notes, setNotes] = useState<SessionNoteEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSessionNotes(startDate, endDate)
      .then(setNotes)
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="bg-sahara-surface border border-sahara-border/20 rounded-xl md:rounded-2xl p-3.5 md:p-5">
        <p className="text-[15px] text-sahara-text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-sahara-surface border border-sahara-border/20 rounded-xl md:rounded-2xl p-3.5 md:p-5">
      {/* <h3 className="text-xs md:text-sm font-bold text-sahara-text-muted uppercase tracking-wider mb-4 md:mb-5">
        Session Notes
      </h3> */}

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <FileText className="w-8 h-8 text-sahara-text-muted/40" />
          <p className="text-[15px] text-sahara-text-muted text-center">
            No session notes yet
          </p>
          <p className="text-[15px] text-sahara-text-muted/60">
            Notes from finished sessions will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((entry) => (
            <div
              key={entry.id}
              className="group bg-sahara-bg/30 border border-sahara-border/10 rounded-xl p-3.5 md:p-4 hover:border-sahara-border/25 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {entry.mood && (
                    <span className="text-2xl">{MOOD_EMOJI[entry.mood] ?? "❓"}</span>
                  )}
                  {entry.category_name ? (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-sahara-border/20 bg-sahara-surface">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: entry.category_color ?? "#94a3b8" }}
                      />
                      <span
                        className="text-sm font-bold"
                        style={{ color: entry.category_color ?? "#94a3b8" }}
                      >
                        {entry.category_name}
                      </span>
                    </div>
                  ) : null}
                  {entry.task_name && (
                    <span className="text-[17px] font-bold text-sahara-text-muted uppercase tracking-wider">
                      → {entry.task_name}
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-sahara-text-muted tabular-nums">
                  {formatDuration(entry.duration_sec)}
                </span>
              </div>

              <p className="text-[17px] text-sahara-text-secondary leading-relaxed mb-2">
                {entry.notes}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs md:text-base text-sahara-text-muted font-medium">
                  {formatSessionDate(entry.started_at)}
                </span>
                <span className="text-xs md:text-base text-sahara-text-muted font-medium tabular-nums">
                  {formatSessionTime(entry.started_at, entry.ended_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
