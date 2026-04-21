import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  subValue?: string;
  subUnit?: string;
  change?: string;
  variant?: "default" | "compact" | "wide";
}

export function StatCard({
  icon: Icon,
  label,
  value,
  unit = "",
  subValue,
  subUnit,
  change,
  variant = "default",
}: StatCardProps) {
  if (variant === "compact") {
    return (
      <div className="bg-white border border-sahara-border/20 rounded-3xl p-8 flex flex-col shadow-sm shadow-sahara-primary/5">
        <div className="w-12 h-12 rounded-2xl bg-sahara-primary-light flex items-center justify-center text-sahara-primary mb-8">
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold text-sahara-text-muted uppercase tracking-[0.2em] mb-2">
          {label}
        </p>
        <p className="font-serif text-5xl text-sahara-text">{value}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-sahara-border/20 rounded-3xl p-8 flex flex-col justify-between shadow-sm shadow-sahara-primary/5">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-2xl bg-sahara-primary-light flex items-center justify-center text-sahara-primary">
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <span className="bg-sahara-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            {change}
          </span>
        )}
      </div>
      <div className="mt-8">
        <p className="text-xs font-bold text-sahara-text-muted uppercase tracking-[0.2em] mb-2">
          {label}
        </p>
        <div className="flex items-baseline gap-1 font-serif">
          <span className="text-5xl text-sahara-text">{value}</span>
          {unit && (
            <span className="text-2xl text-sahara-text-muted lowercase">
              {unit}
            </span>
          )}
          {subValue !== undefined && (
            <>
              <span className="text-5xl text-sahara-text ml-2">{subValue}</span>
              {subUnit && (
                <span className="text-2xl text-sahara-text-muted lowercase">
                  {subUnit}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function MiniStatCard({
  icon: Icon,
  label,
  value,
  unit,
}: Omit<StatCardProps, "change" | "subValue" | "subUnit" | "variant">) {
  return (
    <div className="bg-white rounded-xl border border-sahara-border/15 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-sahara-primary-light/60 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-sahara-primary" />
      </div>
      <div>
        <p className="text-xs font-bold text-sahara-text-muted uppercase tracking-wider">
          {label}
        </p>
        <p className="text-lg font-bold text-sahara-text tabular-nums">
          {value}
          {unit ? (
            <span className="text-sm text-sahara-text-muted ml-0.5 lowercase">
              {unit}
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
}
