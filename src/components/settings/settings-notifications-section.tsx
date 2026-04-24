import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/cn";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Volume2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { sendNotification } from "@/lib/notifications";

interface NotificationStatus {
  status: "granted" | "denied" | "unknown" | "unavailable";
  checking: boolean;
  error: string | null;
}

interface SettingsNotificationsProps {
  notifStatus: NotificationStatus;
  requestPermission: () => void;
  soundEnabled: boolean;
  onSoundToggle: (v: boolean) => void;
}

export function SettingsNotifications({
  notifStatus,
  requestPermission,
  soundEnabled,
  onSoundToggle,
}: SettingsNotificationsProps) {
  const [testing, setTesting] = useState(false);

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

  const openSystemPreferences = () => {
    try {
      window.open(
        "x-apple.systempreferences:com.apple.preference.notifications",
        "_blank",
      );
    } catch {}
  };

  const { status, checking, error } = notifStatus;

  return (
    <section>
      <h3 className="font-serif text-xl md:text-2xl text-sahara-text mb-6 md:mb-8">
        Notifications & Sounds
      </h3>

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
            {checking && (
              <span className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-sahara-primary uppercase tracking-wider">
                <Loader2 className="w-3 h-3 md:w-3.5 md:h-3.5 animate-spin" />
                Requesting...
              </span>
            )}
            {!checking && status === "granted" && (
              <span className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-green-600 uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                Enabled
              </span>
            )}
            {!checking && status === "denied" && (
              <span className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-red-500 uppercase tracking-wider">
                <XCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                Disabled
              </span>
            )}
            {!checking && status === "unknown" && (
              <span className="text-[10px] md:text-[11px] font-bold text-sahara-text-muted uppercase tracking-wider">
                Not checked
              </span>
            )}
            {!checking && status === "unavailable" && (
              <span className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                Browser Mode
              </span>
            )}
          </div>
        </div>

        {error && status !== "unavailable" && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200/50 text-red-600 text-[10px] md:text-[11px]">
            Error: {error}
          </div>
        )}

        {status === "unavailable" && (
          <div className="mb-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl bg-amber-50 border border-amber-200/40 text-amber-700 text-[10px] md:text-[11px] leading-relaxed">
            Notifications require the Tauri desktop app. You&apos;re currently
            running in browser dev mode. Run{" "}
            <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-[9px] md:text-[10px]">
              npm run tauri dev
            </code>{" "}
            to enable native macOS notifications.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {(status === "denied" || status === "unknown") && (
            <Button
              variant="solid"
              intent="sahara"
              size="sm"
              onClick={() => requestPermission()}
              disabled={checking}
              className="gap-2 text-[10px] md:text-[11px] tracking-wider"
            >
              {checking ? (
                <Loader2 className="w-3 h-3 md:w-3.5 md:h-3.5 animate-spin" />
              ) : (
                <Bell className="w-3 h-3 md:w-3.5 md:h-3.5" />
              )}
              {checking ? "Requesting..." : "Enable Notifications"}
            </Button>
          )}

          <Button
            variant="outline"
            intent={testing ? "green" : "default"}
            size="sm"
            disabled={testing || status !== "granted"}
            onClick={handleTestNotification}
            className={cn(
              "gap-2 text-[10px] md:text-[11px] tracking-wider",
              !testing && status !== "granted" && "opacity-40",
            )}
          >
            <Volume2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
            {testing ? "Sent!" : "Test Notification"}
          </Button>

          {status === "denied" && !checking && (
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

        {status === "denied" && !checking && (
          <p className="mt-3 text-[10px] md:text-[11px] text-sahara-text-muted leading-relaxed">
            Kairos needs permission to show notifications. Click{" "}
            <strong>"Enable Notifications"</strong> above to trigger the macOS
            permission dialog, or open{" "}
            <strong>System Preferences → Notifications</strong> manually and
            find <em>Kairos</em> in the list.
          </p>
        )}
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="font-bold text-sahara-text-secondary text-sm block">
              End of session chime
            </span>
            <span className="text-[11px] text-sahara-text-muted mt-0.5 block">
              Play a sound when timer completes
            </span>
          </div>
          <Switch
            checked={soundEnabled}
            onCheckedChange={onSoundToggle}
            className="ml-4"
          />
        </div>
      </div>
    </section>
  );
}
