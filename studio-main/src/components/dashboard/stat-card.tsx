import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: number;       // e.g. 12 = "+12%", -5 = "-5%"
  trendLabel?: string;  // e.g. "from last month"
  iconBg?: string;      // tailwind bg class for icon square
  className?: string;
};

export function StatCard({ title, value, icon: Icon, description, trend, trendLabel, iconBg, className }: StatCardProps) {
  const trendPositive = trend !== undefined && trend >= 0;

  return (
    <div className={cn(
      "card-glow rounded-2xl border border-border bg-card p-5 flex flex-col gap-3",
      className
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</span>
        <div className={cn(
          "h-9 w-9 rounded-xl flex items-center justify-center",
          iconBg ?? "bg-primary/15"
        )}>
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="animate-count-up">
        <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 mt-1 text-xs font-semibold",
            trendPositive ? "text-emerald-400" : "text-red-400"
          )}>
            {trendPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{trendPositive ? "+" : ""}{trend}% {trendLabel ?? ""}</span>
          </div>
        )}
        {description && !trend && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
