import type { Metadata } from "next";
import BookmarksPageContent from "./page-content";

export const metadata: Metadata = {
  title: "Bookmarks — Gaddr",
  description: "Save and revisit content you find valuable across your connected platforms.",
  robots: { index: false, follow: false },
};

export default function BookmarksPage() {
  return <BookmarksPageContent />;
}
