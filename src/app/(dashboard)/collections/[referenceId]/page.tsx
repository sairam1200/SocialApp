import type { Metadata } from "next";
import CollectionDetailPageContent from "./page-content";

export const metadata: Metadata = {
  title: "Collection — Gaddr",
  description: "View the bookmarks saved in your Gaddr collection.",
  robots: { index: false, follow: false },
};

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ referenceId: string }>;
}) {
  const { referenceId } = await params;
  return <CollectionDetailPageContent referenceId={referenceId} />;
}
