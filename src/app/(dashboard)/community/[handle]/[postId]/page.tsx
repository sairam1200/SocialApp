import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PostThreadView } from "@/components/community/PostThreadView";
import { isSignedIn } from "@/lib/server-session";
import {
	fetchPublicPost,
	postDescription,
	postKeywords,
} from "@/lib/community-metadata";

interface PageProps {
	params: Promise<{ handle: string; postId: string }>;
}

/**
 * Metadata for a single post — what a shared link becomes.
 *
 * Fetched anonymously, so the API's own visibility rules decide what is
 * available: a followers-only post 404s here, and the page falls back to
 * generic metadata with `noindex`. Nothing about a restricted post reaches an
 * Open Graph tag, which is what "the setting is followed everywhere, including
 * metadata" has to mean in practice.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { postId } = await params;
	const t = await getTranslations("community");
	const post = await fetchPublicPost(postId);

	if (!post || post.visibility !== "public") {
		return {
			title: t("seoTitle"),
			description: t("seoDescription"),
			robots: { index: false, follow: false },
		};
	}

	const title = `${post.author.displayName} on Gaddr Community`;
	const description = postDescription(post);
	const image = post.media.find((m) => m.kind === "image")?.url;

	return {
		title,
		description,
		keywords: postKeywords(post),
		alternates: { canonical: `/community/${post.author.handle}/${post.id}` },
		openGraph: {
			type: "article",
			title,
			description,
			url: `/community/${post.author.handle}/${post.id}`,
			siteName: "Gaddr",
			publishedTime: post.publishedOn ?? post.createdOn,
			authors: [post.author.displayName],
			tags: post.tags,
			images: image ? [{ url: image, alt: post.media[0]?.altText ?? "" }] : undefined,
		},
		twitter: {
			card: image ? "summary_large_image" : "summary",
			title,
			description,
			images: image ? [image] : undefined,
		},
	};
}

export default async function PostPage({ params }: PageProps) {
	const { postId } = await params;
	const isAuthenticated = await isSignedIn();
	const post = await fetchPublicPost(postId);

	return (
		<div className="py-6">
			{post && post.visibility === "public" && (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "SocialMediaPosting",
							headline: postDescription(post, 110),
							datePublished: post.publishedOn ?? post.createdOn,
							author: {
								"@type": "Person",
								name: post.author.displayName,
								url: `/community/${post.author.handle}`,
							},
							interactionStatistic: [
								{
									"@type": "InteractionCounter",
									interactionType: "https://schema.org/LikeAction",
									userInteractionCount: post.likesCount,
								},
								{
									"@type": "InteractionCounter",
									interactionType: "https://schema.org/CommentAction",
									userInteractionCount: post.commentsCount,
								},
							],
						}).replace(/</g, "\\u003c"),
					}}
				/>
			)}

			<PostThreadView postId={postId} isAuthenticated={isAuthenticated} />
		</div>
	);
}
