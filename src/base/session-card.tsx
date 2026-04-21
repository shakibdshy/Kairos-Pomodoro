import { CheckCircle2 } from "lucide-react";
import type { Session } from "@/lib/session-utils";
import {
  formatTime,
  formatDuration,
} from "@/lib/session-utils";
import { cn } from "@/lib/cn";

interface SessionCardProps {
  session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <div className="group relative flex items-stretch gap-0 bg-white rounded-xl border border-sahara-border/15 overflow-hidden hover:border-sahara-border/30 transition-all">
      <div
        className={cn(
          "w-1 shrink-0",
          session.phase === "work" ? "bg-green-400" : "bg-blue-300"
        )}
      />

      <div className="flex-1 flex items-center justify-between px-4 py-3 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <CheckCircle2
            className={cn(
              "w-4 h-4 shrink-0",
              session.phase === "work"
                ? "text-green-500"
                : "text-blue-400"
            )}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-sahara-text capitalize truncate">
                {session.phase.replace("_", " ")}
              </p>
              {session.intention && (
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-sahara-card text-[10px] font-bold text-sahara-text-muted truncate max-w-[120px]">
                  {session.intention}
                </span>
              )}
            </div>
            <p className="text-[10px] text-sahara-text-muted font-medium tracking-wider uppercase mt-0.5">
              {formatTime(session.started_at)} —{" "}
              {session.ended_at ? formatTime(session.ended_at) : "In Progress"}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right ml-4">
          <p className="text-sm font-bold text-sahara-text-secondary tabular-nums">
            {formatDuration(session.duration_sec)}
          </p>
        </div>
      </div>
    </div>
  );
}
