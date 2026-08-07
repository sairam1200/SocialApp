import type { Metadata } from "next";
import AdminReportsContent from "./page-content";

export const metadata: Metadata = {
  title: "Reports — Gaddr Admin",
  description: "Review and resolve content reports.",
  robots: { index: false, follow: false },
};

export default function AdminReportsPage() {
  return <AdminReportsContent />;
}
