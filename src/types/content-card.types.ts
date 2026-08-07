import type { ReactNode } from "react";

export type StatType = "views" | "likes" | "comments" | "shares";

export interface StatItem {
  type: StatType;
  value: number;
  clickable?: boolean;
}

export type PlatformId =
  | "youtube"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "twitter"
  | "linkedin"
  | "reddit"
  | "pinterest"
  | "gaddr";

export interface CardContentProps {
  imageSrc?: string;
  profilePicSrc: string | null;
  
  userName: string;
  userHandle?: string;
  verified?: boolean;
  platform: PlatformId | string;
  textContent: ReactNode;
  date?: string;
  stats: StatItem[];
  sourceUrl?: string;
}
