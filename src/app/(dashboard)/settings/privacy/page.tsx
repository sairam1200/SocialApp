import type { Metadata } from "next";
import PrivacyPageContent from "./page-content";

export const metadata: Metadata = {
  title: "Privacy Settings — Gaddr",
  description: "Control who can see your profile and activity on Gaddr.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}
