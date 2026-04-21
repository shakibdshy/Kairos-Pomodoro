import { MainLayout } from "@/template/main-layout";
import {
  Download,
  Flame,
  CheckCircle2,
  Award,
  Lock,
  ChevronRight,
  Clock,
} from "lucide-react";
import type { Route } from "@/app/router";
import { cn } from "@/lib/cn";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface AnalyticsPageProps {
  onNavigate: (route: Route) => void;
  currentRoute: Route;
}

const data = [
  { name: "Mon", hours: 4.5 },
  { name: "Tue", hours: 5.2 },
  { name: "Wed", hours: 6.2 },
  { name: "Thu", hours: 3.8 },
  { name: "Fri", hours: 4.8 },
  { name: "Sat", hours: 2.5 },
  { name: "Sun", hours: 1.5 },
];

export function AnalyticsPage({
  onNavigate,
  currentRoute,
}: AnalyticsPageProps) {
  const stats = [
    {
      id: "total_focus",
      label: "Total Focus Time",
      value: "42",
      unit: "h",
      subValue: "15",
      subUnit: "m",
      change: "+12% this week",
      icon: Clock,
    },
    {
      id: "current_streak",
      label: "Current Streak",
      value: "7",
      unit: "Days",
      change: "Personal Best: 14",
      icon: Flame,
    },
    {
      id: "sessions",
      label: "Sessions Completed",
      value: "128",
      icon: CheckCircle2,
    },
  ];

  const badges = [
    {
      id: "deep_diver",
      label: "Deep Diver",
      description: "4h continuous",
      icon: Award,
      locked: false,
    },
    {
      id: "iron_will",
      label: "Iron Will",
      description: "7 day streak",
      icon: Award,
      locked: false,
    },
    {
      id: "zen_master",
      label: "Zen Master",
      description: "100h total",
      icon: Lock,
      locked: true,
    },
  ];

  const SessionsIcon = stats[2].icon;

  return (
    <MainLayout onNavigate={onNavigate} currentRoute={currentRoute}>
      <div className="px-12 py-12 max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-serif text-4xl text-sahara-text uppercase tracking-widest text-[12px] font-bold mb-2">
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

        <div className="grid grid-cols-12 gap-8">
          {/* Main Chart Area */}
          <div className="col-span-8 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              {stats.slice(0, 2).map((stat) => {
                const StatIcon = stat.icon;
                return (
                  <div
                    key={stat.id}
                    className="bg-white border border-sahara-border/20 rounded-3xl p-8 flex flex-col justify-between shadow-sm shadow-sahara-primary/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-sahara-primary-light flex items-center justify-center text-sahara-primary">
                        <StatIcon className="w-6 h-6" />
                      </div>
                      {stat.change && (
                        <span className="bg-sahara-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                          {stat.change}
                        </span>
                      )}
                    </div>
                    <div className="mt-8">
                      <p className="text-xs font-bold text-sahara-text-muted uppercase tracking-[0.2em] mb-2">
                        {stat.label}
                      </p>
                      <div className="flex items-baseline gap-1 font-serif">
                        <span className="text-5xl text-sahara-text">
                          {stat.value}
                        </span>
                        <span className="text-2xl text-sahara-text-muted lowercase">
                          {stat.unit}
                        </span>
                        {stat.subValue && (
                          <>
                            <span className="text-5xl text-sahara-text ml-2">
                              {stat.subValue}
                            </span>
                            <span className="text-2xl text-sahara-text-muted lowercase">
                              {stat.subUnit}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white border border-sahara-border/20 rounded-3xl p-8 shadow-sm shadow-sahara-primary/5">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-serif text-2xl text-sahara-text">
                    Focus Distribution
                  </h3>
                  <p className="text-xs text-sahara-text-muted mt-1">
                    Hours spent per day this week
                  </p>
                </div>
                <div className="bg-sahara-card px-4 py-2 rounded-xl text-xs font-bold text-sahara-text-secondary flex items-center gap-2">
                  THIS WEEK <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>

              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      stroke="#f0e8df"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9a9088", fontSize: 12, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: "#fbe8d8", opacity: 0.4 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-sahara-text text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl">
                              {payload[0].value}h
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="hours" radius={[6, 6, 6, 6]} barSize={40}>
                      {data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.name === "Wed" ? "#c2652a" : "#fbe8d8"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Side Area */}
          <div className="col-span-4 space-y-8">
            <div className="bg-white border border-sahara-border/20 rounded-3xl p-8 flex flex-col shadow-sm shadow-sahara-primary/5">
              <div className="w-12 h-12 rounded-2xl bg-sahara-primary-light flex items-center justify-center text-sahara-primary mb-8">
                <SessionsIcon className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-sahara-text-muted uppercase tracking-[0.2em] mb-2">
                {stats[2].label}
              </p>
              <p className="font-serif text-5xl text-sahara-text">
                {stats[2].value}
              </p>
            </div>

            <div className="bg-white border border-sahara-border/20 rounded-3xl p-8 shadow-sm shadow-sahara-primary/5">
              <h3 className="font-serif text-2xl text-sahara-text mb-8">
                Recent Badges
              </h3>
              <div className="space-y-6">
                {badges.map((badge) => {
                  const BadgeIcon = badge.icon;
                  return (
                    <div
                      key={badge.id}
                      className="flex items-center gap-4 group"
                    >
                      <div
                        className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105",
                          badge.locked
                            ? "bg-sahara-card text-sahara-border"
                            : "bg-sahara-primary-light text-sahara-primary",
                        )}
                      >
                        <BadgeIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4
                          className={cn(
                            "font-serif text-lg leading-tight",
                            badge.locked
                              ? "text-sahara-text-muted"
                              : "text-sahara-text",
                          )}
                        >
                          {badge.label}
                        </h4>
                        <p className="text-[10px] font-bold text-sahara-text-muted uppercase tracking-widest mt-0.5">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
