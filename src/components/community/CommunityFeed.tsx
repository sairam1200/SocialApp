"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Clock, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/utils/cn.util";
import { Button } from "@/components/ui/button";
import type { ComposeInput, FeedMode, Post } from "@/types/community.type";
import {
	useCompose,
	useEngagementReporter,
	useFeed,
	useFlatFeed,
	useMyCommunityProfile,
	useNotInterested,
	useReact,
	useSharePost,
	useVote,
} from "@/hooks/useCommunity";
import { PostCard } from "./PostCard";
import { Composer } from "./Composer";

const MODES: Array<{ value: FeedMode; icon: typeof Sparkles; key: string }> = [
	{ value: "recommended", icon: Sparkles, key: "forYou" },
	{ value: "latest", icon: Clock, key: "latest" },
];

export interface CommunityFeedProps {
	initialMode?: FeedMode;
	isAuthenticated?: boolean;
	className?: string;
	}
/**
 * The feed, and the choice between the two.
 *
 * The tab is in the URL (`?feed=latest`), so a reader who prefers chronological
 * can bookmark it and never see the ranked one again. A preference that only
 * lives in component state is a preference the product keeps overriding.
 */
export function CommunityFeed({
	initialMode = "recommended",
	isAuthenticated = false,
	className,
}: CommunityFeedProps) {
	const t = useTranslations("community");
	const router = useRouter();
	const searchParams = useSearchParams();

	const modeParam = searchParams.get("feed");
	const mode: FeedMode = modeParam === "latest" ? "latest" : initialMode;

	const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useFeed(mode);
	const posts = useFlatFeed(data?.pages);

	const { data: profile } = useMyCommunityProfile(isAuthenticated);
	const react = useReact();
	const vote = useVote();
	const compose = useCompose();
	const share = useSharePost();
	const notInterested = useNotInterested();
	const report = useEngagementReporter(`feed_${mode}`);

	const [replyTo, setReplyTo] = useState<Post | null>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);

	/**
	 * Load the next page when the sentinel comes into view.
	 *
	 * `rootMargin` fires it a screen early so the next page is usually already
	 * there by the time the reader reaches the bottom.
	 */
	useEffect(() => {
		const element = sentinelRef.current;
		if (!element || typeof IntersectionObserver === "undefined") return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
					void fetchNextPage();
				}
			},
			{ rootMargin: "600px" },
		);
		observer.observe(element);
		return () => observer.disconnect();
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	const setMode = useCallback(
		(next: FeedMode) => {
			const params = new URLSearchParams(searchParams.toString());
			if (next === "recommended") params.delete("feed");
			else params.set("feed", next);
			const query = params.toString();
			router.replace(query ? `/community?${query}` : "/community", {
				scroll: false,
			});
		},
		[router, searchParams],
	);

	const handleShare = useCallback(
		async (post: Post, channel: "copy_link" | "social" = "copy_link") => {
			try {
				const result = await share.mutateAsync({
					postId: post.id,
					channel,
				});

				if (channel === "social") {
					return;
				}

				const url = /^https?:\/\//i.test(result.url)
					? result.url
					: `${window.location.origin}${result.url}`;
				await navigator.clipboard.writeText(url);
				toast.success(t("linkCopied"));
			} catch (error) {
				// An aborted native share is a user action, not a failure.
				if (error instanceof Error && error.name === "AbortError") return;
				toast.error(t("shareFailed"));
			}
		},
		[share, t],
	);

	const submit = useCallback(
		async (input: ComposeInput) => {
			const post = await compose.mutateAsync(input);
			setReplyTo(null);
			return { id: post.id };
		},
		[compose],
	);

	return (
		<section className={cn("mx-auto w-full max-w-[640px]", className)}>
			{/* ------------------------------------------------------------ tabs */}
			<div
				role="tablist"
				aria-label={t("feedMode")}
				className="sticky top-0 z-10 mb-4 flex gap-1 rounded-full border border-border bg-background/85 p-1 backdrop-blur"
			>
				{MODES.map(({ value, icon: Icon, key }) => (
					<button
						key={value}
						role="tab"
						type="button"
						aria-selected={mode === value}
						data-testid={`feed-tab-${value}`}
						onClick={() => setMode(value)}
						className={cn(
							"flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
							mode === value
								? "bg-primary text-white"
								: "text-muted-foreground hover:bg-muted",
						)}
					>
						<Icon className="size-4" aria-hidden />
						{t(key)}
					</button>
				))}
			</div>

			{isAuthenticated && (
				<Composer
					profile={profile}
					submit={submit}
					className="mb-4"
					replyTo={
						replyTo
							? {
									id: replyTo.id,
									handle: replyTo.author.handle,
									visibility: replyTo.visibility,
								}
							: null
					}
					onCancel={replyTo ? () => setReplyTo(null) : undefined}
				/>
			)}

			{/* ------------------------------------------------------------ list */}
			{isLoading && (
				<div className="space-y-3" aria-busy="true" aria-live="polite">
					{Array.from({ length: 3 }).map((_, index) => (
						<div
							key={index}
							className="h-40 animate-pulse rounded-2xl border border-border bg-muted/40"
						/>
					))}
					<span className="sr-only">{t("loadingFeed")}</span>
				</div>
			)}

			{isError && (
				<div className="rounded-2xl border border-border p-8 text-center">
					<p className="text-sm text-muted-foreground">{t("feedError")}</p>
					<Button
						className="mt-3"
						variant="secondary"
						size="sm"
						label={t("tryAgain")}
						icon={<RefreshCw className="size-4" />}
						onClick={() => void refetch()}
					/>
				</div>
			)}

			{!isLoading && !isError && posts.length === 0 && (
				<div className="rounded-2xl border border-dashed border-border p-10 text-center">
					<Sparkles className="mx-auto size-8 text-primary" aria-hidden />
					<h2 className="mt-3 text-lg font-semibold">{t("emptyTitle")}</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						{mode === "recommended" ? t("emptyRecommended") : t("emptyLatest")}
					</p>
				</div>
			)}

			<ul className="space-y-3">
				{posts.map((post, index) => (
					<li key={post.id}>
						<PostCard
							post={post}
							surface={`feed_${mode}`}
							position={index}
							onReact={(postId, type) => react.mutate({ postId, type })}
							onVote={(postId, optionId) => vote.mutate({ postId, optionId })}
							onReply={setReplyTo}
							onShare={handleShare}
							onNotInterested={(postId) => {
								notInterested.mutate(postId);
								toast.success(t("noted"));
							}}
							onImpression={(postId, position) =>
								report({
									subjectId: postId,
									subjectKind: "post",
									kind: "impression",
									position,
								})
							}
						/>
					</li>
				))}
			</ul>

			<div ref={sentinelRef} className="h-10" aria-hidden />

			{isFetchingNextPage && (
				<p className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
					<Loader2 className="size-4 animate-spin" aria-hidden />
					{t("loadingMore")}
				</p>
			)}

			{!hasNextPage && posts.length > 0 && (
				<p className="py-6 text-center text-sm text-muted-foreground">
					{t("endOfFeed")}
				</p>
			)}
		</section>
		);
	}
