import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

export interface SidebarTab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SettingsSidebarProps {
  tabs: SidebarTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function SettingsSidebar({
  tabs,
  activeTab,
  onTabChange,
}: SettingsSidebarProps) {
  return (
    <nav className="hidden md:flex flex-col gap-1 w-36 shrink-0 pt-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150",
            activeTab === tab.id
              ? "bg-sahara-primary text-white shadow-sm shadow-sahara-primary/20"
              : "text-sahara-text-muted hover:bg-sahara-card hover:text-sahara-text-secondary",
          )}
        >
          <tab.icon
            className={cn(
              "w-4.5 h-4.5 shrink-0",
              activeTab === tab.id ? "text-white" : "",
            )}
          />
          <span className="text-[10px] tracking-widest font-bold uppercase leading-none">
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
