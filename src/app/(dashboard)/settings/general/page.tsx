import type { Metadata } from "next";
import GeneralSettingsPageContent from "./page-content";

export const metadata: Metadata = {
  title: "General Settings — Gaddr",
  description: "Manage your social media connections, appearance, and account settings.",
  robots: { index: false, follow: false },
};

export default function GeneralSettingsPage() {
  return <GeneralSettingsPageContent />;
}
