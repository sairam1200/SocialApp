"use client";

import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { apiClient } from "@/services/apiClient.service";
import { unwrapResponse } from "@/utils/wrapped-response.util";
import type {
	ComposeInput,
	EngagementSignal,
	FeedMode,
	FeedPage,
	FeedPreferences,
	Post,
	ReactionType,
} from "@/types/community.type";

/**
 * Query keys for Community.
 *
 * Centralised so an invalidation cannot miss a cache by mistyping a key — the
 * single most common way a social UI ends up showing a stale like count.
 */
export const communityKeys = {
	all: ["community"] as const,
	feed: (mode: FeedMode, topics?: string) =>
		["community", "feed", mode, topics ?? ""] as const,
	profileFeed: (handle: string, includeFollowing: boolean) =>
		["community", "profile-feed", handle, includeFollowing] as const,
	post: (id: string) => ["community", "post", id] as const,
	thread: (id: string) => ["community", "thread", id] as const,
	profile: (handle: string) => ["community", "profile", handle] as const,
	me: () => ["community", "me"] as const,
	preferences: () => ["community", "preferences"] as const,
	explore: (q: string) => ["community", "explore", q] as const,
	analytics: (days: number) => ["community", "analytics", days] as const,
	balance: () => ["community", "balance"] as const,
	drafts: () => ["community", "drafts"] as const,
	calendar: (from: string, to: string) =>
		["community", "calendar", from, to] as const,
	live: (category?: string, sort?: string) =>
		["community", "live", category ?? "", sort ?? ""] as const,
	liveCategories: () => ["community", "live", "categories"] as const,
	stream: (channelKey: string) => ["community", "stream", channelKey] as const,
	courses: (topics?: string) => ["community", "courses", topics ?? ""] as const,
	course: (slug: string) => ["community", "course", slug] as const,
	conversations: () => ["community", "conversations"] as const,
	messages: (id: string) => ["community", "messages", id] as const,
	invites: () => ["community", "invites"] as const,
};

const PAGE_SIZE = 20;

/**
 * The feed, paginated.
 *
 * Keyset pagination on `publishedOn` — `OFFSET` on a feed that is being
 * written to skips and repeats rows at page boundaries, which reads as posts
 * randomly disappearing.
 */
export function useFeed(mode: FeedMode, topics?: string) {
	return useInfiniteQuery<FeedPage>({
		queryKey: communityKeys.feed(mode, topics),
		initialPageParam: undefined as string | undefined,
		queryFn: ({ pageParam }) =>
			apiClient.Community.getFeed(
				mode,
				PAGE_SIZE,
				pageParam as string | undefined,
				topics,
			),
		getNextPageParam: (last) => last.nextCursor ?? undefined,
		// The recommended feed is expensive to compute and does not change
		// meaningfully between two refocuses a minute apart.
		staleTime: 60_000,
	});
}

export function useProfileFeed(handle: string, includeFollowing: boolean) {
	return useInfiniteQuery<FeedPage>({
		queryKey: communityKeys.profileFeed(handle, includeFollowing),
		initialPageParam: undefined as string | undefined,
		queryFn: ({ pageParam }) =>
			apiClient.Community.getProfileFeed(
				handle,
				PAGE_SIZE,
				pageParam as string | undefined,
				includeFollowing,
			),
		getNextPageParam: (last) => last.nextCursor ?? undefined,
		enabled: Boolean(handle),
		staleTime: 30_000,
	});
}

export function useCommunityProfile(handle: string) {
	return useQuery({
		queryKey: communityKeys.profile(handle),
		queryFn: () => apiClient.Community.getProfile(handle),
		enabled: Boolean(handle),
		staleTime: 60_000,
	});
}

export function useMyCommunityProfile(enabled = true) {
	return useQuery({
		queryKey: communityKeys.me(),
		queryFn: () => apiClient.Community.getMe(),
		enabled,
		staleTime: 5 * 60_000,
		retry: false,
	});
}

export function useThread(postId: string) {
	return useQuery({
		queryKey: communityKeys.thread(postId),
		queryFn: () => apiClient.Community.getThread(postId, 50),
		enabled: Boolean(postId),
	});
}

/**
 * React to a post, with an optimistic update.
 *
 * The optimism is deliberate: a like that takes 300ms to appear feels broken,
 * and the server is authoritative anyway — `onSettled` reconciles. Every feed
 * page that holds the post is patched, not just the visible one, or the same
 * post shows two different states in two tabs.
 */
