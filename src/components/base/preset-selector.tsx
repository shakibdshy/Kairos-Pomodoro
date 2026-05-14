import { useReducer, useEffect } from "react";
import { usePresetsStore } from "@/features/timer/use-presets-store";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { Button } from "@/components/ui/button";
import { Settings2, Check, Trash2, Plus, Clock, Pencil } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TimerPreset } from "@/lib/db";
import { ModalOverlay } from "@/components/ui/modal-overlay";

type PresetUI =
  | { type: "closed" }
  | { type: "browsing" }
  | { type: "editing"; preset: TimerPreset; name: string; work: number; break: number }
  | { type: "saving-new"; name: string };

type UIAction =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "START_EDIT"; preset: TimerPreset }
  | { type: "SET_EDIT_NAME"; name: string }
  | { type: "SET_EDIT_WORK"; work: number }
  | { type: "SET_EDIT_BREAK"; break_: number }
  | { type: "END_EDIT" }
  | { type: "START_SAVE" }
  | { type: "SET_NEW_NAME"; name: string }
  | { type: "END_SAVE" };

function uiReducer(state: PresetUI, action: UIAction): PresetUI {
  switch (action.type) {
    case "OPEN":
      return { type: "browsing" };
    case "CLOSE":
      return { type: "closed" };
    case "START_EDIT":
      return {
        type: "editing",
        preset: action.preset,
        name: action.preset.name,
        work: action.preset.work_duration,
        break: action.preset.short_break_duration,
      };
    case "SET_EDIT_NAME":
      return state.type === "editing" ? { ...state, name: action.name } : state;
    case "SET_EDIT_WORK":
      return state.type === "editing" ? { ...state, work: action.work } : state;
    case "SET_EDIT_BREAK":
      return state.type === "editing" ? { ...state, break: action.break_ } : state;
    case "END_EDIT":
      return { type: "browsing" };
    case "START_SAVE":
      return { type: "saving-new", name: "" };
    case "SET_NEW_NAME":
      return state.type === "saving-new" ? { ...state, name: action.name } : state;
    case "END_SAVE":
      return { type: "browsing" };
  }
}

