import { useEffect, useState, useCallback, type ReactNode } from "react";
import { isTauri } from "@/lib/tauri";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpdateInfo {
  version: string;
  date: string;
  body: string;
}

interface UpdateProviderProps {
  children: ReactNode;
}

export function UpdateProvider({ children }: UpdateProviderProps) {
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isTauri()) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const { check } = await import("@tauri-apps/plugin-updater");
        const result = await check();
        if (cancelled) return;

        if (result) {
          setUpdate({
            version: result.version,
            date: result.date ?? "",
            body: result.body ?? "",
          });
        }
      } catch (err) {
        console.debug("[UpdateProvider] Check failed (expected in dev):", err);
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!update) return;
    setDownloading(true);
    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const { relaunch } = await import("@tauri-apps/plugin-process");

      const result = await check();
      if (!result) return;

      await result.downloadAndInstall((event) => {
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

      await relaunch();
    } catch (err) {
      console.error("[UpdateProvider] Install failed:", err);
      setDownloading(false);
    }
  }, [update]);

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!update || dismissed) return <>{children}</>;

  return (
    <>
      {children}

      <div className="fixed bottom-4 right-4 z-200 max-w-sm animate-in slide-in-from-right-4 fade-in duration-300">
        <div className="bg-sahara-surface border border-sahara-border/30 rounded-2xl shadow-xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-sahara-primary-light flex items-center justify-center">
                <Download className="w-4 h-4 text-sahara-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-sahara-text">
                  Update Available
                </p>
                <p className="text-[11px] text-sahara-text-muted">
                  v{update.version}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-sahara-text-muted hover:text-sahara-text hover:bg-sahara-card transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {update.body && (
            <p className="text-xs text-sahara-text-secondary leading-relaxed line-clamp-3">
              {update.body}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="solid"
              intent="sahara"
              size="sm"
              shape="rounded-xl"
              onClick={handleInstall}
              disabled={downloading}
              className="gap-1.5 text-[10px] flex-1"
            >
              <Download className="w-3 h-3" />
              {downloading ? "Downloading..." : "Install Update"}
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
    </>
  );
}
