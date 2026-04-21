import type { DayData } from "@/lib/db";
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

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WeeklyChartProps {
  data: DayData[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const chartData = WEEK_DAYS.map((day) => {
    const found = data.find((d) => d.day_name === day);
    return {
      name: day,
      hours: found ? Math.round((found.total_seconds / 3600) * 10) / 10 : 0,
      sessions: found?.session_count ?? 0,
    };
  });

  const peakDay = chartData.reduce(
    (max, d) => (d.hours > max.hours ? d : max),
    chartData[0],
  );

  return (
    <div className="bg-sahara-surface border border-sahara-border/20 rounded-3xl p-8 shadow-sm shadow-sahara-primary/5">
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
          THIS WEEK
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M7 10l5 5 5-5" />
          </svg>
        </div>
      </div>

      <div style={{ height: 300 }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="25%"
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
                  const entry = payload[0].payload;
                  return (
                    <div className="bg-sahara-text text-white px-4 py-2.5 rounded-lg text-xs shadow-xl space-y-1">
                      <p className="font-bold">
                        {entry.name} — {entry.payload.hours}h
                      </p>
                      <p className="opacity-80">
                        {entry.payload.sessions} session
                        {entry.payload.sessions !== 1 ? "s" : ""}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="hours" radius={[8, 8, 8, 8]} barSize={44}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.name === peakDay.name && entry.hours > 0
                      ? "#c2652a"
                      : "#fbe8d8"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {data.length > 0 && (
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-sahara-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-sahara-primary" /> Peak Day
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-sahara-primary-light" />{" "}
            Regular
          </span>
        </div>
      )}
    </div>
  );
}
