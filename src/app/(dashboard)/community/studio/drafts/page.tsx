import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DraftList } from "@/components/community/ContentCalendar";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("community");
	return {
		title: `${t("drafts")} — Gaddr`,
		description: t("studioSubtitle"),
		// Unpublished work, by definition.
		robots: { index: false, follow: false },
	};
}

export default function DraftsPage() {
	return <DraftList />;
}
