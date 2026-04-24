import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface WeekPoint {
  day_name: string;
  focus_seconds: number;
}

interface WeeklyChartProps {
  data: WeekPoint[];
}

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: { day_name: string; focus_seconds: number; minutes: number };
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const d = payload[0];
  const min = d.value;

  if (!min)
    return (
      <div className="bg-sahara-bg border border-sahara-border/30 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-[11px] font-semibold text-sahara-text">{label}</p>
        <p className="text-[10px] text-sahara-text-muted">No sessions</p>
      </div>
    );

  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;

  return (
    <div className="bg-sahara-bg border border-sahara-border/30 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[11px] font-semibold text-sahara-text">{label}</p>
      <p className="text-[10px] text-sahara-primary font-bold tabular-nums">
        {timeStr} focused
      </p>
    </div>
  );
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const sorted = [...data].sort(
    (a, b) => DAY_ORDER.indexOf(a.day_name) - DAY_ORDER.indexOf(b.day_name),
  );

  const chartData = sorted.map((d) => ({
    ...d,
    minutes: Math.round(d.focus_seconds / 60),
  }));

  const maxVal = Math.max(...chartData.map((d) => d.minutes), 1);

  return (
    <div className="w-full" style={{ height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
          barCategoryGap="25%"
        >
          <XAxis
            dataKey="day_name"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#9ca3af",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
            dy={8}
          />
          <YAxis hide domain={[0, Math.ceil(maxVal / 15) * 15 || 15]} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(194, 101, 42, 0.06)", radius: 6 }}
          />
          <Bar
            dataKey="minutes"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.minutes > 0 ? "#c2652a" : "#374151"}
                fillOpacity={entry.minutes > 0 ? 1 : 0.3}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
