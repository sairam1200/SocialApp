import type { Metadata } from "next";
import NotificationSettingsPageContent from "./page-content";

export const metadata: Metadata = {
  title: "Notification Settings — Gaddr",
  description: "Control how you receive push and email notifications from Gaddr.",
  robots: { index: false, follow: false },
};

export default function NotificationSettingsPage() {
  return <NotificationSettingsPageContent />;
}
