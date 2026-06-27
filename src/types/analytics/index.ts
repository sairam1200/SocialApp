export type DateRange = "7d" | "30d" | "90d" | "1y";

export type PlatformId = "youtube" | "facebook";

export interface AnalyticsError {
  message: string;
  code?: string;
}
