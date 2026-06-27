"use client";

import { useMemo } from "react";
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
  metric: string;
}

interface GrowthChartProps {
  data: ChartDataPoint[];
  metric: string;
  color?: string;
  className?: string;
  loading?: boolean;
  height?: number;
  type?: "line" | "area";
}

export function GrowthChart({ data, metric, color = "#6400BF", className, loading, height = 250, type = "area" }: GrowthChartProps) {
  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map((point) => ({
      date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: point.value,
    }));
  }, [data]);

  if (loading) {
    return (
      <div className={cn("w-full bg-white rounded-xl border border-[#E6E6E6] p-5", className)}>
        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-4" />
        <div className={cn("bg-gray-50 rounded-lg animate-pulse", `h-[${height}px]`)} style={{ height }} />
      </div>
    );
  }

  const ChartComponent = type === "area" ? AreaChart : LineChart;

  return (
    <div className={cn("w-full bg-white rounded-xl border border-[#E6E6E6] p-5", className)}>
      <h3 className="text-base font-semibold text-gray-900 mb-4 capitalize">{metric} Trend</h3>
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={chartData}>
          <defs>
            <linearGradient id={`color-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={type === "area" ? 0.15 : 0} />
              <stop offset="95%" stopColor={color} stopOpacity={type === "area" ? 0 : 0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#888" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#888" }} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #E6E6E6", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
            labelStyle={{ fontSize: 12, color: "#666" }}
          />
          {type === "area" ? (
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#color-${metric})`} />
          ) : (
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
