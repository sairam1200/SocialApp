/**
 * Unified search types.
 *
 * Mirrors `backend/src/domain/contracts/unified-search.model.ts`. Every source
 * — our Community posts, our profiles, our live channels, Gaddr Jobs, and the
 * external platforms — arrives in this one shape, which is what lets a single
 * card render all of them and an "All" tab exist at all.
 */

export type SearchResultKind =
	| "profile"
	| "post"
	| "video"
	| "image"
	| "article"
	| "job"
	| "project"
	| "stream"
	| "course"
	| "product";

export type SearchSourcePlatform =
	| "gaddr"
	| "gaddr-jobs"
	| "youtube"
	| "instagram"
	| "tiktok"
	| "facebook"
	| "x"
	| "linkedin"
	| "pinterest"
	| "reddit"
	| "spotify"
	| "github"
	| "apple"
	| "openverse"
	| "hackernews"
	| "behance"
	| "dribbble"
	| "other";

export interface SearchSource {
	platform: SearchSourcePlatform;
	/** True for `gaddr` and `gaddr-jobs`. These get our mark on the card. */
	isNative: boolean;
	label: string;
	/**
	 * Where it originally lives, when that is not here.
	 *
	 * Not the inverse of `isNative` — a job aggregated by Gaddr Jobs is ours
	 * *and* hosted on someone else's board, and the reader still needs to reach
	 * the actual application.
	 */
	externalUrl?: string | null;
}

export interface SearchPlayback {
	kind: "video" | "hls" | "audio" | "embed" | "image";
	url: string;
	posterUrl?: string;
	durationSeconds?: number;
}

export interface SearchAuthor {
	name: string;
	handle?: string;
	avatarUrl?: string;
	/** Set when the author has a Gaddr profile we can link to. */
	gaddrProfileHandle?: string | null;
	isVerified?: boolean;
}

export interface SearchResultItem {
	id: string;
	/** Present for results persisted in contentStreams and eligible for public stats. */
	contentStreamId?: string;
	kind: SearchResultKind;
	source: SearchSource;
	title: string;
	description?: string;
	thumbnailUrl?: string;
	url: string;
	publishedOn?: string | null;
	author?: SearchAuthor;
	playback?: SearchPlayback | null;
	topics: string[];
	metrics?: {
		views?: number;
		likes?: number;
		comments?: number;
		followers?: number;
		/** Minor units as a string — money never becomes a float. */
		priceMinor?: string;
		currency?: string;
		/** Gaddr search-result engagement counters are bigint strings on the wire. */
		gaddrViews?: string;
		gaddrExternalClicks?: string;
		gaddrLastClickedOn?: string | null;
	};
	score: number;
	reasons: string[];
}

/** All, For You, Latest, Random. The reader picks. */
export type SearchMode = "all" | "for-you" | "latest" | "random";

export interface UnifiedSearchResponse {
	mode: SearchMode;
	keyword: string;
	items: SearchResultItem[];
	total: number;
	hasMore: boolean;
	sources: Array<{
		platform: SearchSourcePlatform;
		label: string;
		isNative: boolean;
		count: number;
	}>;
	kinds: Array<{ kind: SearchResultKind; count: number }>;
	/**
	 * The themes present in these results, most common first.
	 *
	 * Derived from the results rather than a fixed taxonomy, so the category
	 * rail always describes what is actually there instead of what someone
	 * curated last quarter.
	 */
	topics: Array<{ topic: string; count: number }>;
}

export interface UnifiedSearchParams {
	keyword?: string;
	mode?: SearchMode;
	page?: number;
	limit?: number;
	/** Comma-separated platform slugs. */
	platforms?: string;
	/** Comma-separated kind slugs. */
	kinds?: string;
	/** Comma-separated themes. Matching any one is enough. */
	topics?: string;
	seed?: string;
}
