"use client";

import { PlatformId } from "@/types/analytics";
import YoutubeIcon from "@/components/svg/Youtube.svg";
import FacebookIcon from "@/components/svg/facebook-blue.svg";

const platformIcons: Record<PlatformId, React.FC<React.SVGProps<SVGSVGElement>>> = {
  youtube: YoutubeIcon,
  facebook: FacebookIcon,
};

const platformColors: Record<PlatformId, string> = {
  youtube: "#FF0000",
  facebook: "#1877F2",
};

export function getPlatformIcon(platform: PlatformId): React.FC<React.SVGProps<SVGSVGElement>> {
  return platformIcons[platform] || YoutubeIcon;
}

export function getPlatformColor(platform: PlatformId): string {
  return platformColors[platform] || "#666666";
}

export function formatNumber(value: number | string | undefined): string {
  if (value === undefined || value === null) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "—";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(num);
}

export function formatCompactNumber(value: number | undefined): string {
  if (value === undefined || value === null) return "0";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);
}
