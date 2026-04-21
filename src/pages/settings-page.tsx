import { MainLayout } from "@/components/template/main-layout";
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
import type { Route } from "@/app/router";
import { cn } from "@/lib/cn";
import { useState, useEffect } from "react";
import { useSettingsStore } from "@/features/settings/use-settings-store";
import { useNotificationStore } from "@/features/settings/use-notification-store";
import { sendNotification } from "@/lib/notifications";
import type { ThemeMode } from "@/features/settings/settings-types";

interface SettingsPageProps {
  onNavigate: (route: Route) => void;
  currentRoute: Route;
}

const THEME_OPTIONS: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

export function SettingsPage({ onNavigate, currentRoute }: SettingsPageProps) {
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

  const handleRequestPermission = async () => {
    await requestNotifPermission();
  };

  const openSystemPreferences = () => {
    // Open macOS System Preferences → Notifications
    window.open(
      "x-apple.systempreferences:com.apple.preference.notifications",
      "_blank",
    );
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

  return (
    <MainLayout onNavigate={onNavigate} currentRoute={currentRoute}>
      <div className="px-12 py-12 max-w-5xl mx-auto h-full flex flex-col">
        <header className="mb-12">
          <h1 className="font-serif text-4xl text-sahara-text uppercase tracking-widest text-[12px] font-bold mb-2">
            Configuration
          </h1>
          <p className="font-serif text-4xl text-sahara-text">App Settings</p>
        </header>

        <div className="flex-1 flex gap-12 min-h-0">
          {/* Sidebar Tabs */}
          <aside className="w-64 space-y-2 shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 group",
                  activeTab === tab.id
                    ? "bg-sahara-primary-light text-sahara-primary font-bold shadow-sm shadow-sahara-primary/5"
                    : "text-sahara-text-muted hover:bg-sahara-card hover:text-sahara-text",
                )}
              >
                <tab.icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    activeTab === tab.id
                      ? "text-sahara-primary"
                      : "text-sahara-text-muted group-hover:text-sahara-text-secondary",
                  )}
                />
                <span className="text-xs tracking-widest font-bold uppercase">
                  {tab.label}
                </span>
              </button>
            ))}
          </aside>

          {/* Main Settings Area */}
          <main className="flex-1 bg-sahara-surface border border-sahara-border/20 rounded-3xl p-10 overflow-y-auto shadow-sm shadow-sahara-primary/5">
            <div className="max-w-2xl space-y-12">
              {/* Focus Rhythm Section */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-serif text-2xl text-sahara-text">
                    Focus Rhythm
                  </h3>
                  <button
                    onClick={handleSaveDurations}
                    className="flex items-center gap-2 text-sahara-primary hover:text-sahara-primary/80 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">
                      Save Changes
                    </span>
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between group">
                    <div>
                      <h4 className="font-bold text-sahara-text-secondary text-sm">
                        Focus Duration
                      </h4>
                      <p className="text-xs text-sahara-text-muted mt-1">
                        Recommended length for deep work sessions.
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={workMin}
                        onChange={(e) =>
                          setWorkMin(Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="w-20 bg-sahara-card border border-sahara-border/20 rounded-xl px-4 py-2 text-center text-sm font-bold text-sahara-primary outline-none focus:border-sahara-primary/40 transition-colors"
                      />
                      <span className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-widest">
                        Minutes
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between group">
                    <div>
                      <h4 className="font-bold text-sahara-text-secondary text-sm">
                        Short Break
                      </h4>
                      <p className="text-xs text-sahara-text-muted mt-1">
                        Quick pause to refresh your mind.
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={shortBreakMin}
                        onChange={(e) =>
                          setShortBreakMin(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="w-20 bg-sahara-card border border-sahara-border/20 rounded-xl px-4 py-2 text-center text-sm font-bold text-sahara-primary outline-none focus:border-sahara-primary/40 transition-colors"
                      />
                      <span className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-widest">
                        Minutes
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between group">
                    <div>
                      <h4 className="font-bold text-sahara-text-secondary text-sm">
                        Long Break
                      </h4>
                      <p className="text-xs text-sahara-text-muted mt-1">
                        Extended rest after 4 focus sessions.
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={longBreakMin}
                        onChange={(e) =>
                          setLongBreakMin(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="w-20 bg-sahara-card border border-sahara-border/20 rounded-xl px-4 py-2 text-center text-sm font-bold text-sahara-primary outline-none focus:border-sahara-primary/40 transition-colors"
                      />
                      <span className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-widest">
                        Minutes
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Theme Section */}
              <section>
                <h3 className="font-serif text-2xl text-sahara-text mb-8">
                  Appearance
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {THEME_OPTIONS.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => updateSetting("theme", theme.id)}
                      className={cn(
                        "flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all hover:shadow-md",
                        settings.theme === theme.id
                          ? "bg-sahara-primary-light border-sahara-primary/30 text-sahara-primary shadow-sm"
                          : "bg-sahara-surface border-sahara-border/20 text-sahara-text-muted hover:border-sahara-primary/30",
                      )}
                    >
                      <theme.icon className="w-6 h-6" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">
                        {theme.label}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Notifications Section */}
              <section>
                <h3 className="font-serif text-2xl text-sahara-text mb-8">
                  Notifications & Sounds
                </h3>

                {/* Permission Status Card */}
                <div className="bg-sahara-bg/50 border border-sahara-border/15 rounded-2xl p-5 mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-sahara-primary shrink-0" />
                      <div>
                        <h4 className="font-bold text-sahara-text-secondary text-sm">
                          System Notifications
                        </h4>
                        <p className="text-[11px] text-sahara-text-muted mt-0.5">
                          macOS desktop notifications when timer ends
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      {notifChecking && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sahara-primary uppercase tracking-wider">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Requesting...
                        </span>
                      )}
                      {!notifChecking && notifStatus === "granted" && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-green-600 uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Enabled
                        </span>
                      )}
                      {!notifChecking && notifStatus === "denied" && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-500 uppercase tracking-wider">
                          <XCircle className="w-3.5 h-3.5" />
                          Disabled
                        </span>
                      )}
                      {!notifChecking && notifStatus === "unknown" && (
                        <span className="text-[11px] font-bold text-sahara-text-muted uppercase tracking-wider">
                          Not checked
                        </span>
                      )}
                      {!notifChecking && notifStatus === "unavailable" && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                          Browser Mode
                        </span>
                      )}
                    </div>
                  </div>

                  {notifError && notifStatus !== "unavailable" && (
                    <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200/50 text-red-600 text-[11px]">
                      Error: {notifError}
                    </div>
                  )}

                  {notifStatus === "unavailable" && (
                    <div className="mb-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200/40 text-amber-700 text-[11px] leading-relaxed">
                      Notifications require the Tauri desktop app.
                      You&apos;re currently running in browser dev mode.
                      Run <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">npm run tauri dev</code> to enable
                      native macOS notifications.
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    {(notifStatus === "denied" || notifStatus === "unknown") && (
                      <button
                        onClick={handleRequestPermission}
                        disabled={notifChecking}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sahara-primary text-white text-[11px] font-bold tracking-wider uppercase hover:bg-sahara-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {notifChecking ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Bell className="w-3.5 h-3.5" />
                        )}
                        {notifChecking
                          ? "Requesting..."
                          : "Enable Notifications"}
                      </button>
                    )}

                    <button
                      onClick={handleTestNotification}
                      disabled={testing || notifStatus !== "granted"}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl border text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer",
                        testing
                          ? "border-green-500/30 text-green-600 bg-green-50"
                          : notifStatus === "granted"
                            ? "border-sahara-border/30 text-sahara-text-secondary hover:bg-sahara-card hover:text-sahara-primary"
                            : "border-sahara-border/15 text-sahara-text-muted opacity-40 cursor-not-allowed",
                      )}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      {testing ? "Sent!" : "Test Notification"}
                    </button>

                    {notifStatus === "denied" && !notifChecking && (
                      <button
                        onClick={openSystemPreferences}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-sahara-border/20 text-[11px] font-medium text-sahara-primary hover:bg-sahara-primary-light transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open Settings
                      </button>
                    )}
                  </div>

                  {notifStatus === "denied" && !notifChecking && (
                    <p className="mt-3 text-[11px] text-sahara-text-muted leading-relaxed">
                      Kairos needs permission to show notifications. Click{" "}
                      <strong>"Enable Notifications"</strong> above to trigger
                      the macOS permission dialog, or open{" "}
                      <strong>System Preferences → Notifications</strong>{" "}
                      manually and find <em>Kairos</em> in the list.
                    </p>
                  )}
                </div>

                {/* Toggle Switches */}
                <div className="space-y-6">
                  {[
                    {
                      label: "End of session chime",
                      desc: "Play a sound when timer completes",
                      key: "soundEnabled" as const,
                    },
                    {
                      label: "Respect Do Not Disturb",
                      desc: "Mute notifications when DnD is active",
                      key: "respectDnd" as const,
                    },
                    {
                      label: "Auto-start breaks",
                      desc: "Automatically start break timer after focus",
                      key: "autoStartBreaks" as const,
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
                        onClick={() => updateSetting(key, !settings[key])}
                        className={cn(
                          "w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer shrink-0 ml-4",
                          settings[key]
                            ? "bg-sahara-primary"
                            : "bg-sahara-border/30",
                        )}
                      >
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full bg-sahara-surface shadow-sm transition-transform duration-200",
                            settings[key] ? "translate-x-6" : "translate-x-0",
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </MainLayout>
  );
}
