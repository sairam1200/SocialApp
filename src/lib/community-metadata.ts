import type { CommunityProfile, Post } from "@/types/community.type";

/**
 * Server-side reads for metadata generation.
 *
 * Deliberately separate from `apiClient`: that client reads a bearer token
 * from `localStorage`, which does not exist during a server render, so it
 * would silently produce anonymous requests anyway. Fetching anonymously *on
 * purpose* is the correct behaviour here — metadata is what a crawler or a
 * link unfurler sees, and they are anonymous.
 *
 * That also means visibility is enforced for free: a followers-only post
 * returns 404 to an anonymous caller, so there is nothing to leak into an Open
 * Graph tag. This is the mechanism behind "the setting is followed
 * everywhere, including metadata".
 */

function apiBase(): string {
	// Server-side, so `NEXT_PUBLIC_` is not required — but it is what is
	// configured, and the rewrite in next.config.ts only applies to the browser.
	return (
		process.env.AUTH_API_URL ??
		process.env.NEXT_PUBLIC_API_BASE_URL ??
		""
	).replace(/\/+$/, "");
}

/**
 * Fetch as an anonymous visitor, with a short timeout.
 *
 * Metadata generation blocks the response, so a slow backend must not hold a
 * page open. Three seconds then fall back to the generic metadata — a page
 * that renders with a plain title beats a page that never renders.
 */
async function fetchAnonymous<T>(path: string): Promise<T | null> {
	const base = apiBase();
	if (!base) return null;

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 3000);

	try {
		const response = await fetch(`${base}${path}`, {
			signal: controller.signal,
			headers: { accept: "application/json" },
			// Metadata is cacheable and identical for every anonymous caller.
			next: { revalidate: 300 },
		});
		if (!response.ok) return null;
		return (await response.json()) as T;
	} catch {
		return null;
	} finally {
		clearTimeout(timeout);
	}
}

export async function fetchPublicProfile(
	handle: string,
): Promise<CommunityProfile | null> {
	if (!handle) return null;
	return fetchAnonymous<CommunityProfile>(
		`/api/v1/community/profiles/${encodeURIComponent(handle)}`,
	);
}

export async function fetchPublicPost(postId: string): Promise<Post | null> {
	if (!postId) return null;
	return fetchAnonymous<Post>(
		`/api/v1/community/posts/${encodeURIComponent(postId)}`,
	);
}

/**
 * A description for a post, for `<meta>` and Open Graph.
 *
 * Trimmed on a word boundary. A description cut mid-word is the kind of detail
 * that makes a shared link look broken in a preview card.
 */
export function postDescription(post: Post, maxLength = 160): string {
	const raw = (post.body ?? "").replace(/\s+/g, " ").trim();
	if (!raw) {
		return post.media.length > 0
			? `${post.media.length} item${post.media.length > 1 ? "s" : ""} from @${post.author.handle}`
			: `A post from @${post.author.handle}`;
	}
	if (raw.length <= maxLength) return raw;
	const cut = raw.slice(0, maxLength);
	const lastSpace = cut.lastIndexOf(" ");
	return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

/**
 * Keywords for a post: its own tags and topics, plus the author.
 *
 * Deduplicated and capped — a keywords list of forty terms is ignored by every
 * engine that still reads the tag at all.
 */
export function postKeywords(post: Post): string[] {
	return Array.from(
		new Set([
			...post.tags,
			...post.topics,
			post.author.handle,
			post.author.displayName,
		]),
	)
		.filter(Boolean)
		.slice(0, 12);
}
