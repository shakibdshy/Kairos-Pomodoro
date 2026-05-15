import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/db";
import { isTauri } from "@/lib/tauri";

export function SettingsPrivacySection() {
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleClearAllData = async () => {
    if (!isTauri()) return;
    setClearing(true);
    try {
      const db = await getDb();
      await Promise.all([
        db.execute("DELETE FROM sessions"),
        db.execute("DELETE FROM tasks"),
        db.execute("DELETE FROM categories"),
        db.execute("DELETE FROM settings"),
        db.execute("DELETE FROM _schema_meta"),
      ]);
      setCleared(true);
    } catch {}
    setClearing(false);
  };

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
        <div className="pt-4 border-t border-sahara-border/20">
          {cleared ? (
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">
              All data cleared successfully. Restart the app to start fresh.
            </p>
          ) : (
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
          )}
        </div>
      </div>
    </section>
  );
}
