import type { Metadata } from "next";
import EvaluationDashboardContent from "./page-content";

export const metadata: Metadata = {
  title: "Agent quality center",
  description: "Quality, safety, grounding and release checks for Gaddr agents.",
  robots: { index: false, follow: false },
};

export default function EvaluationDashboardPage() {
  return <EvaluationDashboardContent />;
}

