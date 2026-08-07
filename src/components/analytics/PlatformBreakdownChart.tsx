"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "@/utils/cn.util";
import { useTranslations } from "next-intl";

interface PlatformData {
  platform: string;
  postCount: number;
}

interface PlatformBreakdownChartProps {
  data: PlatformData[];
  className?: string;
  loading?: boolean;
}

const COLORS = [
  "#6a5acd",
  "#1877F2",
  "#E4405F",
  "#FF0000",
  "#0077B5",
  "#FF4500",
  "#1DA1F2",
  "#000000",
];

function formatPlatformName(platform: string): string {
  const map: Record<string, string> = {
    youtube: "YouTube",
    facebook: "Facebook",
    instagram: "Instagram",
    twitter: "Twitter",
    tiktok: "TikTok",
    linkedin: "LinkedIn",
    pinterest: "Pinterest",
    reddit: "Reddit",
  };
  return map[platform.toLowerCase()] ?? platform;
}

export function PlatformBreakdownChart({
  data,
  className,
  loading,
}: PlatformBreakdownChartProps) {
  const t = useTranslations("analyticsDashboard");
  const chartData = useMemo(
    () =>
      data
        .filter((d) => d.postCount > 0)
        .map((d) => ({
          name: formatPlatformName(d.platform),
          value: d.postCount,
        })),
    [data],
  );

  if (loading) {
    return (
      <div
        className={cn(
          "w-full bg-card rounded-xl border border-border p-5",
          className,
        )}
      >
        <div className="h-4 w-40 bg-muted rounded animate-pulse mb-4" />
        <div className="h-[250px] bg-muted/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div
        className={cn(
          "w-full bg-card rounded-xl border border-border p-5",
          className,
        )}
      >
        <h3 className="text-base font-semibold text-foreground mb-4">
          {t("charts.platformBreakdown")}
        </h3>
        <div className="flex items-center justify-center h-[250px]">
          <p className="text-sm text-muted-foreground">
            {t("charts.noContentData")}
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
        {t("charts.platformBreakdown")}
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          />
          <Legend
            formatter={(value) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
