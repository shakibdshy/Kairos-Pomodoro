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

interface MainLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { path: "/", label: "TIMER", icon: Timer },
  { path: "/tasks", label: "TASKS", icon: CheckSquare },
  { path: "/calendar", label: "CALENDAR", icon: Calendar },
  { path: "/analytics", label: "ANALYTICS", icon: BarChart2 },
] as const;

export function MainLayout({ children }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
                  <span className="text-xs tracking-widest font-bold whitespace-nowrap">
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
            onClick={() => navigate("/")}
            title={isCollapsed ? "START SESSION" : undefined}
            className={cn(
              "tracking-[0.15em]",
              isCollapsed ? "h-12" : "py-4 gap-3",
            )}
          >
            <Play
              className={cn("w-4 h-4 fill-current", !isCollapsed && "ml-1")}
            />
            {!isCollapsed && <span>START SESSION</span>}
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
              "rounded-none",
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
