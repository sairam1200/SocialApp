import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreatorStudio } from "@/components/community/CreatorStudio";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("community");
	return {
		title: `${t("studioTitle")} — Gaddr`,
		description: t("studioSubtitle"),
		// A creator's own numbers. Nothing here belongs in a search index.
		robots: { index: false, follow: false },
	};
}

export default function StudioPage() {
	return <CreatorStudio />;
}
