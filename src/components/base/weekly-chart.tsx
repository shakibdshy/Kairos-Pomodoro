import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatTotalTime } from "@/lib/session-utils";
import type { DayData } from "@/lib/db";

interface WeeklyChartProps {
  data: DayData[];
  startDate: string;
  endDate: string;
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fillDateRange(
  data: DayData[],
  startDate: string,
  endDate: string,
): DayData[] {
  const map = new Map(data.map((d) => [d.date, d]));
  const result: DayData[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = toISODate(d);
    const existing = map.get(iso);
    if (existing) {
      result.push(existing);
    } else {
      result.push({
        date: iso,
        day_name: new Date(iso).toLocaleDateString("en-US", {
          weekday: "short",
        }),
        total_seconds: 0,
        session_count: 0,
      });
    }
  }
  return result;
}

function formatTick(date: string, dayCount: number): string {
  const d = new Date(date);
  if (dayCount <= 7) {
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }
  if (dayCount <= 31) {
    return String(d.getDate());
  }
  return d.toLocaleDateString("en-US", { month: "short" });
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: DayData & { minutes: number };
  }>;
}) {
  if (!active || !payload?.length) return null;

  const d = payload[0].payload;

  if (d.total_seconds === 0) {
    return (
      <div className="bg-sahara-bg border border-sahara-border/30 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-[11px] font-semibold text-sahara-text">
          {new Date(d.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
        <p className="text-[10px] text-sahara-text-muted">No sessions</p>
      </div>
    );
  }

  return (
    <div className="bg-sahara-bg border border-sahara-border/30 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[11px] font-semibold text-sahara-text">
        {new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </p>
      <p className="text-[10px] text-sahara-primary font-bold tabular-nums">
        {formatTotalTime(d.total_seconds)} focused
      </p>
    </div>
  );
}

export function WeeklyChart({ data, startDate, endDate }: WeeklyChartProps) {
  const sorted = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const filled = fillDateRange(sorted, startDate, endDate);

  const chartData = filled.map((d) => ({
    ...d,
    minutes: Math.round(d.total_seconds / 60),
  }));

  const dayCount = chartData.length;
  const maxVal = Math.max(...chartData.map((d) => d.minutes), 1);
  const yMax = Math.ceil(maxVal / 15) * 15 || 15;

  if (dayCount === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-xs text-sahara-text-muted">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c2652a" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#c2652a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#9ca3af",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
            dy={8}
            interval="preserveStartEnd"
            tickFormatter={(value) => formatTick(value, dayCount)}
            minTickGap={24}
          />
          <YAxis hide domain={[0, yMax]} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: "rgba(194, 101, 42, 0.2)",
              strokeWidth: 1,
            }}
          />
          <Area
            type="monotone"
            dataKey="minutes"
            stroke="#c2652a"
            strokeWidth={2}
            fill="url(#focusGradient)"
            animationDuration={800}
            animationEasing="ease-out"
            dot={{ r: 3, fill: "#c2652a", strokeWidth: 0 }}
            activeDot={{
              r: 5,
              fill: "#c2652a",
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
