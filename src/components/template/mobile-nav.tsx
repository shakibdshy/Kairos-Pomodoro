import { useLocation, useNavigate } from "react-router-dom";
import {
  Timer,
  CheckSquare,
  BarChart2,
  Settings,
  Calendar,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { path: "/", label: "Timer", icon: Timer },
  { path: "/tasks", label: "Tasks", icon: CheckSquare },
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
] as const;

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
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
                  "size-5 transition-colors",
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

        <div className="flex items-center gap-1 pl-2 border-l border-sahara-border/20">
          <button
            onClick={() => navigate("/onboarding")}
            className="flex items-center justify-center p-2 text-sahara-text-muted hover:text-sahara-text-secondary transition-colors cursor-pointer"
            title="Help"
          >
            <HelpCircle className="size-4.5" />
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
            <Settings className="size-4.5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
