import { useState, useEffect, useCallback } from "react";
import { Text } from "@/ui/text";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getTodaySessions } from "@/lib/db";
import {
  type Session,
  formatTotalTime,
} from "@/lib/session-utils";
import { SessionCard } from "@/base/session-card";
import { SessionStatsCards } from "@/base/session-stats-cards";
import { TopCategoryBadge } from "@/base/top-category-badge";
import { SessionsEmptyState } from "@/base/sessions-empty-state";

export function TodaySessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const refreshSessions = useCallback(() => {
    getTodaySessions().then(setSessions);
  }, []);

  useEffect(() => {
    refreshSessions();
    const interval = setInterval(refreshSessions, 10000);
    return () => clearInterval(interval);
  }, [refreshSessions]);

  const totalFocusSec = sessions
    .filter((s) => s.phase === "work")
    .reduce((acc, s) => acc + s.duration_sec, 0);

  return (
    <div className="w-full border-t border-sahara-border/30 pt-8 mt-8">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between mb-6 group"
      >
        <div className="flex items-center gap-3">
          <Text variant="h3" className="font-serif text-2xl">
            Today's Sessions
          </Text>
          {sessions.length > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-sahara-primary/10 text-sahara-primary text-[10px] font-bold tracking-wider">
              {sessions.length} completed
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {sessions.length > 0 && !isCollapsed && (
            <span className="text-xs font-medium text-sahara-text-muted">
              Total Focus: {formatTotalTime(totalFocusSec)}
            </span>
          )}
          {isCollapsed ? (
            <ChevronDown className="w-5 h-5 text-sahara-text-muted group-hover:text-sahara-text-secondary transition-colors" />
          ) : (
            <ChevronUp className="w-5 h-5 text-sahara-text-muted group-hover:text-sahara-text-secondary transition-colors" />
          )}
        </div>
      </button>

      {!isCollapsed && (
        <>
          {sessions.length === 0 ? (
            <SessionsEmptyState />
          ) : (
            <>
              <SessionStatsCards sessions={sessions} />
              <TopCategoryBadge sessions={sessions} />
              <div className="space-y-2">
                {[...sessions].reverse().map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
