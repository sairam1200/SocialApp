import type { Metadata } from "next";
import AnalyticsPageContent from "./page-content";

export const metadata: Metadata = {
  title: "Analytics — Gaddr",
  description:
    "View your social media analytics and performance insights across connected platforms.",
  robots: { index: false, follow: false },
};

export default function AnalyticsPage() {
  return <AnalyticsPageContent />;
}
