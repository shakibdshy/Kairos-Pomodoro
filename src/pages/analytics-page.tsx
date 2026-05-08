import { MainLayout } from "@/components/template/main-layout";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { AnalyticsDashboard } from "@/components/containers/analytics";

export function AnalyticsPage() {
  return (
    <MainLayout>
      <div className="px-4 sm:px-6 md:px-12 py-6 md:py-12 max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 md:mb-12">
          <div>
            <h1 className="font-serif text-[10px] md:text-[12px] font-bold uppercase tracking-widest text-sahara-text-muted mb-1 md:mb-2">
              Performance Overview
            </h1>
            <p className="font-serif text-xl font-bold tracking-wide md:text-4xl text-sahara-text">
              Your Focus Insights
            </p>
          </div>
          <div className="flex gap-2 md:gap-4 self-start sm:self-auto">
            <Button
              variant="outline"
              intent="default"
              size="sm"
              disabled
              className="gap-2 text-xs opacity-60 cursor-not-allowed"
              title="Export coming in a future update"
            >
              <Download className="w-3.5 h-3.5" />
              EXPORT CSV
            </Button>
            <Button
              variant="solid"
              intent="sahara"
              size="sm"
              disabled
              className="gap-2 bg-sahara-primary/50 text-xs opacity-60 cursor-not-allowed"
              title="Export coming in a future update"
            >
              <Download className="w-3.5 h-3.5" />
              EXPORT PDF
            </Button>
          </div>
        </header>

        <AnalyticsDashboard />
      </div>
    </MainLayout>
  );
}
