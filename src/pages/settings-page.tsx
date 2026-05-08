import { useState } from "react";
import { useSettingsStore } from "@/features/settings/use-settings-store";
import { useNotificationStore } from "@/features/notifications/use-notification-store";
import { Monitor, Zap, Bell, Keyboard, Shield } from "lucide-react";

import { MainLayout } from "@/components/template/main-layout";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import type { SidebarTab } from "@/components/settings/settings-sidebar";
import { SettingsMobileTabs } from "@/components/settings/settings-mobile-tabs";
import { SettingsGeneralSection } from "@/components/settings/settings-general-section";
import { SettingsFocusSection } from "@/components/settings/settings-focus-section";
import { SettingsNotifications } from "@/components/settings/settings-notifications-section";
import { SettingsHotkeysSection } from "@/components/settings/settings-hotkeys-section";
import { SettingsPrivacySection } from "@/components/settings/settings-privacy-section";

const TABS: SidebarTab[] = [
  { id: "general", label: "General", icon: Monitor },
  { id: "focus", label: "Focus Rhythm", icon: Zap },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "hotkeys", label: "Hotkeys", icon: Keyboard },
  { id: "privacy", label: "Privacy & Data", icon: Shield },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const settings = useSettingsStore((s) => s.settings);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const notifStatus = useNotificationStore((s) => s.status);
  const notifChecking = useNotificationStore((s) => s.checking);
  const notifError = useNotificationStore((s) => s.error);
  const requestNotifPermission = useNotificationStore(
    (s) => s.requestPermission,
  );

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-12 max-w-6xl xl:max-w-7xl mx-auto h-full flex flex-col">
        <header className="mb-8 md:mb-12">
          <h1 className="font-serif text-[10px] md:text-[12px] font-bold uppercase tracking-widest text-sahara-text-muted mb-2">
            Configuration
          </h1>
          <p className="font-serif text-2xl md:text-4xl text-sahara-text">
            App Settings
          </p>
        </header>

        <SettingsMobileTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="flex-1 flex gap-6 lg:gap-8 min-h-0">
          <SettingsSidebar
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <main className="flex-1 bg-sahara-surface border border-sahara-border/20 rounded-2xl md:rounded-3xl p-5 md:p-8 lg:p-10 overflow-y-auto shadow-sm shadow-sahara-primary/5">
            <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl space-y-8 md:space-y-10">
              {activeTab === "general" && (
                <SettingsGeneralSection
                  currentTheme={settings.theme}
                  onThemeChange={(t) => updateSetting("theme", t)}
                  settings={{
                    autoStartBreaks: settings.autoStartBreaks,
                  }}
                  onToggle={(k: string, v: boolean) =>
                    updateSetting(k as any, v)
                  }
                />
              )}

              {activeTab === "focus" && <SettingsFocusSection />}

              {activeTab === "notifications" && (
                <SettingsNotifications
                  notifStatus={{
                    status: notifStatus,
                    checking: notifChecking,
                    error: notifError,
                  }}
                  requestPermission={requestNotifPermission}
                  soundEnabled={settings.soundEnabled}
                  onSoundToggle={(v: boolean) =>
                    updateSetting("soundEnabled", v)
                  }
                />
              )}

              {activeTab === "hotkeys" && <SettingsHotkeysSection />}

              {activeTab === "privacy" && <SettingsPrivacySection />}
            </div>
          </main>
        </div>
      </div>
    </MainLayout>
  );
}
