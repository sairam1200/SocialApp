import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LiveDirectory } from "@/components/community/LiveDirectory";
import { isSignedIn } from "@/lib/server-session";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("community");
	return {
		title: `${t("liveTitle")} — Gaddr Community`,
		description: t("liveSubtitle"),
		alternates: { canonical: "/community/live" },
		openGraph: {
			type: "website",
			title: `${t("liveTitle")} — Gaddr Community`,
			description: t("liveSubtitle"),
			url: "/community/live",
			siteName: "Gaddr",
		},
		keywords: ["live streaming", "RTMP", "SRT", "WHIP", "LL-HLS", "creator live"],
	};
}

export default async function LivePage() {
	return <LiveDirectory isAuthenticated={await isSignedIn()} />;
}
