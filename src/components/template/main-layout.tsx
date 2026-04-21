import { useState, type ReactNode } from "react";
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
  PanelLeftClose,
  PanelLeftOpen,
  Play,
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      <aside
        className={cn(
          "border-r border-sahara-border/30 flex flex-col py-8 bg-sahara-bg/50 backdrop-blur-sm transition-all duration-300 ease-in-out relative z-10",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-20 w-7 h-7 bg-sahara-surface border border-sahara-border/30 rounded-full flex items-center justify-center text-sahara-text-muted hover:text-sahara-primary hover:border-sahara-primary/40 hover:shadow-md transition-all shadow-sm z-50 cursor-pointer"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-3.5 h-3.5" />
          ) : (
            <PanelLeftClose className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Brand */}
        <div
          className={cn(
            "mb-12 transition-all duration-300",
            isCollapsed ? "px-4 flex justify-center" : "px-8",
          )}
        >
          {isCollapsed ? (
            <div className="w-10 h-10 rounded-full border-2 border-sahara-primary flex items-center justify-center font-serif text-xl font-bold text-sahara-primary shadow-sm bg-sahara-surface">
              K
            </div>
          ) : (
            <>
              <h1 className="font-serif text-2xl tracking-tight text-sahara-primary">
                Kairos
              </h1>
              <p className="text-[10px] tracking-[0.2em] font-bold text-sahara-text-muted mt-1 uppercase whitespace-nowrap">
                Stay Present
              </p>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id as Route)}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "w-full flex items-center rounded-xl transition-all duration-200 group overflow-hidden",
                  isCollapsed ? "justify-center p-3" : "gap-4 px-4 py-3",
                  isActive
                    ? "bg-sahara-primary-light text-sahara-primary font-bold shadow-sm shadow-sahara-primary/5"
                    : "text-sahara-text-secondary hover:bg-sahara-card hover:text-sahara-text",
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    isActive
                      ? "text-sahara-primary"
                      : "text-sahara-text-muted group-hover:text-sahara-text-secondary",
                  )}
                />
                {!isCollapsed && (
                  <span className="text-xs tracking-widest font-bold whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Start Session CTA */}
        <div className="px-3 mb-8">
          <button
            onClick={() => onNavigate?.("timer")}
            title={isCollapsed ? "START SESSION" : undefined}
            className={cn(
              "w-full bg-sahara-primary text-white rounded-xl font-bold text-xs tracking-[0.15em] hover:bg-sahara-primary/90 transition-all shadow-lg shadow-sahara-primary/20 flex items-center justify-center",
              isCollapsed ? "h-12" : "py-4 gap-3",
            )}
          >
            <Play
              className={cn("w-4 h-4 fill-current", !isCollapsed && "ml-1")}
            />
            {!isCollapsed && <span>START SESSION</span>}
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="px-3 space-y-1 border-t border-sahara-border/20 pt-6">
          <button
            onClick={() => onNavigate?.("onboarding")}
            title={isCollapsed ? "HELP" : undefined}
            className={cn(
              "w-full flex items-center transition-colors group",
              isCollapsed
                ? "justify-center p-3"
                : "gap-4 px-4 py-3 text-sahara-text-muted hover:text-sahara-text-secondary",
            )}
          >
            <HelpCircle
              className={cn(
                "w-5 h-5 shrink-0",
                isCollapsed
                  ? "text-sahara-text-muted group-hover:text-sahara-text-secondary"
                  : "",
              )}
            />
            {!isCollapsed && (
              <span className="text-xs tracking-widest font-bold">HELP</span>
            )}
          </button>
          <button
            onClick={() => onNavigate?.("settings")}
            title={isCollapsed ? "SETTINGS" : undefined}
            className={cn(
              "w-full flex items-center rounded-xl transition-all duration-200 group",
              isCollapsed ? "justify-center p-3" : "gap-4 px-4 py-3",
              currentRoute === "settings"
                ? "bg-sahara-primary-light text-sahara-primary font-bold"
                : "text-sahara-text-muted hover:text-sahara-text-secondary",
            )}
          >
            <Settings
              className={cn(
                "w-5 h-5 shrink-0",
                currentRoute === "settings"
                  ? "text-sahara-primary"
                  : "text-sahara-text-muted group-hover:text-sahara-text-secondary",
              )}
            />
            {!isCollapsed && (
              <span className="text-xs tracking-widest font-bold">
                SETTINGS
              </span>
            )}
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