export function useReact() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ postId, type }: { postId: string; type: ReactionType }) =>
			apiClient.Community.react(postId, { type }),

		onMutate: async ({ postId, type }) => {
			await queryClient.cancelQueries({ queryKey: communityKeys.all });
			const snapshot = queryClient.getQueriesData({
				queryKey: communityKeys.all,
			});

			patchPostEverywhere(queryClient, postId, (post) => {
				const wasReacted = Boolean(post.viewerReaction);
				const nowReacted = post.viewerReaction !== type;
				return {
					...post,
					viewerReaction: nowReacted ? type : null,
					likesCount: Math.max(
						0,
						post.likesCount + (nowReacted ? (wasReacted ? 0 : 1) : -1),
					),
				};
			});

			return { snapshot };
		},

		onError: (_error, _variables, context) => {
			// Put every cache back exactly as it was. A partial rollback is worse
			// than none — it leaves counts that disagree between screens.
			context?.snapshot?.forEach(([key, data]) => {
				queryClient.setQueryData(key, data);
			});
		},

		onSettled: (_data, _error, { postId }) => {
			queryClient.invalidateQueries({ queryKey: communityKeys.post(postId) });
		},
	});
}

export function useVote() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ postId, optionId }: { postId: string; optionId: string }) =>
			apiClient.Community.vote(postId, { optionId }),
		onSuccess: (_data, { postId }) => {
			queryClient.invalidateQueries({ queryKey: communityKeys.post(postId) });
			queryClient.invalidateQueries({ queryKey: ["community", "feed"] });
		},
	});
}

export function useCompose() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: ComposeInput) => apiClient.Community.compose(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["community", "feed"] });
			queryClient.invalidateQueries({ queryKey: communityKeys.drafts() });
			queryClient.invalidateQueries({ queryKey: ["community", "calendar"] });
		},
	});
}

export function useSharePost() {
	return useMutation({
		mutationFn: ({ postId, channel }: { postId: string; channel: string }) =>
			apiClient.Community.share(postId, { channel }),
	});
}

export function useNotInterested() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (postId: string) => apiClient.Community.notInterested(postId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["community", "feed"] });
		},
	});
}

export function useFeedPreferences() {
	return useQuery({
		queryKey: communityKeys.preferences(),
		queryFn: () => apiClient.Community.getFeedPreferences(),
		staleTime: 5 * 60_000,
	});
}

export function useSetFeedPreferences() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: Partial<FeedPreferences>) =>
			apiClient.Community.setFeedPreferences(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: communityKeys.preferences() });
			// The whole point of changing these is to change the feed, so it must
			// refetch rather than serve the pre-change page from cache.
			queryClient.invalidateQueries({ queryKey: ["community", "feed"] });
		},
	});
}

export function useExplore(query: string) {
	return useQuery({
		queryKey: communityKeys.explore(query),
		queryFn: () => apiClient.Community.explore(query, 12),
		staleTime: 30_000,
	});
}

export function useCreatorAnalytics(days = 28) {
	return useQuery({
		queryKey: communityKeys.analytics(days),
		queryFn: () => apiClient.Community.getAnalytics(days),
		staleTime: 5 * 60_000,
	});
}

export function useBalance() {
	return useQuery({
		queryKey: communityKeys.balance(),
		queryFn: () => apiClient.Community.getBalance(),
		staleTime: 60_000,
	});
}

export function useDrafts() {
	return useQuery({
		queryKey: communityKeys.drafts(),
		queryFn: () => apiClient.Community.getDrafts(50),
	});
}

export function useCalendar(from: string, to: string) {
	return useQuery({
		queryKey: communityKeys.calendar(from, to),
		queryFn: () => apiClient.Community.getCalendar(from, to),
	});
}

export function useLiveStreams(options?: {
	category?: string;
	sort?: "viewers" | "recent";
}) {
	return useQuery({
		queryKey: communityKeys.live(options?.category, options?.sort),
		queryFn: async () =>
			unwrapResponse(await apiClient.Community.listLive(
				24,
				options?.category || undefined,
				options?.sort,
			)),
		// Who is live changes on the order of a minute, and this is a directory,
		// not a player.
		refetchInterval: 60_000,
	});
}

/**
 * The categories with someone live in them.
 *
 * Kept apart from the listing so picking a category does not empty the rail
 * that offers the others, and cached far longer — categories turn over on the
 * order of hours, viewer counts on the order of seconds.
 */
export function useLiveCategories() {
	return useQuery({
		queryKey: communityKeys.liveCategories(),
		queryFn: async () => unwrapResponse(await apiClient.Community.listLiveCategories()),
		staleTime: 5 * 60_000,
	});
}

export function useCourses(topics?: string) {
	return useQuery({
		queryKey: communityKeys.courses(topics),
		queryFn: async () => unwrapResponse(await apiClient.Community.listCourses(topics)),
		staleTime: 5 * 60_000,
	});
}

