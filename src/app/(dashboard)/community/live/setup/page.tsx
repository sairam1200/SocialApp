import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StreamSetup } from "@/components/community/LiveDirectory";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("community");
	return {
		title: `${t("streamSetup")} — Gaddr`,
		description: t("obsHelp"),
		// This page shows an ingest key. It must never be indexed or cached.
		robots: { index: false, follow: false, nocache: true },
	};
}

export default function StreamSetupPage() {
	return <StreamSetup />;
}
