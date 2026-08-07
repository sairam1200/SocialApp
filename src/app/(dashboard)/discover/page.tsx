import type { Metadata } from "next";
import DiscoverPageContent from "./page-content";

export const metadata: Metadata = {
  title: "Discover — Gaddr",
  description:
    "Explore trending content, creators, and projects across social media platforms.",
  openGraph: {
    type: "website",
    title: "Discover — Gaddr",
    description:
      "Explore trending content, creators, and projects across social media platforms.",
    siteName: "Gaddr",
  },
};

export default function DiscoverPage() {
  return <DiscoverPageContent />;
}
