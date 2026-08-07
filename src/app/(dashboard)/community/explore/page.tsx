import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ExploreView } from "@/components/community/ExploreView";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("community");
	return {
		title: `${t("exploreTitle")} — Gaddr Community`,
		description: t("exploreSubtitle"),
		alternates: { canonical: "/community/explore" },
		openGraph: {
			type: "website",
			title: `${t("exploreTitle")} — Gaddr Community`,
			description: t("exploreSubtitle"),
			url: "/community/explore",
			siteName: "Gaddr",
		},
		keywords: [
			"discover creators",
			"find brands",
			"creator search",
			"shoppable posts",
			"creator courses",
		],
	};
}

export default async function ExplorePage() {
	return <ExploreView />;
}
