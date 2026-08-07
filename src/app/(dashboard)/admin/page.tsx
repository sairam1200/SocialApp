import type { Metadata } from "next";
import AdminDashboardContent from "./page-content";

export const metadata: Metadata = {
  title: "Admin Dashboard — Gaddr",
  description: "Platform administration and overview.",
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}
