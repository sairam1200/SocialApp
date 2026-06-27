"use client";

import { useState } from "react";
import { PlatformId, DateRange } from "@/types/analytics";
import { platformMap } from "@/constants/platforms";
import { cn } from "@/utils/cn.util";
import { Button } from "@/components/ui/button";

const dateRanges: { value: DateRange; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "1y", label: "1Y" },
];

interface PlatformSelectorProps {
  platforms: PlatformId[];
  selected: PlatformId;
  onChange: (platform: PlatformId) => void;
  className?: string;
}

export function PlatformSelector({ platforms, selected, onChange, className }: PlatformSelectorProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {platforms.map((platform) => {
        const p = platformMap[platform];
        if (!p) return null;
        const Icon = p.icon;
        const isActive = selected === platform;

        return (
          <button
            key={platform}
            onClick={() => onChange(platform)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all cursor-pointer",
              isActive
                ? "border-primary bg-primary/5 text-primary"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            )}
          >
            <Icon className="w-4 h-4" />
            {p.name}
          </button>
        );
      })}
    </div>
  );
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangeFilter({ value, onChange, className }: DateRangeFilterProps) {
  return (
    <div className={cn("flex items-center gap-1 border border-gray-200 rounded-full p-1 bg-white", className)}>
      {dateRanges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer",
            value === range.value
              ? "bg-primary text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-50"
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
