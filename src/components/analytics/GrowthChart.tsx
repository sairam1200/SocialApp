"use client";

import { useMemo } from "react";
import { useFormatter, useTranslations } from "next-intl";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { cn } from "@/utils/cn.util";

interface ChartDataPoint {
  date: string;
  value: number;
  metric?: string;
}

interface GrowthChartProps {
  data: ChartDataPoint[];
  metric: string;
  title?: string;
  emptyMessage?: string;
  color?: string;
  className?: string;
  loading?: boolean;
  height?: number;
  type?: "line" | "area";
}

export function GrowthChart({
  data,
  metric,
  title,
  emptyMessage,
  color = "var(--primary)",
  className,
  loading,
  height = 250,
  type = "area",
}: GrowthChartProps) {
  const format = useFormatter();
  const t = useTranslations("analyticsDashboard");
  const chartData = useMemo(() => {
    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    return sorted.map((point) => ({
      date: format.dateTime(new Date(point.date), {
        month: "short",
        day: "numeric",
      }),
      value: point.value,
    }));
  }, [data, format]);

  if (loading) {
    return (
      <div
        className={cn(
          "w-full bg-card rounded-xl border border-border p-5",
          className,
        )}
      >
        <div className="h-4 w-32 bg-muted rounded animate-pulse mb-4" />
        <div
          className={cn(
            "bg-muted/50 rounded-lg animate-pulse",
            `h-[${height}px]`,
          )}
          style={{ height }}
        />
      </div>
    );
  }

  const ChartComponent = type === "area" ? AreaChart : LineChart;

  if (chartData.length === 0) {
    return (
      <div
        className={cn(
          "w-full bg-card rounded-xl border border-border p-5",
          className,
        )}
      >
        <h3 className="text-base font-semibold text-foreground mb-4">
          {title ?? t("charts.metricTrend", { metric })}
        </h3>
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-sm text-muted-foreground">
            {emptyMessage ?? t("charts.noData")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full bg-card rounded-xl border border-border p-5",
        className,
      )}
    >
      <h3 className="text-base font-semibold text-foreground mb-4">
        {title ?? t("charts.metricTrend", { metric })}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={chartData}>
          <defs>
            <linearGradient id={`color-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={color}
                stopOpacity={type === "area" ? 0.15 : 0}
              />
              <stop
                offset="95%"
                stopColor={color}
                stopOpacity={type === "area" ? 0 : 0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
            labelStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
          />
          {type === "area" ? (
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#color-${metric})`}
            />
          ) : (
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
