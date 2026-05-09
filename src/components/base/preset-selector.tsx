import { useState, useEffect } from "react";
import { usePresetsStore } from "@/features/timer/use-presets-store";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { Button } from "@/components/ui/button";
import { Settings2, Check, Trash2, Plus, X, Clock } from "lucide-react";
import { cn } from "@/lib/cn";

export function PresetSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");

  const {
    presets,
    loadPresets,
    applyPreset,
    savePreset,
    removePreset,
    loaded,
  } = usePresetsStore();
  const currentDurations = useTimerStore((s) => s.durations);
  const timerStatus = useTimerStore((s) => s.status);

  useEffect(() => {
    if (!loaded) loadPresets();
  }, [loaded, loadPresets]);

  const handleSave = async () => {
    if (!newPresetName.trim()) return;
    await savePreset(newPresetName.trim());
    setNewPresetName("");
    setIsSaving(false);
  };

  const isCurrentPreset = (preset: any) => {
    return (
      preset.work_duration === currentDurations.work &&
      preset.short_break_duration === currentDurations.short &&
      preset.long_break_duration === currentDurations.long
    );
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        shape="rounded-full"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-1.5 border-sahara-border/30 text-sahara-text-secondary hover:text-sahara-primary"
      >
        <Settings2 className="w-3.5 h-3.5" />
        <span className="text-[11px] font-bold uppercase tracking-wider">
          Presets
        </span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-md bg-sahara-surface rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-sahara-border/10 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl text-sahara-text">
                  Timer Presets
                </h3>
                <p className="text-[10px] text-sahara-text-muted uppercase tracking-widest font-bold">
                  Quick Switch Configs
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-sahara-card rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-sahara-text-muted" />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              {presets.map((preset) => {
                const active = isCurrentPreset(preset);
                return (
                  <div
                    key={preset.id}
                    className={cn(
                      "group flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer",
                      active
                        ? "bg-sahara-primary/5 border-sahara-primary/30 shadow-sm"
                        : "bg-sahara-card/50 border-sahara-border/10 hover:border-sahara-primary/20",
                    )}
                    onClick={() => {
                      if (timerStatus !== "idle") return;
                      applyPreset(preset);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                          active
                            ? "bg-sahara-primary text-white"
                            : "bg-sahara-surface text-sahara-text-muted",
                        )}
                      >
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4
                          className={cn(
                            "text-sm font-bold",
                            active ? "text-sahara-primary" : "text-sahara-text",
                          )}
                        >
                          {preset.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-sahara-text-muted font-medium">
                          <span>{preset.work_duration / 60}m Focus</span>
                          <span className="w-1 h-1 rounded-full bg-sahara-border" />
                          <span>{preset.short_break_duration / 60}m Break</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {active ? (
                        <div className="p-1.5 rounded-full bg-sahara-primary/10 text-sahara-primary">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePreset(preset.id);
                          }}
                          className="p-2 text-sahara-text-muted hover:text-red-400 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-5 bg-sahara-card/40 border-t border-sahara-border/10 space-y-4">
              {isSaving ? (
                <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-wider">
                      New Preset Details
                    </span>
                    <button
                      onClick={() => setIsSaving(false)}
                      className="text-sahara-text-muted hover:text-sahara-text transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    autoFocus
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Name (e.g. Deep Work)"
                    className="w-full bg-sahara-surface border border-sahara-border/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-sahara-primary/50 transition-all shadow-inner"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-sahara-surface/50 border border-sahara-border/10 rounded-xl p-3">
                      <p className="text-[9px] font-bold text-sahara-text-muted uppercase mb-1">
                        Focus
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-sahara-text">
                          {currentDurations.work / 60}m
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              useTimerStore
                                .getState()
                                .setDurations(
                                  currentDurations.work - 300,
                                  currentDurations.short,
                                  currentDurations.long,
                                )
                            }
                            className="w-5 h-5 flex items-center justify-center rounded bg-sahara-card hover:bg-sahara-border/20 text-sahara-text-muted transition-colors"
                          >
                            -
                          </button>
                          <button
                            onClick={() =>
                              useTimerStore
                                .getState()
                                .setDurations(
                                  currentDurations.work + 300,
                                  currentDurations.short,
                                  currentDurations.long,
                                )
                            }
                            className="w-5 h-5 flex items-center justify-center rounded bg-sahara-card hover:bg-sahara-border/20 text-sahara-text-muted transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-sahara-surface/50 border border-sahara-border/10 rounded-xl p-3">
                      <p className="text-[9px] font-bold text-sahara-text-muted uppercase mb-1">
                        Break
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-sahara-text">
                          {currentDurations.short / 60}m
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              useTimerStore
                                .getState()
                                .setDurations(
                                  currentDurations.work,
                                  currentDurations.short - 60,
                                  currentDurations.long,
                                )
                            }
                            className="w-5 h-5 flex items-center justify-center rounded bg-sahara-card hover:bg-sahara-border/20 text-sahara-text-muted transition-colors"
                          >
                            -
                          </button>
                          <button
                            onClick={() =>
                              useTimerStore
                                .getState()
                                .setDurations(
                                  currentDurations.work,
                                  currentDurations.short + 60,
                                  currentDurations.long,
                                )
                            }
                            className="w-5 h-5 flex items-center justify-center rounded bg-sahara-card hover:bg-sahara-border/20 text-sahara-text-muted transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="solid"
                    intent="sahara"
                    fullWidth
                    onClick={handleSave}
                    disabled={!newPresetName.trim()}
                    className="py-3 shadow-lg shadow-sahara-primary/20"
                  >
                    Confirm & Save Preset
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSaving(true)}
                  className="w-full py-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-sahara-text-muted hover:text-sahara-primary transition-all border border-dashed border-sahara-border/30 rounded-2xl hover:border-sahara-primary/30 hover:bg-sahara-primary/5 group"
                >
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Create New Preset
                </button>
              )}
            </div>

            {timerStatus !== "idle" && (
              <div className="px-6 py-2.5 bg-amber-50 text-[10px] text-amber-700 font-black text-center uppercase tracking-widest border-t border-amber-100">
                ⚠️ Timer is active - Mode switching disabled
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
