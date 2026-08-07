import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
	Compass,
	GraduationCap,
	MessageCircle,
	Radio,
	Sparkles,
} from "lucide-react";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { isSignedIn } from "@/lib/server-session";

/**
 * Community — the feed.
 *
 * A Server Component that renders the shell and hands the feed itself to a
 * client island. The shell is what search engines and link unfurlers see, so
 * it carries the metadata; the feed needs state and effects, so it does not.
 */
export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("community");
	return {
		title: t("seoTitle"),
		description: t("seoDescription"),
		alternates: { canonical: "/community" },
		openGraph: {
			type: "website",
			title: t("seoTitle"),
			description: t("seoDescription"),
			url: "/community",
			siteName: "Gaddr",
		},
		twitter: {
			card: "summary_large_image",
			title: t("seoTitle"),
			description: t("seoDescription"),
		},
		keywords: [
			"creator community",
			"social feed",
			"creator economy",
			"brand collaborations",
			"livestreaming",
			"paid partnerships",
		],
	};
}

const SIDE_LINKS = [
	{ href: "/community/explore", icon: Compass, key: "explore" },
	{ href: "/community/live", icon: Radio, key: "live" },
	{ href: "/community/learn", icon: GraduationCap, key: "learn" },
	{ href: "/community/studio", icon: Sparkles, key: "studio" },
	{ href: "/community/messages", icon: MessageCircle, key: "messages" },
];

export default async function CommunityPage() {
	const t = await getTranslations("community");
	const isAuthenticated = await isSignedIn();

	return (
		<div className="flex w-full gap-6 py-6">
			<CommunityFeed isAuthenticated={isAuthenticated} className="flex-1" />

			<aside className="hidden w-64 shrink-0 lg:block">
				<div className="sticky top-6 space-y-4">
					<nav aria-label={t("communityNav")}>
						<ul className="space-y-1">
							{SIDE_LINKS.map(({ href, icon: Icon, key }) => (
								<li key={href}>
									<Link
										href={href}
										className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
									>
										<Icon className="size-[18px] text-primary" aria-hidden />
										{t(key)}
									</Link>
								</li>
							))}
						</ul>
					</nav>

					<div className="rounded-2xl border border-border p-4">
						<h2 className="text-sm font-semibold">{t("yourFeedYourRules")}</h2>
						<p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
							{t("algorithmBlurb")}
						</p>
						<Link
							href="/settings/feed"
							className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
						>
							{t("adjustFeed")}
						</Link>
					</div>
				</div>
			</aside>
		</div>
	);
}
