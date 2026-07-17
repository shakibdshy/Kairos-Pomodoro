import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { isTauri } from "@/lib/tauri";
import { X, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const RECHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

interface UpdateProviderProps {
  children: ReactNode;
}

/** Status surfaced to consumers (e.g. a Settings "Check for Updates" button). */
export type UpdateCheckStatus =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "up-to-date" }
  | { kind: "available", update: Update }
  | { kind: "error", message: string };

interface UpdateContextValue {
  /** Current status of the update check (idle / checking / up-to-date / available / error). */
  status: UpdateCheckStatus;
  /** The running app's version (from package.json via Tauri). Null outside Tauri. */
  currentVersion: string | null;
  /** Error from the last install attempt, if any. Cleared on a new install attempt. */
  installError: string | null;
  /** True when the new version was installed successfully but the app still needs a restart. */
  installedPendingRestart: boolean;
  /** Manually trigger an update check. Returns true if an update is available. */
  checkForUpdate: () => Promise<boolean>;
  /** Install the pending update, if any. */
  installUpdate: () => Promise<void>;
}

const UpdateContext = createContext<UpdateContextValue | null>(null);

/**
 * Read the update state + actions from anywhere in the tree.
 * Returns `null` outside the provider (e.g. in tests / non-Tauri contexts).
 */
export function useUpdate(): UpdateContextValue | null {
  return useContext(UpdateContext);
}

export function UpdateProvider({ children }: UpdateProviderProps) {
  const [pendingUpdate, setPendingUpdate] = useState<Update | null>(null);
  const [status, setStatus] = useState<UpdateCheckStatus>({ kind: "idle" });
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);
  const [installedPendingRestart, setInstalledPendingRestart] = useState(false);
  const dismissedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Read the running app's version (sourced from package.json via Tauri at
  // build time). Used to show "Current version: vX.Y.Z" in Settings so users
  // can see what they're running — essential for making sense of update state.
  useEffect(() => {
    if (!isTauri()) return;
    import("@tauri-apps/api/app")
      .then(({ getVersion }) => getVersion())
      .then(setCurrentVersion)
      .catch((err) => console.error("[UpdateProvider] getVersion failed:", err));
  }, []);

  const checkForUpdate = useCallback(async (): Promise<boolean> => {
    setStatus({ kind: "checking" });
    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const result = await check();
      if (result) {
        setPendingUpdate(result);
        setStatus({ kind: "available", update: result });
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return true;
      }
      setStatus({ kind: "up-to-date" });
      return false;
    } catch (err) {
      // Previously this was console.debug with "(expected in dev)", which hid
      // real production failures (e.g. CSP blocking the GitHub release redirect).
      // Log at error level so it shows in any console, and surface it in state
      // so Settings UI can report what went wrong instead of failing silently.
      console.error("[UpdateProvider] Update check failed:", err);
      setStatus({ kind: "error", message: String(err) });
      return false;
    }
  }, []);

  const installUpdate = useCallback(async () => {
    if (!pendingUpdate) return;
    setDownloading(true);
    setInstallError(null);
    setInstalledPendingRestart(false);

    // Step 1: download + install. If this fails, it's a genuine failure and
    // the user should retry / download manually.
    try {
      await pendingUpdate.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            console.log(
              `[Update] Downloading ${event.data.contentLength} bytes...`,
            );
            break;
          case "Finished":
            console.log("[Update] Download complete");
            break;
        }
      });
    } catch (err) {
      console.error("[UpdateProvider] Install failed:", err);
      setInstallError(String(err));
      setDownloading(false);
      return;
    }

    // Step 2: relaunch. By this point the new version is already on disk —
    // if relaunch throws (common on macOS after the binary was swapped), the
    // update still succeeded; we just need the user to restart manually.
    // Previously this shared the same try/catch as the install, so a relaunch
    // failure surfaced as "Update failed" even though the update had worked.
    try {
      await relaunch();
    } catch (err) {
      console.error("[UpdateProvider] Relaunch failed (update already installed):", err);
      setInstalledPendingRestart(true);
      setPendingUpdate(null);
      setStatus({ kind: "idle" });
      setDownloading(false);
    }
  }, [pendingUpdate]);

  useEffect(() => {
    if (!isTauri()) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      if (cancelled) return;
      const found = await checkForUpdate();
      if (!cancelled && !found) {
        intervalRef.current = setInterval(checkForUpdate, RECHECK_INTERVAL_MS);
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkForUpdate]);

  const handleDismiss = () => {
    dismissedRef.current = true;
    setPendingUpdate(null);
  };

  const value: UpdateContextValue = {
    status,
    currentVersion,
    installError,
    installedPendingRestart,
    checkForUpdate,
    installUpdate,
  };

  const showBanner = pendingUpdate && !dismissedRef.current;

  return (
    <UpdateContext.Provider value={value}>
      {children}

      {showBanner && (
        <div className="fixed bottom-4 right-4 z-200 max-w-sm animate-in slide-in-from-right-4 fade-in duration-300">
          <div className="bg-sahara-surface border border-sahara-border/30 rounded-2xl shadow-xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-sahara-primary-light flex items-center justify-center">
                  <Download className="size-4 text-sahara-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-sahara-text">
                    Update Available
                  </p>
                  <p className="text-[11px] text-sahara-text-muted">
                    v{pendingUpdate!.version}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                aria-label="Dismiss update"
                className="p-1 rounded-lg text-sahara-text-muted hover:text-sahara-text hover:bg-sahara-card transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {pendingUpdate!.body && (
              <p className="text-xs text-sahara-text-secondary leading-relaxed line-clamp-3">
                {pendingUpdate!.body}
              </p>
            )}

            {installError && (
              <div className="flex items-start gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                <AlertCircle className="size-3.5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-400 leading-relaxed">
                  Update failed. Please try again or download manually from GitHub.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="solid"
                intent="sahara"
                size="sm"
                shape="rounded-xl"
                onClick={installUpdate}
                disabled={downloading}
                className="gap-1.5 text-[10px] flex-1"
              >
                <Download className="size-3" />
                {downloading ? "Downloading…" : installError ? "Retry Update" : "Install Update"}
              </Button>
              <Button
                variant="outline"
                intent="default"
                size="sm"
                shape="rounded-xl"
                onClick={handleDismiss}
                className="text-[10px]"
              >
                Later
              </Button>
            </div>

            <p className="text-[9px] text-sahara-text-muted text-center">
              App will restart after installation
            </p>
          </div>
        </div>
      )}

      {/* Update installed successfully but the app couldn't auto-restart (common
          on macOS after the binary was swapped). Tell the user to restart
          manually — NOT an error, the update worked. */}
      {installedPendingRestart && !showBanner && (
        <div className="fixed bottom-4 right-4 z-200 max-w-sm animate-in slide-in-from-right-4 fade-in duration-300">
          <div className="bg-sahara-surface border border-emerald-500/30 rounded-2xl shadow-xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-sahara-text">
                    Update Installed
                  </p>
                  <p className="text-[11px] text-sahara-text-muted">
                    Please restart the app to finish.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInstalledPendingRestart(false)}
                aria-label="Dismiss"
                className="p-1 rounded-lg text-sahara-text-muted hover:text-sahara-text hover:bg-sahara-card transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </UpdateContext.Provider>
  );
}
