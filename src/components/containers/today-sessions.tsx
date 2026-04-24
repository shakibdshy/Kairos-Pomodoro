import { useState, useEffect, useCallback } from "react";
import { Text } from "@/components/ui/text";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getTodaySessions } from "@/lib/db";
import type { Session } from "@/lib/db";
import { formatTotalTime } from "@/lib/session-utils";
import { SessionCard } from "@/components/base/session-card";
import { SessionStatsCards } from "@/components/base/session-stats-cards";
import { TopCategoryBadge } from "@/components/base/top-category-badge";
import { SessionsEmptyState } from "@/components/base/sessions-empty-state";

export function TodaySessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const refreshSessions = useCallback(async () => {
    try {
      const data = await getTodaySessions();
      setSessions(data);
    } catch (err) {
      console.error("[TodaySessions] Failed to refresh:", err);
    }
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
    <div className="w-full border-t border-sahara-border/30 pt-6 md:pt-8 mt-6 md:mt-8">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between mb-4 md:mb-6 group"
      >
        <div className="flex items-center gap-2 md:gap-3">
          <Text variant="h3" className="font-serif text-xl md:text-2xl">
            Today's Sessions
          </Text>
          {sessions.length > 0 && (
            <span className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-sahara-primary/10 text-sahara-primary text-[9px] md:text-[10px] font-bold tracking-wider">
              {sessions.length} completed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {sessions.length > 0 && !isCollapsed && (
            <span className="text-[10px] md:text-xs font-medium text-sahara-text-muted hidden sm:block">
              Total Focus: {formatTotalTime(totalFocusSec)}
            </span>
          )}
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-sahara-text-muted group-hover:text-sahara-text-secondary transition-colors" />
          ) : (
            <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-sahara-text-muted group-hover:text-sahara-text-secondary transition-colors" />
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
              <div className="space-y-1.5 md:space-y-2">
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
