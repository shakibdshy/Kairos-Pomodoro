import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/db";
import { isTauri } from "@/lib/tauri";

/** Tables wiped by "Clear All Data", named for the failure message. */
const WIPED_TABLES = [
  "sessions",
  "tasks",
  "categories",
  "settings",
  "_schema_meta",
] as const;

type ClearState =
  | { status: "idle" }
  | { status: "clearing" }
  | { status: "cleared" }
  | { status: "error"; failed: string[] };

export function SettingsPrivacySection() {
  const [state, setState] = useState<ClearState>({ status: "idle" });

  const handleClearAllData = async () => {
    if (!isTauri()) return;
    setState({ status: "clearing" });
    try {
      const db = await getDb();

      // All tables are attempted even if one fails, so a single failure cannot
      // leave the rest of the user's data behind. Promise.all would stop at the
      // first rejection and report nothing about the deletes already in flight.
      const results = await Promise.allSettled(
        WIPED_TABLES.map((table) => db.execute(`DELETE FROM ${table}`)),
      );

      const failed = WIPED_TABLES.filter(
        (_, i) => results[i]?.status === "rejected",
      );
      if (failed.length > 0) {
        // Partial wipe: say so plainly rather than implying a clean slate.
        console.error("[Privacy] Failed to clear tables:", failed.join(", "));
        setState({ status: "error", failed: [...failed] });
        return;
      }
      setState({ status: "cleared" });
    } catch (err) {
      console.error("[Privacy] Clear all data failed:", err);
      setState({ status: "error", failed: ["database"] });
    }
  };

  const clearing = state.status === "clearing";

  return (
    <section>
      <h3 className="font-serif text-xl md:text-2xl text-sahara-text mb-6 md:mb-8">
        Privacy & Data
      </h3>
      <div className="bg-sahara-bg/50 border border-sahara-border/15 rounded-xl md:rounded-2xl p-4 md:p-6 space-y-4">
        <p className="text-sm text-sahara-text-secondary leading-relaxed">
          All your data is stored locally on this device using SQLite. No data
          is sent to any external server.
        </p>
        <div className="pt-4 border-t border-sahara-border/20 space-y-3">
          {state.status === "cleared" ? (
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">
              All data cleared successfully. Restart the app to start fresh.
            </p>
          ) : (
            <>
              <Button
                variant="outline"
                intent="red"
                size="sm"
                shape="rounded-xl"
                disabled={clearing}
                onClick={handleClearAllData}
                className="gap-2 text-[11px]"
              >
                {clearing ? "Clearing…" : "Clear All Data"}
              </Button>
              {state.status === "error" && (
                <div
                  role="alert"
                  className="text-xs font-semibold text-red-600 tracking-wide space-y-1"
                >
                  <p className="uppercase">
                    Could not clear all data
                    {state.failed.length > 0 && (
                      <> — failed: {state.failed.join(", ")}</>
                    )}
                    . Some data may still be present. Try again.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
