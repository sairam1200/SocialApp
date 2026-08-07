import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Conversations } from "@/components/community/Conversations";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("community");
	return {
		title: `${t("messages")} — Gaddr`,
		description: t("conversations"),
		robots: { index: false, follow: false, nocache: true },
	};
}

export default function MessagesPage() {
	return <Conversations />;
}
