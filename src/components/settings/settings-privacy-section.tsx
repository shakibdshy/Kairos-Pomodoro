import { Button } from "@/components/ui/button";

export function SettingsPrivacySection() {
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
          <Button
            variant="outline"
            intent="red"
            size="sm"
            shape="rounded-xl"
            disabled
            className="gap-2 text-[11px]"
          >
            Clear All Data
          </Button>
        </div>
      </div>
    </section>
  );
}
