import { MainLayout } from "@/template/main-layout";
import { Download } from "lucide-react";
import type { Route } from "@/app/router";
import { AnalyticsDashboard } from "@/containers/analytics";

interface AnalyticsPageProps {
  onNavigate: (route: Route) => void;
  currentRoute: Route;
}

export function AnalyticsPage({
  onNavigate,
  currentRoute,
}: AnalyticsPageProps) {
  return (
    <MainLayout onNavigate={onNavigate} currentRoute={currentRoute}>
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
            <button className="flex items-center gap-2 bg-white border border-sahara-border/30 text-sahara-text-secondary px-6 py-3 rounded-xl font-bold text-xs tracking-widest hover:bg-sahara-card transition-colors">
              <Download className="w-4 h-4" />
              EXPORT CSV
            </button>
            <button className="flex items-center gap-2 bg-sahara-primary text-white px-6 py-3 rounded-xl font-bold text-xs tracking-widest hover:bg-sahara-primary/90 transition-colors shadow-lg shadow-sahara-primary/20">
              <Download className="w-4 h-4" />
              EXPORT PDF
            </button>
          </div>
        </header>

        <AnalyticsDashboard />
      </div>
    </MainLayout>
  );
}
