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
import { m } from "framer-motion";

const NAV_ITEMS = [
  { path: "/", label: "Timer", icon: Timer },
  { path: "/tasks", label: "Tasks", icon: CheckSquare },
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
] as const;

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const status = useTimerStore((s) => s.status);
  const start = useTimerStore((s) => s.start);
  const isRunning = status === "running";

  return (
    <m.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 200 }}
      className={cn(
        "hidden md:flex border-r border-sahara-border/30 flex-col py-8 bg-sahara-bg/50 backdrop-blur-sm relative z-10",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <Button
        variant="outline"
        size="icon-lg"
        intent="default"
        shape="rounded-full"
        onClick={onToggleCollapse}
        className="absolute -right-3.5 top-20 z-50 size-7 bg-sahara-surface shadow-sm hover:text-sahara-primary hover:border-sahara-primary/40 hover:shadow-md"
      >
        {isCollapsed ? (
          <PanelLeftOpen className="size-3.5" />
        ) : (
          <PanelLeftClose className="size-3.5" />
        )}
      </Button>

      <div
        className={cn(
          "mb-12 transition-all duration-300",
          isCollapsed ? "px-4 flex justify-center" : "px-8",
        )}
      >
        {isCollapsed ? (
          <div className="size-10 rounded-full border-2 border-sahara-primary flex items-center justify-center font-serif text-xl font-bold text-sahara-primary shadow-sm bg-sahara-surface">
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
                  "size-5 shrink-0 transition-colors",
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
          title={
            isCollapsed
              ? isRunning
                ? "SESSION ACTIVE"
                : "START SESSION"
              : undefined
          }
          className={cn(
            "tracking-widest text-[10px] sm:text-xs font-bold shadow-lg shadow-sahara-primary/20 hover:shadow-xl transition-all",
            isCollapsed ? "h-12" : "py-4 gap-2",
            isRunning && "opacity-50 cursor-not-allowed shadow-none",
          )}
        >
          <Play
            className={cn(
              "size-4 fill-current",
              !isCollapsed && "ml-0.5",
            )}
          />
          {!isCollapsed && (
            <span>{isRunning ? "SESSION ACTIVE" : "START SESSION"}</span>
          )}
        </Button>
      </div>

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
              "size-5 shrink-0",
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
              "size-5 shrink-0",
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
    </m.aside>
  );
}
