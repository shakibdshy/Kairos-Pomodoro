import { cn } from "@/lib/cn";
import type { SidebarTab } from "./settings-sidebar";

interface SettingsMobileTabsProps {
  tabs: SidebarTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function SettingsMobileTabs({
  tabs,
  activeTab,
  onTabChange,
}: SettingsMobileTabsProps) {
  return (
    <div className="md:hidden mb-6 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 min-w-max pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap",
              activeTab === tab.id
                ? "bg-sahara-primary text-white"
                : "bg-sahara-card text-sahara-text-muted hover:text-sahara-text-secondary border border-sahara-border/20",
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
