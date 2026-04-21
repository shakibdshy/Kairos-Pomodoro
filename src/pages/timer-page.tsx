import { useState, useEffect } from "react";
import { MainLayout } from "@/template/main-layout";
import { TimerControls } from "@/containers/timer-controls";
import { TaskList } from "@/containers/task-list";
import { Text } from "@/ui/text";
import { Clock, CheckCircle2 } from "lucide-react";
import type { Route } from "@/app/router";
import { getTodaySessions } from "@/lib/db";
import { cn } from "@/lib/cn";

interface Session {
  id: number;
  task_id: number | null;
  phase: string;
  started_at: string;
  ended_at: string | null;
  duration_sec: number;
  completed: number;
}

interface TimerPageProps {
  onNavigate: (route: Route) => void;
  currentRoute: Route;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function TodaySessions() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    getTodaySessions().then(setSessions);
  }, []);

  if (sessions.length === 0) return null;

  const totalFocusTime = sessions
    .filter((s: Session) => s.phase === "work")
    .reduce((acc: number, s: Session) => acc + s.duration_sec, 0);

  return (
    <div className="w-full border-t border-sahara-border/30 pt-8 mt-8">
      <div className="flex items-center justify-between mb-6">
        <Text variant="h3" className="font-serif text-2xl">
          Today's Sessions
        </Text>
        <div className="flex items-center gap-2 text-sahara-text-muted">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wider uppercase">
            Total Focus: {formatDuration(totalFocusTime)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {sessions.map((session: Session) => (
          <div
            key={session.id}
            className="flex items-center justify-between px-5 py-3 bg-white rounded-xl border border-sahara-border/20"
          >
            <div className="flex items-center gap-4">
              <CheckCircle2 className={cn(
                "w-4 h-4",
                session.phase === "work" ? "text-green-500" : "text-blue-400"
              )} />
              <div>
                <p className="text-sm font-bold text-sahara-text capitalize">
                  {session.phase.replace("_", " ")}
                </p>
                <p className="text-[10px] text-sahara-text-muted font-medium tracking-wider uppercase">
                  {formatTime(session.started_at)} — {session.ended_at ? formatTime(session.ended_at) : "In Progress"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-sahara-text-secondary tabular-nums">
                {formatDuration(session.duration_sec)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimerPage({ onNavigate, currentRoute }: TimerPageProps) {
  return (
    <MainLayout onNavigate={onNavigate} currentRoute={currentRoute}>
      <div className="flex flex-col items-center gap-8 px-12 py-6 max-w-4xl mx-auto">
        <TimerControls />
        <div className="w-full border-t border-sahara-border/30 pt-8">
          <Text variant="h3" className="mb-4 font-serif text-2xl">
            Today's Focus
          </Text>
          <TaskList />
        </div>
        <TodaySessions />
      </div>
    </MainLayout>
  );
}
