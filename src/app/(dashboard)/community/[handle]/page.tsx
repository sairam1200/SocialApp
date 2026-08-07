import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CommunityProfileView } from "@/components/community/CommunityProfileView";
import { isSignedIn } from "@/lib/server-session";
import { fetchPublicProfile } from "@/lib/community-metadata";

interface PageProps {
	params: Promise<{ handle: string }>;
}

/**
 * Metadata for a Community profile.
 *
 * Fetched server-side from the *public* API, so a profile the author set to
 * followers-only produces the generic fallback rather than leaking a headline
 * into an Open Graph tag. The brief is explicit that visibility is honoured
 * everywhere "including metadata", and this is that.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { handle } = await params;
	const t = await getTranslations("community");
	const profile = await fetchPublicProfile(handle);

	if (!profile) {
		return {
			title: t("seoTitle"),
			description: t("seoDescription"),
			robots: { index: false, follow: false },
		};
	}

	const title = `${profile.displayName} (@${profile.handle}) · Gaddr`;
	const description =
		profile.headline ??
		profile.bio?.slice(0, 160) ??
		t("profileSeoFallback", { name: profile.displayName });

	return {
		title,
		description,
		alternates: { canonical: `/community/${profile.handle}` },
		keywords: [
			profile.displayName,
			profile.handle,
			profile.category ?? "creator",
			...profile.topics.slice(0, 8),
		],
		openGraph: {
			type: "profile",
			title,
			description,
			url: `/community/${profile.handle}`,
			siteName: "Gaddr",
			images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : undefined,
		},
		twitter: {
			card: "summary",
			title,
			description,
			images: profile.avatarUrl ? [profile.avatarUrl] : undefined,
		},
	};
}

export default async function CommunityProfilePage({ params }: PageProps) {
	const { handle } = await params;
	const isAuthenticated = await isSignedIn();
	const profile = await fetchPublicProfile(handle);

	return (
		<div className="py-6">
			{/*
			  JSON-LD for the profile, emitted only when the profile is public —
			  `fetchPublicProfile` returns null otherwise, so a private profile
			  produces no structured data at all.
			*/}
			{profile && (
				<script
					type="application/ld+json"
					// Serialised, not interpolated: a display name containing a
					// `</script>` would otherwise break out of the block.
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "ProfilePage",
							mainEntity: {
								"@type": "Person",
								name: profile.displayName,
								alternateName: `@${profile.handle}`,
								description: profile.headline ?? undefined,
								image: profile.avatarUrl ?? undefined,
								url: `/community/${profile.handle}`,
							},
						}).replace(/</g, "\\u003c"),
					}}
				/>
			)}

			<CommunityProfileView handle={handle} isAuthenticated={isAuthenticated} />
		</div>
	);
}
