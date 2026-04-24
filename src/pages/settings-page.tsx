import { MainLayout } from "@/components/template/main-layout";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Moon,
  Sun,
  Monitor,
  Keyboard,
  Shield,
  Zap,
  Save,
  CheckCircle2,
  XCircle,
  Volume2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useState, useEffect } from "react";
import { useSettingsStore } from "@/features/settings/use-settings-store";
import { useNotificationStore } from "@/features/settings/use-notification-store";
import { sendNotification } from "@/lib/notifications";
import type { ThemeMode } from "@/features/settings/settings-types";

const THEME_OPTIONS: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

const DURATION_CONFIGS = [
  {
    key: "workMin" as const,
    label: "Focus Duration",
    desc: "Recommended length for deep work sessions.",
    max: 120,
  },
  {
    key: "shortBreakMin" as const,
    label: "Short Break",
    desc: "Quick pause to refresh your mind.",
    max: 30,
  },
  {
    key: "longBreakMin" as const,
    label: "Long Break",
    desc: "Extended rest after 4 focus sessions.",
    max: 60,
  },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const settings = useSettingsStore((s) => s.settings);
  const loaded = useSettingsStore((s) => s.loaded);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const notifStatus = useNotificationStore((s) => s.status);
  const notifChecking = useNotificationStore((s) => s.checking);
  const notifError = useNotificationStore((s) => s.error);
  const requestNotifPermission = useNotificationStore(
    (s) => s.requestPermission,
  );

  const [workMin, setWorkMin] = useState(25);
  const [shortBreakMin, setShortBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);
  const [testing, setTesting] = useState(false);

  const setters = {
    workMin: setWorkMin,
    shortBreakMin: setShortBreakMin,
    longBreakMin: setLongBreakMin,
  };

  useEffect(() => {
    if (loaded) {
      setWorkMin(Math.round(settings.workDuration / 60));
      setShortBreakMin(Math.round(settings.shortBreakDuration / 60));
      setLongBreakMin(Math.round(settings.longBreakDuration / 60));
    }
  }, [
    loaded,
    settings.workDuration,
    settings.shortBreakDuration,
    settings.longBreakDuration,
  ]);

  const handleSaveDurations = () => {
    updateSetting("workDuration", workMin * 60);
    updateSetting("shortBreakDuration", shortBreakMin * 60);
    updateSetting("longBreakDuration", longBreakMin * 60);
  };

  const openSystemPreferences = () => {
    try {
      window.open(
        "x-apple.systempreferences:com.apple.preference.notifications",
        "_blank",
      );
    } catch {
      // Silently ignore on non-macOS platforms
    }
  };

  const handleTestNotification = async () => {
    setTesting(true);
    try {
      await sendNotification(
        "session-complete",
        "This is a test notification!",
      );
    } finally {
      setTimeout(() => setTesting(false), 2000);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Monitor },
    { id: "focus", label: "Focus Rhythm", icon: Zap },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "hotkeys", label: "Hotkeys", icon: Keyboard },
    { id: "privacy", label: "Privacy & Data", icon: Shield },
  ];

  const durationValues = { workMin, shortBreakMin, longBreakMin };

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 md:px-12 py-8 md:py-12 max-w-5xl mx-auto h-full flex flex-col">
        <header className="mb-8 md:mb-12">
          <h1 className="font-serif text-[10px] md:text-[12px] font-bold uppercase tracking-widest text-sahara-text-muted mb-2">
            Configuration
          </h1>
          <p className="font-serif text-2xl md:text-4xl text-sahara-text">
            App Settings
          </p>
        </header>

        {/* Mobile Tab Bar */}
        <div className="md:hidden mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

        <div className="flex-1 flex gap-6 lg:gap-12 min-h-0">
          {/* Desktop Sidebar Tabs */}
          <aside className="hidden md:flex w-48 lg:w-64 space-y-1.5 shrink-0">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="nav"
                intent="default"
                shape="rounded-2xl"
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "gap-3 px-4 lg:px-6 py-3 lg:py-4",
                  activeTab === tab.id
                    ? ""
                    : "text-sahara-text-muted hover:bg-sahara-card hover:text-sahara-text",
                )}
              >
                <tab.icon
                  className={cn(
                    "w-4 h-4 lg:w-5 lg:h-5 transition-colors",
                    activeTab === tab.id
                      ? "text-sahara-primary"
                      : "text-sahara-text-muted group-hover:text-sahara-text-secondary",
                  )}
                />
                <span className="text-[10px] lg:text-xs tracking-widest font-bold uppercase">
                  {tab.label}
                </span>
              </Button>
            ))}
          </aside>

          {/* Main Settings Area */}
          <main className="flex-1 bg-sahara-surface border border-sahara-border/20 rounded-2xl md:rounded-3xl p-5 md:p-10 overflow-y-auto shadow-sm shadow-sahara-primary/5">
            <div className="max-w-2xl space-y-8 md:space-y-12">

              {/* GENERAL TAB */}
              {activeTab === "general" && (
                <section>
                  <h3 className="font-serif text-xl md:text-2xl text-sahara-text mb-6 md:mb-8">
                    Appearance
                  </h3>
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    {THEME_OPTIONS.map((theme) => (
                      <Button
                        key={theme.id}
                        variant="outline"
                        intent="sahara"
                        size="md"
                        shape="rounded-2xl"
                        active={settings.theme === theme.id}
                        onClick={() =>
                          updateSetting("theme", theme.id)
                        }
                        className={cn(
                          "flex-col gap-2 md:gap-3 p-4 md:p-6",
                          settings.theme === theme.id
                            ? ""
                            : "bg-sahara-surface border-sahara-border/20 text-sahara-text-muted hover:border-sahara-primary/30",
                        )}
                      >
                        <theme.icon className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase">
                          {theme.label}
                        </span>
                      </Button>
                    ))}
                  </div>

                  <div className="mt-8 space-y-5">
                    {[
                      {
                        label: "Auto-start breaks",
                        desc: "Automatically start break timer after focus",
                        key: "autoStartBreaks" as const,
                      },
                      {
                        label: "Respect Do Not Disturb",
                        desc: "Mute notifications when DnD is active",
                        key: "respectDnd" as const,
                      },
                    ].map(({ label, desc, key }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-2"
                      >
                        <div>
                          <span className="font-bold text-sahara-text-secondary text-sm block">
                            {label}
                          </span>
                          <span className="text-[11px] text-sahara-text-muted mt-0.5 block">
                            {desc}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            updateSetting(key, !settings[key])
                          }
                          className={cn(
                            "w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer shrink-0 ml-4",
                            settings[key]
                              ? "bg-sahara-primary"
                              : "bg-sahara-border/30",
                          )}
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full bg-sahara-surface shadow-sm transition-transform duration-200",
                              settings[key]
                                ? "translate-x-5"
                                : "translate-x-0",
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* FOCUS RHYTHM TAB */}
              {activeTab === "focus" && (
                <section>
                  <div className="flex items-center justify-between mb-6 md:mb-8">
                    <h3 className="font-serif text-xl md:text-2xl text-sahara-text">
                      Focus Rhythm
                    </h3>
                    <Button
                      variant="link"
                      intent="sahara"
                      size="xs"
                      onClick={handleSaveDurations}
                      className="gap-2"
                    >
                      <Save className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase hidden sm:inline">
                        Save Changes
                      </span>
                    </Button>
                  </div>

                  <div className="space-y-6 md:space-y-8">
                    {DURATION_CONFIGS.map(
                      ({ key, label, desc, max }) => (
                        <div
                          key={key}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 group"
                        >
                          <div>
                            <h4 className="font-bold text-sahara-text-secondary text-sm">
                              {label}
                            </h4>
                            <p className="text-xs text-sahara-text-muted mt-0.5">
                              {desc}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-center">
                            <input
                              type="number"
                              min={1}
                              max={max}
                              value={durationValues[key]}
                              onChange={(e) =>
                                setters[key](
                                  Math.min(
                                    max,
                                    Math.max(
                                      1,
                                      parseInt(e.target.value, 10) || 1,
                                    ),
                                  ),
                                )
                              }
                              className="w-18 bg-sahara-card border border-sahara-border/20 rounded-xl px-3 md:px-4 py-2 text-center text-sm font-bold text-sahara-primary outline-none focus:border-sahara-primary/40 transition-colors"
                            />
                            <span className="text-[9px] md:text-[10px] font-bold text-sahara-text-muted uppercase tracking-widest">
                              Min
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </section>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                <section>
                  <h3 className="font-serif text-xl md:text-2xl text-sahara-text mb-6 md:mb-8">
                    Notifications & Sounds
                  </h3>

                  {/* Permission Status Card */}
                  <div className="bg-sahara-bg/50 border border-sahara-border/15 rounded-xl md:rounded-2xl p-4 md:p-5 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 md:w-5 md:h-5 text-sahara-primary shrink-0" />
                        <div>
                          <h4 className="font-bold text-sahara-text-secondary text-sm">
                            System Notifications
                          </h4>
                          <p className="text-[10px] md:text-[11px] text-sahara-text-muted mt-0.5">
                            macOS desktop notifications when timer ends
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-start">
                        {notifChecking && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-sahara-primary uppercase tracking-wider">
                            <Loader2 className="w-3 h-3 md:w-3.5 md:h-3.5 animate-spin" />
                            Requesting...
                          </span>
                        )}
                        {!notifChecking &&
                          notifStatus === "granted" && (
                            <span className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-green-600 uppercase tracking-wider">
                              <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                              Enabled
                            </span>
                          )}
                        {!notifChecking &&
                          notifStatus === "denied" && (
                            <span className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-red-500 uppercase tracking-wider">
                              <XCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                              Disabled
                            </span>
                          )}
                        {!notifChecking &&
                          notifStatus === "unknown" && (
                            <span className="text-[10px] md:text-[11px] font-bold text-sahara-text-muted uppercase tracking-wider">
                              Not checked
                            </span>
                          )}
                        {!notifChecking &&
                          notifStatus === "unavailable" && (
                            <span className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                              Browser Mode
                            </span>
                          )}
                      </div>
                    </div>

                    {notifError && notifStatus !== "unavailable" && (
                      <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200/50 text-red-600 text-[10px] md:text-[11px]">
                        Error: {notifError}
                      </div>
                    )}

                    {notifStatus === "unavailable" && (
                      <div className="mb-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl bg-amber-50 border border-amber-200/40 text-amber-700 text-[10px] md:text-[11px] leading-relaxed">
                        Notifications require the Tauri desktop app.
                        You&apos;re currently running in browser dev mode.
                        Run{" "}
                        <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-[9px] md:text-[10px]">
                          npm run tauri dev
                        </code>{" "}
                        to enable native macOS notifications.
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                      {(notifStatus === "denied" ||
                        notifStatus === "unknown") && (
                        <Button
                          variant="solid"
                          intent="sahara"
                          size="sm"
                          onClick={() => requestNotifPermission()}
                          disabled={notifChecking}
                          className="gap-2 text-[10px] md:text-[11px] tracking-wider"
                        >
                          {notifChecking ? (
                            <Loader2 className="w-3 h-3 md:w-3.5 md:h-3.5 animate-spin" />
                          ) : (
                            <Bell className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          )}
                          {notifChecking
                            ? "Requesting..."
                            : "Enable Notifications"}
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        intent={testing ? "green" : "default"}
                        size="sm"
                        disabled={
                          testing || notifStatus !== "granted"
                        }
                        onClick={handleTestNotification}
                        className={cn(
                          "gap-2 text-[10px] md:text-[11px] tracking-wider",
                          !testing &&
                            notifStatus !== "granted" &&
                            "opacity-40",
                        )}
                      >
                        <Volume2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        {testing ? "Sent!" : "Test Notification"}
                      </Button>

                      {notifStatus === "denied" &&
                        !notifChecking && (
                          <Button
                            variant="outline"
                            intent="sahara"
                            size="xs"
                            onClick={openSystemPreferences}
                            className="gap-1.5 text-[10px] md:text-[11px] font-medium"
                          >
                            <ExternalLink className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            Open Settings
                          </Button>
                        )}
                    </div>

                    {notifStatus === "denied" && !notifChecking && (
                      <p className="mt-3 text-[10px] md:text-[11px] text-sahara-text-muted leading-relaxed">
                        Kairos needs permission to show notifications.
                        Click{" "}
                        <strong>"Enable Notifications"</strong> above to
                        trigger the macOS permission dialog, or open{" "}
                        <strong>System Preferences → Notifications</strong>{" "}
                        manually and find <em>Kairos</em> in the list.
                      </p>
                    )}
                  </div>

                  {/* Toggle Switches */}
                  <div className="space-y-5">
                    {[
                      {
                        label: "End of session chime",
                        desc: "Play a sound when timer completes",
                        key: "soundEnabled" as const,
                      },
                    ].map(({ label, desc, key }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-2"
                      >
                        <div>
                          <span className="font-bold text-sahara-text-secondary text-sm block">
                            {label}
                          </span>
                          <span className="text-[11px] text-sahara-text-muted mt-0.5 block">
                            {desc}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            updateSetting(key, !settings[key])
                          }
                          className={cn(
                            "w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer shrink-0 ml-4",
                            settings[key]
                              ? "bg-sahara-primary"
                              : "bg-sahara-border/30",
                          )}
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full bg-sahara-surface shadow-sm transition-transform duration-200",
                              settings[key]
                                ? "translate-x-5"
                                : "translate-x-0",
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* HOTKEYS TAB */}
              {activeTab === "hotkeys" && (
                <section>
                  <h3 className="font-serif text-xl md:text-2xl text-sahara-text mb-6 md:mb-8">
                    Keyboard Shortcuts
                  </h3>
                  <div className="bg-sahara-bg/50 border border-sahara-border/15 rounded-xl md:rounded-2xl p-4 md:p-6">
                    <div className="space-y-4">
                      {[
                        { keys: "⌘ + Enter", action: "Start / Pause Timer" },
                        { keys: "⌘ + R", action: "Reset Timer" },
                        { keys: "⌘ + F", action: "Finish Session" },
                        { keys: "Escape", action: "Close Modal" },
                      ].map(({ keys, action }) => (
                        <div
                          key={keys}
                          className="flex items-center justify-between py-2"
                        >
                          <span className="text-sm text-sahara-text-secondary">
                            {action}
                          </span>
                          <kbd className="px-2.5 py-1.5 bg-sahara-card border border-sahara-border/30 rounded-lg text-xs font-mono font-bold text-sahara-text-muted">
                            {keys}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* PRIVACY & DATA TAB */}
              {activeTab === "privacy" && (
                <section>
                  <h3 className="font-serif text-xl md:text-2xl text-sahara-text mb-6 md:mb-8">
                    Privacy & Data
                  </h3>
                  <div className="bg-sahara-bg/50 border border-sahara-border/15 rounded-xl md:rounded-2xl p-4 md:p-6 space-y-4">
                    <p className="text-sm text-sahara-text-secondary leading-relaxed">
                      All your data is stored locally on this device using
                      SQLite. No data is sent to any external server.
                    </p>
                    <div className="pt-4 border-t border-sahara-border/20">
                      <Button
                        variant="outline"
                        intent="red"
                        size="sm"
                        shape="rounded-xl"
                        disabled
                        className="gap-2 text-[11px]"
                      >
                        Clear All Data
                      </Button>
                    </div>
                  </div>
                </section>
              )}

            </div>
          </main>
        </div>
      </div>
    </MainLayout>
  );
}