export function PresetSelector() {
  const [ui, dispatch] = useReducer(uiReducer, { type: "closed" as const });

  const presets = usePresetsStore((s) => s.presets);
  const loadPresets = usePresetsStore((s) => s.loadPresets);
  const applyPreset = usePresetsStore((s) => s.applyPreset);
  const savePreset = usePresetsStore((s) => s.savePreset);
  const editPreset = usePresetsStore((s) => s.editPreset);
  const removePreset = usePresetsStore((s) => s.removePreset);
  const loaded = usePresetsStore((s) => s.loaded);
  const currentDurations = useTimerStore((s) => s.durations);
  const timerStatus = useTimerStore((s) => s.status);

  useEffect(() => {
    if (!loaded) loadPresets();
  }, [loaded, loadPresets]);

  const handleSave = async () => {
    if (ui.type !== "saving-new" || !ui.name.trim()) return;
    await savePreset(ui.name.trim());
    dispatch({ type: "END_SAVE" });
  };

  const handleSaveEdit = async () => {
    if (ui.type !== "editing" || !ui.name.trim()) return;
    useTimerStore
      .getState()
      .setDurations(ui.work, ui.break, ui.preset.long_break_duration);
    await editPreset(ui.preset.id, ui.name.trim());
    dispatch({ type: "END_EDIT" });
  };

  const isCurrentPreset = (preset: TimerPreset) => {
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
        onClick={() => dispatch({ type: "OPEN" })}
        className="gap-1.5 border-sahara-border/30 cursor-pointer text-sahara-text-secondary hover:text-sahara-primary"
      >
        <Settings2 className="size-3.5" />
        <span className="text-[11px] font-bold uppercase tracking-wider">
          Presets
        </span>
      </Button>

      <ModalOverlay
        open={ui.type !== "closed"}
        onClose={() => dispatch({ type: "CLOSE" })}
        maxWidth="max-w-md"
        backdropClassName="bg-black/40"
      >
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
            onClick={() => dispatch({ type: "CLOSE" })}
            className="p-2 hover:bg-sahara-card rounded-full transition-colors"
          >
            <Plus className="size-5 text-sahara-text-muted rotate-45" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
          {presets.map((preset) => {
            const active = isCurrentPreset(preset);
            return (
              <div
                key={preset.id}
                role="button"
                tabIndex={0}
                className={cn(
                  "group flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer",
                  active
                    ? "bg-sahara-primary/5 border-sahara-primary/30 shadow-sm"
                    : "bg-sahara-card/50 border-sahara-border/10 hover:border-sahara-primary/20",
                )}
                onClick={() => {
                  if (timerStatus !== "idle") return;
                  applyPreset(preset);
                  dispatch({ type: "CLOSE" });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (timerStatus !== "idle") return;
                    applyPreset(preset);
                    dispatch({ type: "CLOSE" });
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center transition-colors",
                      active
                        ? "bg-sahara-primary text-white"
                        : "bg-sahara-surface text-sahara-text-muted",
                    )}
                  >
                    <Clock className="size-5" />
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
                      <span className="size-1 rounded-full bg-sahara-border" />
                      <span>{preset.short_break_duration / 60}m Break</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {active ? (
                    <div className="p-1.5 rounded-full bg-sahara-primary/10 text-sahara-primary">
                      <Check className="size-4" />
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ type: "START_EDIT", preset });
                        }}
                        className="p-2 text-sahara-text-muted hover:text-sahara-primary hover:bg-sahara-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePreset(preset.id);
                        }}
                        className="p-2 text-sahara-text-muted cursor-pointer hover:text-red-400 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-5 bg-sahara-card/40 border-t border-sahara-border/10 space-y-4">
          {ui.type === "editing" ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-wider">
                  Edit Preset
                </span>
                <button
                  onClick={() => dispatch({ type: "END_EDIT" })}
                  className="text-sahara-text-muted cursor-pointer hover:text-sahara-text transition-colors"
                >
                  <Plus className="size-4 rotate-45" />
                </button>
              </div>

              <input
                type="text"
                value={ui.name}
                onChange={(e) => dispatch({ type: "SET_EDIT_NAME", name: e.target.value })}
                placeholder="Preset name"
                className="w-full bg-sahara-surface border border-sahara-border/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-sahara-primary/50 transition-all shadow-inner"
              />

              <div className="grid grid-cols-2 gap-3">
                <DurationControl
                  label="Focus"
                  value={ui.work}
                  onChange={(v) => dispatch({ type: "SET_EDIT_WORK", work: v })}
                  step={300}
                />
                <DurationControl
                  label="Break"
                  value={ui.break}
                  onChange={(v) => dispatch({ type: "SET_EDIT_BREAK", break_: v })}
                  step={60}
                />
              </div>

              <Button
                variant="solid"
                intent="sahara"
                fullWidth
                onClick={handleSaveEdit}
                disabled={!ui.name.trim()}
                className="py-3 shadow-lg shadow-sahara-primary/20"
              >
                Save Changes
              </Button>
            </div>
          ) : ui.type === "saving-new" ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-wider">
                  New Preset Details
                </span>
                <button
                  onClick={() => dispatch({ type: "END_SAVE" })}
                  className="text-sahara-text-muted hover:text-sahara-text transition-colors"
                >
                  <Plus className="size-4 rotate-45" />
                </button>
              </div>

              <input
                type="text"
                value={ui.name}
                onChange={(e) => dispatch({ type: "SET_NEW_NAME", name: e.target.value })}
                placeholder="Name (e.g. Deep Work)"
                className="w-full bg-sahara-surface border border-sahara-border/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-sahara-primary/50 transition-all shadow-inner"
              />

              <div className="grid grid-cols-2 gap-3">
                <DurationControl
                  label="Focus"
                  value={currentDurations.work}
                  onChange={(v) =>
                    useTimerStore
                      .getState()
                      .setDurations(v, currentDurations.short, currentDurations.long)
                  }
                  step={300}
                />
                <DurationControl
                  label="Break"
                  value={currentDurations.short}
                  onChange={(v) =>
                    useTimerStore
                      .getState()
                      .setDurations(currentDurations.work, v, currentDurations.long)
                  }
                  step={60}
                />
              </div>

              <Button
                variant="solid"
                intent="sahara"
                fullWidth
                onClick={handleSave}
                disabled={!ui.name.trim()}
                className="py-3 shadow-lg shadow-sahara-primary/20 cursor-pointer"
              >
                Confirm & Save Preset
              </Button>
            </div>
          ) : (
            <button
              onClick={() => dispatch({ type: "START_SAVE" })}
              className="w-full py-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-sahara-text-muted hover:text-sahara-primary transition-all border border-dashed border-sahara-border/30 rounded-2xl hover:border-sahara-primary/30 hover:bg-sahara-primary/5 group cursor-pointer"
            >
              <Plus className="size-4 group-hover:scale-110 transition-transform" />
              Create New Preset
            </button>
          )}
        </div>

        {timerStatus !== "idle" && (
          <div className="px-6 py-2.5 bg-amber-50 text-[10px] text-amber-700 font-black text-center uppercase tracking-widest border-t border-amber-100">
            Timer is active - Mode switching disabled
          </div>
        )}
      </ModalOverlay>
    </div>
  );
}

function DurationControl({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step: number;
}) {
  return (
    <div className="bg-sahara-surface/50 border border-sahara-border/10 rounded-xl p-3">
      <p className="text-[9px] font-bold text-sahara-text-muted uppercase mb-1">
        {label}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-sahara-text">
          {value / 60}m
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onChange(Math.max(60, value - step))}
            className="size-5 flex items-center justify-center rounded bg-sahara-card cursor-pointer hover:bg-sahara-border/20 text-sahara-text-muted transition-colors"
          >
            -
          </button>
          <button
            onClick={() => onChange(value + step)}
            className="size-5 flex items-center justify-center rounded bg-sahara-card cursor-pointer hover:bg-sahara-border/20 text-sahara-text-muted transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
