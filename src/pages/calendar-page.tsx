import { MainLayout } from "@/components/template/main-layout";
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import type { Route } from "@/app/router";
import { cn } from "@/lib/cn";

interface CalendarPageProps {
  onNavigate: (route: Route) => void;
  currentRoute: Route;
}

export function CalendarPage({ onNavigate, currentRoute }: CalendarPageProps) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

  const sessions = [
    {
      day: "Mon",
      start: 9,
      duration: 2,
      title: "Deep Work: Project Sahara",
      type: "work",
    },
    {
      day: "Mon",
      start: 14,
      duration: 1.5,
      title: "UI Design Review",
      type: "work",
    },
    { day: "Tue", start: 10, duration: 3, title: "Focus Block", type: "work" },
    {
      day: "Wed",
      start: 9,
      duration: 2,
      title: "Client Meeting",
      type: "meeting",
    },
    {
      day: "Wed",
      start: 15,
      duration: 2.5,
      title: "Coding Session",
      type: "work",
    },
    { day: "Thu", start: 11, duration: 1, title: "Planning", type: "work" },
    {
      day: "Fri",
      start: 9,
      duration: 4,
      title: "Deep Work Marathon",
      type: "work",
    },
  ];

  return (
    <MainLayout onNavigate={onNavigate} currentRoute={currentRoute}>
      <div className="px-12 py-12 max-w-6xl mx-auto h-full flex flex-col">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-serif text-4xl text-sahara-text uppercase tracking-widest text-[12px] font-bold mb-2">
              Time Distribution
            </h1>
            <p className="font-serif text-4xl text-sahara-text">
              Your Weekly Timeline
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-white border border-sahara-border/20 rounded-xl px-4 py-2">
              <button className="p-1 hover:text-sahara-primary transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-sahara-text-secondary min-w-30 text-center uppercase tracking-widest">
                April 20 - 26
              </span>
              <button className="p-1 hover:text-sahara-primary transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button className="flex items-center gap-2 bg-sahara-primary text-white px-6 py-3 rounded-xl font-bold text-xs tracking-widest hover:bg-sahara-primary/90 transition-colors shadow-lg shadow-sahara-primary/20">
              <Plus className="w-4 h-4" />
              ADD BLOCK
            </button>
          </div>
        </header>

        <div className="flex-1 bg-white border border-sahara-border/20 rounded-3xl overflow-hidden shadow-sm shadow-sahara-primary/5 flex flex-col">
          {/* Header */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-sahara-border/10">
            <div className="p-4 border-r border-sahara-border/10"></div>
            {days.map((day) => (
              <div
                key={day}
                className="p-4 text-center border-r last:border-r-0 border-sahara-border/10"
              >
                <span className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-[0.2em]">
                  {day}
                </span>
                <p
                  className={cn(
                    "font-serif text-xl mt-1",
                    day === "Wed" ? "text-sahara-primary" : "text-sahara-text",
                  )}
                >
                  {day === "Mon"
                    ? "20"
                    : day === "Tue"
                      ? "21"
                      : day === "Wed"
                        ? "22"
                        : day === "Thu"
                          ? "23"
                          : day === "Fri"
                            ? "24"
                            : day === "Sat"
                              ? "25"
                              : "26"}
                </p>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto relative">
            <div className="grid grid-cols-[80px_repeat(7,1fr)] min-h-full">
              {/* Time column */}
              <div className="border-r border-sahara-border/10 bg-sahara-card/20">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-20 p-4 text-right border-b border-sahara-border/5"
                  >
                    <span className="text-[10px] font-bold text-sahara-text-muted">
                      {hour > 12 ? hour - 12 : hour} {hour >= 12 ? "PM" : "AM"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {days.map((day) => (
                <div
                  key={day}
                  className="relative border-r last:border-r-0 border-sahara-border/10"
                >
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="h-20 border-b border-sahara-border/5"
                    ></div>
                  ))}

                  {/* Sessions */}
                  {sessions
                    .filter((s) => s.day === day)
                    .map((session, i) => (
                      <div
                        key={i}
                        className={cn(
                          "absolute left-1 right-1 rounded-xl p-3 shadow-sm border transition-all cursor-pointer hover:shadow-md hover:scale-[1.02] z-10",
                          session.type === "work"
                            ? "bg-sahara-primary-light border-sahara-primary/20 text-sahara-primary"
                            : "bg-sahara-card border-sahara-border/30 text-sahara-text-secondary",
                        )}
                        style={{
                          top: `${(session.start - 8) * 80}px`,
                          height: `${session.duration * 80}px`,
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3 h-3 opacity-70" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">
                            {session.duration}h session
                          </span>
                        </div>
                        <h4 className="text-[11px] font-bold leading-tight line-clamp-2">
                          {session.title}
                        </h4>
                      </div>
                    ))}
                </div>
              ))}
            </div>

            {/* Current time indicator */}
            <div
              className="absolute left-20 right-0 border-t-2 border-sahara-primary z-20 pointer-events-none flex items-center"
              style={{ top: `${(11.5 - 8) * 80}px` }}
            >
              <div className="w-2 h-2 rounded-full bg-sahara-primary -ml-1"></div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
