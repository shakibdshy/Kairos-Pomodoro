import type { ReactNode } from "react";
import type { Route } from "@/app/router";
import {
  Timer,
  CheckSquare,
  BarChart2,
  Library,
  HelpCircle,
  Settings,
  Calendar,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface MainLayoutProps {
  children: ReactNode;
  onNavigate?: (route: Route) => void;
  currentRoute?: Route;
}

export function MainLayout({
  children,
  onNavigate,
  currentRoute,
}: MainLayoutProps) {
  const navItems = [
    { id: "timer", label: "TIMER", icon: Timer },
    { id: "tasks", label: "TASKS", icon: CheckSquare },
    { id: "calendar", label: "CALENDAR", icon: Calendar },
    { id: "analytics", label: "ANALYTICS", icon: BarChart2 },
    { id: "notes", label: "NOTES", icon: StickyNote },
    { id: "library", label: "LIBRARY", icon: Library },
  ];

  return (
    <div className="flex h-screen bg-sahara-bg text-sahara-text font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-sahara-border/30 flex flex-col py-8 bg-sahara-bg/50 backdrop-blur-sm">
        {/* Brand */}
        <div className="px-8 mb-12">
          <h1 className="font-serif text-2xl tracking-tight text-sahara-primary">
            Deep Work
          </h1>
          <p className="text-[10px] tracking-[0.2em] font-bold text-sahara-text-muted mt-1 uppercase">
            Stay Present
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id as Route)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-sahara-primary-light text-sahara-primary font-bold shadow-sm shadow-sahara-primary/5"
                    : "text-sahara-text-secondary hover:bg-sahara-card hover:text-sahara-text",
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive
                      ? "text-sahara-primary"
                      : "text-sahara-text-muted group-hover:text-sahara-text-secondary",
                  )}
                />
                <span className="text-xs tracking-widest font-bold">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Start Session CTA */}
        <div className="px-4 mb-8">
          <button
            onClick={() => onNavigate?.("timer")}
            className="w-full bg-sahara-primary text-white py-4 rounded-xl font-bold text-xs tracking-[0.15em] hover:bg-sahara-primary/90 transition-colors shadow-lg shadow-sahara-primary/20"
          >
            START SESSION
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="px-4 space-y-1 border-t border-sahara-border/20 pt-6">
          <button
            onClick={() => onNavigate?.("onboarding")}
            className="w-full flex items-center gap-4 px-4 py-3 text-sahara-text-muted hover:text-sahara-text-secondary transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-xs tracking-widest font-bold">HELP</span>
          </button>
          <button
            onClick={() => onNavigate?.("settings")}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
              currentRoute === "settings"
                ? "bg-sahara-primary-light text-sahara-primary font-bold"
                : "text-sahara-text-muted hover:text-sahara-text-secondary",
            )}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs tracking-widest font-bold">SETTINGS</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* macOS overlay titlebar spacer */}
        <div
          className="h-8 flex items-center justify-between pl-8 pr-4"
          data-tauri-drag-region
        >
          {/* Empty spacer for traffic lights */}
        </div>

        <div className="flex-1 overflow-y-auto scroll-smooth">{children}</div>
      </main>
    </div>
  );
}
