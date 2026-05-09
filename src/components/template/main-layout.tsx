import { useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Timer,
  CheckSquare,
  BarChart2,
  Settings,
  Calendar,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useTimerStore } from "@/features/timer/use-timer-store";

interface MainLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { path: "/", label: "Timer", icon: Timer },
  { path: "/tasks", label: "Tasks", icon: CheckSquare },
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
] as const;

export function MainLayout({ children }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const status = useTimerStore((s) => s.status);
  const start = useTimerStore((s) => s.start);
  const isRunning = status === "running";

  return (
    <div className="flex h-screen bg-sahara-bg text-sahara-text font-sans overflow-hidden">
      {/* Desktop Sidebar — hidden on mobile */}
      <aside
        className={cn(
          "hidden md:flex border-r border-sahara-border/30 flex-col py-8 bg-sahara-bg/50 backdrop-blur-sm transition-all duration-300 ease-in-out relative z-10",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        {/* Toggle Button */}
        <Button
          variant="outline"
          size="icon-lg"
          intent="default"
          shape="rounded-full"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-20 z-50 w-7 h-7 bg-sahara-surface shadow-sm hover:text-sahara-primary hover:border-sahara-primary/40 hover:shadow-md"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-3.5 h-3.5" />
          ) : (
            <PanelLeftClose className="w-3.5 h-3.5" />
          )}
        </Button>

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
                Kairos-Pomodoro
              </h1>
              <p className="text-[10px] tracking-[0.2em] font-bold text-sahara-text-muted mt-1 uppercase whitespace-nowrap">
                Stay Present
              </p>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant="nav"
                active={isActive}
                onClick={() => navigate(item.path)}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "overflow-hidden justify-start",
                  isCollapsed ? "justify-center p-3" : "gap-4 px-4 py-3",
                  isActive
                    ? ""
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
                  <span className="text-xs tracking-widest font-bold uppercase whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Start Session CTA */}
        <div className="px-3 mb-8">
          <Button
            variant="solid"
            intent="sahara"
            fullWidth
            shape="rounded-full"
            disabled={isRunning}
            onClick={() => {
              if (location.pathname !== "/") {
                navigate("/");
              }
              start();
            }}
            title={isCollapsed ? (isRunning ? "SESSION ACTIVE" : "START SESSION") : undefined}
            className={cn(
              "tracking-widest text-[10px] sm:text-xs font-bold shadow-lg shadow-sahara-primary/20 hover:shadow-xl transition-all",
              isCollapsed ? "h-12" : "py-4 gap-2",
              isRunning && "opacity-50 cursor-not-allowed shadow-none",
            )}
          >
            <Play
              className={cn("w-4 h-4 fill-current", !isCollapsed && "ml-0.5")}
            />
            {!isCollapsed && (
              <span>{isRunning ? "SESSION ACTIVE" : "START SESSION"}</span>
            )}
          </Button>
        </div>

        {/* Bottom Actions */}
        <div className="px-3 space-y-1 border-t border-sahara-border/20 pt-6">
          <Button
            variant="nav"
            intent="default"
            onClick={() => navigate("/onboarding")}
            title={isCollapsed ? "HELP" : undefined}
            className={cn(
              "rounded-none justify-start",
              isCollapsed ? "justify-center p-3" : "gap-4 px-4 py-3",
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
          </Button>
          <Button
            variant="nav"
            active={location.pathname === "/settings"}
            onClick={() => navigate("/settings")}
            title={isCollapsed ? "SETTINGS" : undefined}
            className={cn(
              "justify-start",
              isCollapsed ? "justify-center p-3" : "gap-4 px-4 py-3",
              location.pathname === "/settings"
                ? ""
                : "text-sahara-text-muted hover:text-sahara-text-secondary",
            )}
          >
            <Settings
              className={cn(
                "w-5 h-5 shrink-0",
                location.pathname === "/settings"
                  ? "text-sahara-primary"
                  : "text-sahara-text-muted group-hover:text-sahara-text-secondary",
              )}
            />
            {!isCollapsed && (
              <span className="text-xs tracking-widest font-bold">
                SETTINGS
              </span>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden min-w-0">
        {/* macOS overlay titlebar spacer */}
        <div
          className="h-8 flex items-center justify-between pl-4 md:pl-8 pr-4 shrink-0"
          data-tauri-drag-region
        />

        {/* Scrollable content — with bottom padding for mobile nav */}
        <div className="flex-1 overflow-y-auto scroll-smooth pb-20 md:pb-0">
          {children}
        </div>

        {/* Mobile Bottom Navigation — visible only below md breakpoint */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sahara-surface/95 backdrop-blur-lg border-t border-sahara-border/30 px-2 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-around max-w-lg mx-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 py-2 px-3 min-w-14 transition-colors duration-200 cursor-pointer",
                    isActive
                      ? "text-sahara-primary"
                      : "text-sahara-text-muted hover:text-sahara-text-secondary",
                  )}
                >
                  {isActive && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-sahara-primary" />
                  )}
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive && "stroke-[2.5px]",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[9px] font-bold tracking-wider uppercase",
                      isActive && "font-extrabold",
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* Settings & Help as icon-only on far right */}
            <div className="flex items-center gap-1 pl-2 border-l border-sahara-border/20">
              <button
                onClick={() => navigate("/onboarding")}
                className="flex items-center justify-center p-2 text-sahara-text-muted hover:text-sahara-text-secondary transition-colors cursor-pointer"
                title="Help"
              >
                <HelpCircle className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => navigate("/settings")}
                className={cn(
                  "flex items-center justify-center p-2 transition-colors cursor-pointer",
                  location.pathname === "/settings"
                    ? "text-sahara-primary"
                    : "text-sahara-text-muted hover:text-sahara-text-secondary",
                )}
                title="Settings"
              >
                <Settings className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
