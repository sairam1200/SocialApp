import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * A server layout beside a client page, purely so the route has metadata.
 *
 * `page.tsx` is a client component (drag and drop, view state), and a client
 * component cannot export `metadata`. Without this file the calendar would ship
 * with the generic root title, which is how the public profile stayed
 * unindexable for a release.
 */
export const metadata: Metadata = {
  title: "Calendar",
  description:
    "Plan, schedule and publish to every connected channel from one calendar.",
  alternates: { canonical: "/publishing" },
  robots: { index: false, follow: false },
};

export default function PublishingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
