import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LearnCatalogue } from "@/components/community/LearnCatalogue";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("community");
	return {
		title: `${t("learnTitle")} — Gaddr Community`,
		description: t("learnSubtitle"),
		alternates: { canonical: "/community/learn" },
		openGraph: {
			type: "website",
			title: `${t("learnTitle")} — Gaddr Community`,
			description: t("learnSubtitle"),
			url: "/community/learn",
			siteName: "Gaddr",
		},
		keywords: [
			"grow an audience",
			"brand deals for creators",
			"how to livestream",
			"selling as a creator",
			"recommendation algorithms",
			"creator certification",
		],
	};
}

export default function LearnPage() {
	return <LearnCatalogue />;
}
