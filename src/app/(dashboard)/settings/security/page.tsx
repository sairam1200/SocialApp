import type { Metadata } from "next";
import SecuritySettingsPageContent from "./page-content";

export const metadata: Metadata = {
  title: "Security Settings — Gaddr",
  description:
    "Manage your password, two-factor authentication, and recovery methods.",
  robots: { index: false, follow: false },
};

export default function SecuritySettingsPage() {
  return <SecuritySettingsPageContent />;
}
