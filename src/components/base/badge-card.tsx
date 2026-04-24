import { Award } from "lucide-react";
import { cn } from "@/lib/cn";

interface BadgeCardProps {
  title: string;
  description: string;
  earned: boolean;
}

export function BadgeCard({ title, description, earned }: BadgeCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 md:gap-4 p-3.5 md:p-5 rounded-xl border transition-all",
        earned
          ? "bg-sahara-primary-light/20 border-sahara-primary/30"
          : "bg-sahara-surface border-sahara-border/15 opacity-60",
      )}
    >
      <div
        className={cn(
          "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0",
          earned
            ? "bg-sahara-primary text-white shadow-md shadow-sahara-primary/30"
            : "bg-sahara-card text-sahara-text-muted",
        )}
      >
        <Award className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div>
        <h4
          className={cn(
            "font-serif text-sm md:text-base font-semibold",
            earned ? "text-sahara-primary" : "text-sahara-text-muted",
          )}
        >
          {title}
        </h4>
        <p className="text-[10px] md:text-xs text-sahara-text-muted mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