export function useCourse(slug: string) {
	return useQuery({
		queryKey: communityKeys.course(slug),
		queryFn: () => apiClient.Community.getCourse(slug),
		enabled: Boolean(slug),
	});
}

export function useConversations() {
	return useQuery({
		queryKey: communityKeys.conversations(),
		queryFn: async () => unwrapResponse(await apiClient.Community.listConversations(30)),
		refetchInterval: 30_000,
	});
}

export function useMessages(conversationId: string) {
	return useQuery({
		queryKey: communityKeys.messages(conversationId),
		queryFn: async () => unwrapResponse(
			await apiClient.Community.listMessages(conversationId, 50),
		),
		enabled: Boolean(conversationId),
		refetchInterval: 10_000,
	});
}

/**
 * Report impressions and dwell, batched.
 *
 * Buffered and flushed on a timer rather than one request per card. A feed
 * page is twenty cards; twenty requests per scroll would cost more than the
 * feed itself, and the ranker does not need them within the second.
 *
 * Flushes on `visibilitychange` too, because a tab closing is the most common
 * way a batch is lost — and the last thing someone looked at is exactly the
 * signal worth keeping.
 */
export function useEngagementReporter(surface: string) {
	const buffer = useRef<EngagementSignal[]>([]);
	const seen = useRef<Set<string>>(new Set());

	const flush = useCallback(() => {
		if (buffer.current.length === 0) return;
		const events = buffer.current.splice(0, buffer.current.length);
		// Fire and forget. A dropped batch of impressions is not worth an error
		// toast, and retrying would double-count.
		void apiClient.Community.sendSignals({ events }).catch(() => undefined);
	}, []);

	useEffect(() => {
		const timer = setInterval(flush, 5000);
		const onHidden = () => {
			if (document.visibilityState === "hidden") flush();
		};
		document.addEventListener("visibilitychange", onHidden);
		return () => {
			clearInterval(timer);
			document.removeEventListener("visibilitychange", onHidden);
			flush();
		};
	}, [flush]);

	const report = useCallback(
		(signal: Omit<EngagementSignal, "surface">) => {
			// One impression per post per mount. Without this, a card re-entering
			// the viewport on every scroll reports hundreds.
			if (signal.kind === "impression") {
				const key = `${signal.subjectKind}:${signal.subjectId}`;
				if (seen.current.has(key)) return;
				seen.current.add(key);
			}
			buffer.current.push({ ...signal, surface });
			if (buffer.current.length >= 40) flush();
		},
		[flush, surface],
	);

	return report;
}

/** Flatten an infinite feed into a single list, de-duplicated by id. */
export function useFlatFeed(pages: FeedPage[] | undefined): Post[] {
	return useMemo(() => {
		if (!pages) return [];
		const byId = new Map<string, Post>();
		for (const page of pages) {
			for (const post of page.items) {
				// A post can legitimately appear in two pages when new content is
				// published between fetches. The first occurrence wins so its
				// position stays stable.
				if (!byId.has(post.id)) byId.set(post.id, post);
			}
		}
		return Array.from(byId.values());
	}, [pages]);
}

/**
 * Apply `patch` to a post wherever it appears in the cache.
 *
 * Feed pages, profile timelines, threads and single-post queries all hold
 * copies. Patching only the visible one is how two screens end up disagreeing.
 */
function patchPostEverywhere(
	queryClient: ReturnType<typeof useQueryClient>,
	postId: string,
	patch: (post: Post) => Post,
): void {
	queryClient.setQueriesData(
		{ queryKey: communityKeys.all },
		(data: unknown) => {
			if (!data) return data;

			if (isFeedPages(data)) {
				return {
					...data,
					pages: data.pages.map((page) => ({
						...page,
						items: page.items.map((p) => (p.id === postId ? patch(p) : p)),
					})),
				};
			}
			if (isPost(data)) {
				return data.id === postId ? patch(data) : data;
			}
			if (isThread(data)) {
				return {
					root: data.root.id === postId ? patch(data.root) : data.root,
					replies: data.replies.map((p) => (p.id === postId ? patch(p) : p)),
				};
			}
			return data;
		},
	);
}

function isFeedPages(data: unknown): data is { pages: FeedPage[] } {
	return (
		typeof data === "object" &&
		data !== null &&
		Array.isArray((data as { pages?: unknown }).pages)
	);
}

function isPost(data: unknown): data is Post {
	return (
		typeof data === "object" &&
		data !== null &&
		typeof (data as Post).id === "string" &&
		typeof (data as Post).kind === "string" &&
		"likesCount" in data
	);
}

function isThread(data: unknown): data is { root: Post; replies: Post[] } {
	return (
		typeof data === "object" &&
		data !== null &&
		"root" in data &&
		Array.isArray((data as { replies?: unknown }).replies)
	);
}
