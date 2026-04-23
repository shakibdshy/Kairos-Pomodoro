import { MainLayout } from "@/components/template/main-layout";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { AnalyticsDashboard } from "@/components/containers/analytics";

export function AnalyticsPage() {
  return (
    <MainLayout>
      <div className="px-12 py-12 max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-serif text-[12px] font-bold uppercase tracking-widest text-sahara-text-muted mb-2">
              Performance Overview
            </h1>
            <p className="font-serif text-4xl text-sahara-text">
              Your Focus Insights
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              intent="default"
              size="md"
              disabled
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              EXPORT CSV
            </Button>
            <Button
              variant="solid"
              intent="sahara"
              size="md"
              disabled
              className="gap-2 bg-sahara-primary/50"
            >
              <Download className="w-4 h-4" />
              EXPORT PDF
            </Button>
          </div>
        </header>

        <AnalyticsDashboard />
      </div>
    </MainLayout>
  );
}
