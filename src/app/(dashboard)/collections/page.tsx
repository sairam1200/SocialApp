import type { Metadata } from "next";
import CollectionsPageContent from "./page-content";

export const metadata: Metadata = {
  title: "Collections — Gaddr",
  description:
    "Organize and revisit your saved bookmarks in personal collections.",
  robots: { index: false, follow: false },
};

export default function CollectionsPage() {
  return <CollectionsPageContent />;
}
