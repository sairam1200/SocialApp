import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContentCalendar } from "@/components/community/ContentCalendar";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("community");
	return {
		title: `${t("contentCalendar")} — Gaddr`,
		description: t("studioSubtitle"),
		// A creator's own queue. Nothing here belongs in a search index.
		robots: { index: false, follow: false },
	};
}

export default function CalendarPage() {
	return <ContentCalendar />;
}
