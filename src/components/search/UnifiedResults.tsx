"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
	Clock,
	LayoutGrid,
	Loader2,
	Rows3,
	Shuffle,
	Sparkles,
	Layers,
	RefreshCw,
	X,
} from "lucide-react";
import { cn } from "@/utils/cn.util";
import { Button } from "@/components/ui/button";
import type { SearchMode } from "@/types/unified-search.type";
import { useUnifiedSearch } from "@/hooks/useUnifiedSearch";
import { UnifiedResultCard } from "./UnifiedResultCard";
import { SearchResultInteraction } from "./SearchResultInteraction";
import { ResultLayoutSkeleton } from "./ResultLayoutSkeleton";

const MODES: Array<{ value: SearchMode; icon: typeof Layers; key: string }> = [
	{ value: "all", icon: Layers, key: "modeAll" },
	{ value: "for-you", icon: Sparkles, key: "modeForYou" },
	{ value: "latest", icon: Clock, key: "modeLatest" },
	{ value: "random", icon: Shuffle, key: "modeRandom" },
];

export interface UnifiedResultsProps {
	keyword: string;
	/** Where the mode/filters are written back to, so they survive a reload. */
	basePath?: string;
	/**
	 * Pin the ordering and hide the mode row.
	 *
	 * For surfaces where the ordering *is* the tab — a search page with an
	 * "All" tab and a "For you" tab needs one control for it, not two that can
	 * disagree.
	 */
	fixedMode?: SearchMode;
	className?: string;
}

/**
 * Search results, every source at once.
 *
 * "All" works here because the API gives every source the same shape — a
 * profile, a Community post, a Gaddr Jobs project and a YouTube video are one
 * list, not five. "For you" is the same list ranked against the reader's topic
 * affinities by the Community recommender, so search and the feed agree about
 * what is good instead of each having an opinion.
 *
 * Mode and filters live in the URL. A reader who prefers chronological, or who
 * only wants results from Gaddr, can bookmark exactly that.
 */
