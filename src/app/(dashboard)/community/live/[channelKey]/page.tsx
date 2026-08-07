import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LivePlayer } from "@/components/community/LivePlayer";
import { isSignedIn } from "@/lib/server-session";

interface PageProps {
	params: Promise<{ channelKey: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { channelKey } = await params;
	const t = await getTranslations("community");
	const title = `${channelKey} — ${t("liveTitle")}`;

	return {
		title,
		description: t("liveSubtitle"),
		alternates: { canonical: `/community/live/${channelKey}` },
		openGraph: {
			type: "video.other",
			title,
			description: t("liveSubtitle"),
			url: `/community/live/${channelKey}`,
			siteName: "Gaddr",
		},
	};
}

export default async function LiveChannelPage({ params }: PageProps) {
	const { channelKey } = await params;
	return (
		<LivePlayer channelKey={channelKey} isAuthenticated={await isSignedIn()} />
	);
}
