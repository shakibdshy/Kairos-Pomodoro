import { useState } from "react";
import { MainLayout } from "@/components/template/main-layout";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { AnalyticsDashboard } from "@/components/containers/analytics";
import { exportAnalyticsPdf } from "@/lib/export-pdf";
import type { DatePeriod } from "@/lib/date-range";

export function AnalyticsPage() {
  const [period, setPeriod] = useState<DatePeriod>("last7days");
  const [exporting, setExporting] = useState(false);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      await exportAnalyticsPdf(period);
    } catch (err) {
      console.error("[ExportPDF] Failed:", err);
    } finally {
      setExporting(false);
    }
  };

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
              variant="solid"
              intent="sahara"
              size="sm"
              onClick={handleExportPdf}
              disabled={exporting}
              className="gap-2 text-xs"
              title="Export analytics as PDF"
            >
              {exporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {exporting ? "EXPORTING..." : "EXPORT PDF"}
            </Button>
          </div>
        </header>

        <AnalyticsDashboard period={period} onPeriodChange={setPeriod} />
      </div>
    </MainLayout>
  );
}
