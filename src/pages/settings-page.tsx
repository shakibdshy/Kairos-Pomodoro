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
} from "lucide-react";
import type { Route } from "@/app/router";
import { cn } from "@/lib/cn";
import { useState } from "react";

interface SettingsPageProps {
  onNavigate: (route: Route) => void;
  currentRoute: Route;
}

export function SettingsPage({ onNavigate, currentRoute }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState("general");

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
          <main className="flex-1 bg-white border border-sahara-border/20 rounded-3xl p-10 overflow-y-auto shadow-sm shadow-sahara-primary/5">
            <div className="max-w-2xl space-y-12">
              {/* Focus Rhythm Section */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-serif text-2xl text-sahara-text">
                    Focus Rhythm
                  </h3>
                  <button className="flex items-center gap-2 text-sahara-primary hover:text-sahara-primary/80 transition-colors">
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
                        defaultValue={25}
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
                        defaultValue={5}
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
                        defaultValue={15}
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
                  {[
                    { id: "light", label: "Light", icon: Sun },
                    { id: "dark", label: "Dark", icon: Moon },
                    { id: "system", label: "System", icon: Monitor },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      className={cn(
                        "flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all hover:shadow-md",
                        theme.id === "light"
                          ? "bg-sahara-primary-light border-sahara-primary/30 text-sahara-primary shadow-sm"
                          : "bg-white border-sahara-border/20 text-sahara-text-muted hover:border-sahara-primary/30",
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
                  System Sounds
                </h3>
                <div className="space-y-6">
                  {[
                    "End of session chime",
                    "Break start alert",
                    "Halfway point notification",
                  ].map((label, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="font-bold text-sahara-text-secondary text-sm">
                        {label}
                      </span>
                      <button
                        className={cn(
                          "w-12 h-6 rounded-full p-1 transition-colors duration-200",
                          i < 2 ? "bg-sahara-primary" : "bg-sahara-border/30",
                        )}
                      >
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                            i < 2 ? "translate-x-6" : "translate-x-0",
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
