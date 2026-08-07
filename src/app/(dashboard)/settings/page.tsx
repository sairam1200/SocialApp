import type { Metadata } from "next";
import ProfileSettingsPageContent from "./page-content";

export const metadata: Metadata = {
  title: "Profile Settings — Gaddr",
  description: "View and manage your Gaddr profile, connected accounts, and verification.",
  robots: { index: false, follow: false },
};

export default function ProfileSettingsPage() {
  return <ProfileSettingsPageContent />;
}
