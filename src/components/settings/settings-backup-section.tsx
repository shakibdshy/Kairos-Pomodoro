import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportBackup, importBackup, type BackupResult } from "@/lib/backup";
import { setSetting, getSetting } from "@/lib/db";
import { isTauri } from "@/lib/tauri";
import { Download, Upload, AlertTriangle, CheckCircle2 } from "lucide-react";

const LAST_BACKUP_KEY = "last_backup_at";

type Status =
  | { kind: "idle" }
  | { kind: "working"; label: string }
  | { kind: "success"; label: string }
  | { kind: "error"; label: string };

export function SettingsBackupSection() {
  const [exportStatus, setExportStatus] = useState<Status>({ kind: "idle" });
  const [restoreStatus, setRestoreStatus] = useState<Status>({ kind: "idle" });
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Load last backup timestamp lazily on first interaction.
  const refreshLastBackup = async () => {
    try {
      const v = await getSetting(LAST_BACKUP_KEY);
      setLastBackup(v);
    } catch {
      // ignore
    }
  };

  const handleExport = async () => {
    if (!isTauri()) return;
    setExportStatus({ kind: "working", label: "Preparing backup…" });
    const res = await exportBackup();
    if (res.ok) {
      const now = new Date().toISOString();
      try {
        await setSetting(LAST_BACKUP_KEY, now);
        setLastBackup(now);
      } catch {
        // ignore
      }
      setExportStatus({
        kind: "success",
        label: res.path ? `Saved to ${res.path}` : "Backup saved.",
      });
    } else if (res.error === "Cancelled") {
      setExportStatus({ kind: "idle" });
    } else {
      setExportStatus({ kind: "error", label: res.error ?? "Backup failed." });
    }
  };

  const handleRestoreConfirmed = async () => {
    setConfirming(false);
    if (!isTauri()) return;
    setRestoreStatus({ kind: "working", label: "Restoring…" });
    const res = await importBackup();
    if (res.ok) {
      const total = res.counts
        ? Object.values(res.counts).reduce((a, b) => a + b, 0)
        : 0;
      setRestoreStatus({
        kind: "success",
        label: `Restored ${total} records. Restart the app to see all changes.`,
      });
    } else if (res.error === "Cancelled") {
      setRestoreStatus({ kind: "idle" });
    } else {
      setRestoreStatus({ kind: "error", label: res.error ?? "Restore failed." });
    }
  };

  return (
    <section onFocus={refreshLastBackup} onMouseEnter={refreshLastBackup}>
      <h3 className="font-serif text-xl md:text-2xl text-sahara-text mb-6 md:mb-8">
        Backup & Restore
      </h3>

      <div className="bg-sahara-bg/50 border border-sahara-border/15 rounded-xl md:rounded-2xl p-4 md:p-6 space-y-5">
        <p className="text-sm text-sahara-text-secondary leading-relaxed">
          Export all your data (sessions, tasks, categories, presets, settings,
          journal, and time blocks) to a single JSON file. Restore later or move
          your data to another device.
        </p>

        {/* Export */}
        <div className="pt-4 border-t border-sahara-border/20 space-y-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-sahara-text">
                Export backup
              </p>
              <p className="text-xs text-sahara-text-muted mt-0.5">
                {lastBackup
                  ? `Last backup: ${new Date(lastBackup).toLocaleString()}`
                  : "No backup created yet."}
              </p>
            </div>
            <Button
              variant="outline"
              intent="sahara"
              size="sm"
              shape="rounded-xl"
              disabled={exportStatus.kind === "working"}
              onClick={handleExport}
              className="gap-2 text-[11px]"
            >
              <Download className="size-3.5" />
              {exportStatus.kind === "working"
                ? exportStatus.label
                : "Export Backup"}
            </Button>
          </div>
          <StatusLine status={exportStatus} />
        </div>

        {/* Restore */}
        <div className="pt-4 border-t border-sahara-border/20 space-y-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-sahara-text">
                Restore from file
              </p>
              <p className="text-xs text-sahara-text-muted mt-0.5">
                Replaces all current data. Export a backup first.
              </p>
            </div>
            <Button
              variant="outline"
              intent="sahara"
              size="sm"
              shape="rounded-xl"
              disabled={
                restoreStatus.kind === "working" || confirming
              }
              onClick={() => setConfirming(true)}
              className="gap-2 text-[11px]"
            >
              <Upload className="size-3.5" />
              Restore Backup
            </Button>
          </div>

          {confirming && (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <AlertTriangle className="size-4 text-amber-600 shrink-0" />
              <p className="text-xs text-sahara-text-secondary flex-1">
                This will <strong>replace all current data</strong>. Export a
                backup first if you might want it back. Continue?
              </p>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="ghost"
                  intent="default"
                  size="xs"
                  onClick={() => setConfirming(false)}
                  className="text-[10px]"
                >
                  Cancel
                </Button>
                <Button
                  variant="solid"
                  intent="red"
                  size="xs"
                  onClick={handleRestoreConfirmed}
                  className="text-[10px]"
                >
                  Restore
                </Button>
              </div>
            </div>
          )}

          <StatusLine status={restoreStatus} />
        </div>
      </div>
    </section>
  );
}

function StatusLine({ status }: { status: BackupResult | Status }) {
  // Normalize: BackupResult from older state isn't passed here, only Status.
  const s = status as Status;
  if (s.kind === "idle" || s.kind === "working") {
    return s.kind === "working" ? (
      <p className="text-xs text-sahara-text-muted uppercase tracking-wider">
        {s.label}
      </p>
    ) : null;
  }
  if (s.kind === "success") {
    return (
      <p className="flex items-start gap-2 text-xs text-green-600 uppercase tracking-wider">
        <CheckCircle2 className="size-3.5 mt-0.5 shrink-0" />
        <span className="normal-case tracking-normal">{s.label}</span>
      </p>
    );
  }
  return (
    <p className="flex items-start gap-2 text-xs text-red-600 uppercase tracking-wider">
      <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
      <span className="normal-case tracking-normal">{s.label}</span>
    </p>
  );
}
