import type { Metadata } from "next";
import AdminUsersContent from "./page-content";

export const metadata: Metadata = {
  title: "User Management — Gaddr Admin",
  description: "View and manage platform users.",
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return <AdminUsersContent />;
}
