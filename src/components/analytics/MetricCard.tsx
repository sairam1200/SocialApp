"use client";

import { ReactNode } from "react";
import { cn } from "@/utils/cn.util";
import { Card } from "./Card";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
  className?: string;
  loading?: boolean;
}

export function MetricCard({ title, value, change, icon, className, loading }: MetricCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <div className="space-y-3">
          <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
      </Card>
    );
  }

  const changeColor = change === undefined ? "text-gray-400" : change >= 0 ? "text-green-600" : "text-red-500";
  const changeText = change === undefined ? "" : change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;

  return (
    <Card className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-neutral">{title}</span>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="flex items-end gap-3">
        <span className="text-2xl font-bold text-gray-900">{typeof value === "number" ? value.toLocaleString() : value}</span>
        {change !== undefined && (
          <span className={cn("text-sm font-medium mb-1", changeColor)}>{changeText}</span>
        )}
      </div>
    </Card>
  );
}