export function UnifiedResults({
	keyword,
	basePath = "/discover",
	fixedMode,
	className,
}: UnifiedResultsProps) {
	const t = useTranslations("search");
	const router = useRouter();
	const searchParams = useSearchParams();

	const mode =
		fixedMode ?? (searchParams.get("mode") as SearchMode | null) ?? "all";
	const platforms = (searchParams.get("platforms") ?? "")
		.split(",")
		.filter(Boolean);
	const kinds = (searchParams.get("kinds") ?? "").split(",").filter(Boolean);
	const topics = (searchParams.get("topics") ?? "").split(",").filter(Boolean);
	const [layout, setLayout] = useState<"grid" | "list">("grid");

	const search = useUnifiedSearch({ keyword, mode, platforms, kinds, topics });
	const filterCount = platforms.length + kinds.length + topics.length;
	const sentinelRef = useRef<HTMLDivElement>(null);

	const { hasNextPage, isFetchingNextPage, fetchNextPage } = search;

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
		// Depending on the whole query object would tear down and rebuild the
		// observer on every render, including the ones its own fetch causes.
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const setParam = useCallback(
		(key: string, value: string | null) => {
			const params = new URLSearchParams(searchParams.toString());
			if (!value) params.delete(key);
			else params.set(key, value);
			const query = params.toString();
			router.replace(query ? `${basePath}?${query}` : basePath, {
				scroll: false,
			});
		},
		[basePath, router, searchParams],
	);

	const toggleIn = useCallback(
		(key: string, current: string[], value: string) => {
			const next = current.includes(value)
				? current.filter((v) => v !== value)
				: [...current, value];
			setParam(key, next.length > 0 ? next.join(",") : null);
		},
		[setParam],
	);

	const clearFilters = useCallback(() => {
		const params = new URLSearchParams(searchParams.toString());
		// Mode is not a filter — someone clearing filters still wants the
		// ordering they chose, and resetting it too would feel like a bug.
		for (const key of ["platforms", "kinds", "topics"]) params.delete(key);
		const query = params.toString();
		router.replace(query ? `${basePath}?${query}` : basePath, {
			scroll: false,
		});
	}, [basePath, router, searchParams]);

	return (
		<section className={cn("w-full", className)} data-testid="unified-results">
			{/* ------------------------------------------------------------ modes */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div
					role="tablist"
					aria-label={t("resultMode")}
					className={cn(
						"flex gap-1 rounded-full border border-border p-1",
						fixedMode && "hidden",
					)}
				>
					{MODES.map(({ value, icon: Icon, key }) => (
						<button
							key={value}
							role="tab"
							type="button"
							aria-selected={mode === value}
							data-testid={`search-mode-${value}`}
							onClick={() => setParam("mode", value === "all" ? null : value)}
							className={cn(
								"inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
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

				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">
						{t("resultCount", { count: search.total })}
					</span>
					{filterCount > 0 && (
						<button
							type="button"
							onClick={clearFilters}
							data-testid="clear-filters"
							className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-primary hover:underline"
						>
							<X className="size-3" aria-hidden />
							{t("clearFilters", { count: filterCount })}
						</button>
					)}
					<button
						type="button"
						aria-label={t(layout === "grid" ? "asList" : "asGrid")}
						onClick={() => setLayout(layout === "grid" ? "list" : "grid")}
						className="rounded-full p-2 text-muted-foreground hover:bg-muted"
					>
						{layout === "grid" ? (
							<Rows3 className="size-4" />
						) : (
							<LayoutGrid className="size-4" />
						)}
					</button>
				</div>
			</div>

			{/* ---------------------------------------------------------- filters */}
			{search.sources.length > 0 && (
				<div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={t("filterBySource")}>
					{search.sources.map((source) => {
						const active = platforms.includes(source.platform);
						return (
							<button
								key={source.platform}
								type="button"
								aria-pressed={active}
								data-testid={`filter-source-${source.platform}`}
								onClick={() => toggleIn("platforms", platforms, source.platform)}
								className={cn(
									"inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
									active
										? "border-primary bg-primary/10 text-primary"
										: source.isNative
											? "border-primary/30 text-foreground hover:border-primary"
											: "border-border text-muted-foreground hover:border-primary/50",
								)}
							>
								{source.label}
								<span className="tabular-nums opacity-60">{source.count}</span>
							</button>
						);
					})}
				</div>
			)}

			{search.kinds.length > 1 && (
				<div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={t("filterByKind")}>
					{search.kinds.map((entry) => {
						const active = kinds.includes(entry.kind);
						return (
							<button
								key={entry.kind}
								type="button"
								aria-pressed={active}
								data-testid={`filter-kind-${entry.kind}`}
								onClick={() => toggleIn("kinds", kinds, entry.kind)}
								className={cn(
									"rounded-full border px-3 py-1 text-xs transition-colors",
									active
										? "border-primary bg-primary/10 text-primary"
										: "border-border text-muted-foreground hover:border-primary/50",
								)}
							>
								{t(`kind.${entry.kind}`)}
								<span className="ml-1.5 tabular-nums opacity-60">
									{entry.count}
								</span>
							</button>
						);
					})}
				</div>
			)}

			{/* Themes, derived from the results rather than a curated taxonomy —
			    so the rail always describes what is actually here. */}
			{search.topics.length > 0 && (
				<div
					className="mt-2 flex flex-wrap gap-1.5"
					role="group"
					aria-label={t("filterByTopic")}
				>
					{search.topics.map((entry) => {
						const active = topics.includes(entry.topic);
						return (
							<button
								key={entry.topic}
								type="button"
								aria-pressed={active}
								data-testid={`filter-topic-${entry.topic}`}
								onClick={() => toggleIn("topics", topics, entry.topic)}
								className={cn(
									"rounded-full border px-3 py-1 text-xs transition-colors",
									active
										? "border-primary bg-primary/10 text-primary"
										: "border-border text-muted-foreground hover:border-primary/50",
								)}
							>
								#{entry.topic}
								<span className="ml-1.5 tabular-nums opacity-60">
									{entry.count}
								</span>
							</button>
						);
					})}
				</div>
			)}

			{/* ---------------------------------------------------------- results */}
			{search.isLoading && (
				<div className="mt-5" aria-busy="true">
					<ResultLayoutSkeleton layout={layout} kind="mixed" />
				</div>
			)}

			{search.isError && (
				<div className="mt-6 rounded-2xl border border-border p-8 text-center">
					<p className="text-sm text-muted-foreground">{t("searchError")}</p>
					<Button
						className="mt-3"
						variant="secondary"
						size="sm"
						label={t("tryAgain")}
						icon={<RefreshCw className="size-4" />}
						onClick={() => void search.refetch()}
					/>
				</div>
			)}

			{!search.isLoading && !search.isError && search.items.length === 0 && (
				<p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
					{keyword ? t("noResultsFor", { keyword }) : t("noResults")}
				</p>
			)}

			<div
				className={cn(
					"mt-5 gap-4",
					layout === "grid"
						? "grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))]"
						: "flex flex-col",
				)}
			>
				{search.items.map((item) => (
					<SearchResultInteraction
						key={item.id}
						result={{
							id: item.id,
							contentStreamId: item.contentStreamId,
							gaddrViews: item.metrics?.gaddrViews,
							gaddrExternalClicks: item.metrics?.gaddrExternalClicks,
							type: item.kind,
							title: item.title,
							description: item.description,
							platform: item.source.label,
							url: item.url,
							externalUrl: item.source.externalUrl,
							profileHandle: item.author?.gaddrProfileHandle,
							media: {
								url: item.playback?.url,
								thumbnailUrl: item.playback?.posterUrl ?? item.thumbnailUrl,
							},
						}}
					>
						<UnifiedResultCard item={item} layout={layout} />
					</SearchResultInteraction>
				))}
			</div>

			<div ref={sentinelRef} className="h-8" aria-hidden />

			{search.isFetchingNextPage && (
				<p className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
					<Loader2 className="size-4 animate-spin" aria-hidden />
					{t("loadingMore")}
				</p>
			)}
		</section>
	);
}
