import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FeedSettings } from "@/components/community/FeedSettings";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("community");
	return {
		title: `${t("feedSettingsTitle")} — Gaddr`,
		description: t("feedSettingsSubtitle"),
		// Settings are per-user and behind auth; there is nothing here to index.
		robots: { index: false, follow: false },
	};
}

export default function FeedSettingsPage() {
	return <FeedSettings />;
}
