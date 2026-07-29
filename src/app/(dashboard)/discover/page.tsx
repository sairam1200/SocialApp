"use client";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { AlertCircle, Grid2x2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectGroup,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@/components/ui/multi-select";

import MenuIcon from "@/components/svg/menu-icon.svg";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn.util";
import ContentFeedCard from "@/components/card/ContentFeedCard";
import ProfileCard from "@/components/card/PorfileCard";
import ProjectCard from "@/components/card/ProjectCard";
import { platforms } from "@/constants/platforms";
import { SearchResults, TrendingSection } from "@/components/search";
import { useSearch } from "@/hooks/useSearch";
import { useTrending } from "@/hooks/useTrending";
import { TrendingItem, SearchTypeTab } from "@/types/search.types";
import { useDiscoverCreators } from "@/hooks/useDiscoverCreators";
import { useDiscoverContent } from "@/hooks/useDiscoverContent";
import { useSearchProjects } from "@/hooks/useSearchProjects";
import { useAuthUserStore } from "@/store/auth-user.store";
import type { DiscoverContentModel } from "@/types/discover.type";
import { getContentCategory, filterByPlatform, filterByContentType, filterByDatePosted, sortByMetrics } from "@/lib/discover-filters";
import { renderPlatformIcon, isValidUrl, normalizeDiscoverContent, mapProfileToProps } from "@/lib/card-helpers";
import Link from "next/link";
const tabs = ["All", "For you", "Profiles", "Posts", "Reels & Videos", "Projects"];
const PROJECTS_TAB_INDEX = tabs.indexOf("Projects");
const searchTypeTabs = ["Profiles", "Contents", "Projects"];

const filterSections = [
	{
		title: "Content Type",
		key: "contentType",
		type: "checkbox",
		options: [
			{ id: "feed_post", label: "Feed Post" },
			{ id: "reels_shorts", label: "Reels/Shorts" },
			{ id: "live_stream", label: "Live Stream" },
			{ id: "igtv_long_form", label: "IGTV/Long form" },
		],
	},
	{
		title: "Metrics",
		key: "metrics",
		type: "checkbox",
		options: [
			{ id: "highest_liked", label: "Highest Liked" },
			{ id: "most_commented", label: "Most Commented" },
			{ id: "most_views", label: "Most Views" },
			{ id: "fastest_growing", label: "Fastest-Growing", disabled: true },
		],
	},
	{
		title: "Date Posted",
		key: "datePosted",
		type: "radio",
		options: [
			{ id: "past_week", label: "Past week" },
			{ id: "past_month", label: "Past month" },
			{ id: "anytime", label: "Anytime" },
		],
	},
	/* {
		title: "Monetization",
		key: "monetization",
		type: "checkbox",
		options: [
			{ id: "contains_ads", label: "Contains Ads" },
			{ id: "non_monetized", label: "Non-Monetized" },
		],
	}, */
];

// TODO: REMOVE AFTER SEARCH DEBUGGING
const DEBUG_SEARCH = typeof window !== 'undefined' && process.env.NODE_ENV === 'development';

const DiscoveryPage = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const queryParam = searchParams.get("q") ?? "";
	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
	const [viewType, setViewType] = useState<"list" | "grid">("grid");
	const [searchQuery, setSearchQuery] = useState("");
	const [showSearchResults, setShowSearchResults] = useState(false);
	const [searchType, setSearchType] = useState<SearchTypeTab>("profiles");
	const [searchPage, setSearchPage] = useState(1);
	const [activeBrowseTab, setActiveBrowseTab] = useState(0);
	const [allProjectsPage, setAllProjectsPage] = useState(1);
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
	const [filters, setFilters] = useState<Record<string, string | string[]>>({
		contentType: [],
		metrics: [],
		datePosted: "anytime",
		monetization: [],
	});

	const isProjectsBrowseTab = !showSearchResults && activeBrowseTab === PROJECTS_TAB_INDEX;

	const SEARCH_LIMIT = 12;

	const searchState = useSearch({
		debounceMs: 120,
		useMockData: false,
		page: searchPage,
		limit: SEARCH_LIMIT,
		enabled: showSearchResults,
		platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
	});
	const allProjectsState = useSearchProjects({
		q: "",
		page: allProjectsPage,
		limit: SEARCH_LIMIT,
		enabled: isProjectsBrowseTab,
		allowEmpty: true,
	});
	const trendingState = useTrending(selectedPlatforms || undefined, true);
	const creatorState = useDiscoverCreators(12);

	// TODO: REMOVE AFTER SEARCH DEBUGGING
	React.useEffect(() => {
		if (DEBUG_SEARCH && showSearchResults) {
			console.log('[SEARCH DEBUG]');
			console.log('Search State Updated');
			console.log(`Total: ${searchState.totalResults}`);
		}
	}, [searchState.totalResults, searchState.results, showSearchResults]);

	// Pagination
	const searchTotalPages = Math.ceil(searchState.totalResults / SEARCH_LIMIT);
	const activeTotalResults = searchState.totalResults;
	const activeHasNextPage = searchPage < searchTotalPages;
	const activeHasPreviousPage = searchPage > 1;

	const allProjectsTotalPages = Math.ceil(allProjectsState.totalResults / SEARCH_LIMIT);
	const allProjectsHasNextPage = allProjectsPage < allProjectsTotalPages;
	const allProjectsHasPreviousPage = allProjectsPage > 1;

	// TODO: REMOVE AFTER SEARCH DEBUGGING
	React.useEffect(() => {
		if (DEBUG_SEARCH && showSearchResults && !searchState.isFetching && !searchState.isLoading) {
			console.log('[SEARCH DEBUG]');
			console.log('API');
			console.log('↓');
			console.log('Hook');
			console.log('↓');
			console.log('Normalizer');
			console.log('↓');
			console.log('State');
			console.log('↓');
			console.log('Renderer');
			console.log('↓');
			console.log('Cards');
			console.log('[SEARCH DEBUG]');
			const prevTotal = searchState.results.length;
			const profileCount = searchState.results.filter(r => r.type === 'profile').length;
			const contentCount = searchState.results.filter(r => r.type !== 'profile' && r.type !== 'project').length;
			const projectCount = searchState.results.filter(r => r.type === 'project').length;
			console.log(`Total: ${searchState.totalResults}`);
			console.log(`Profiles: ${profileCount}`);
			console.log(`Contents: ${contentCount}`);
			console.log(`Projects: ${projectCount}`);
		}
	}, [showSearchResults, searchState.isFetching, searchState.isLoading, searchState.totalResults, searchState.results]);

	const searchTabIndex = showSearchResults
		? searchTypeTabs.findIndex((t) => t.toLowerCase() === searchType)
		: -1;

	const updateUrlParams = useCallback((updates: Record<string, string>) => {
		const params = new URLSearchParams(searchParams.toString());
		for (const [key, value] of Object.entries(updates)) {
			if (value) {
				params.set(key, value);
			} else {
				params.delete(key);
			}
		}
		router.replace(`?${params.toString()}`, { scroll: false });
	}, [searchParams, router]);

	const handleNextPage = useCallback(() => {
		if (!activeHasNextPage) return;
		const nextPage = searchPage + 1;
		setSearchPage(nextPage);
		updateUrlParams({ page: String(nextPage) });
	}, [searchPage, activeHasNextPage, updateUrlParams]);

	const handlePreviousPage = useCallback(() => {
		if (!activeHasPreviousPage) return;
		const prevPage = searchPage - 1;
		setSearchPage(prevPage);
		updateUrlParams({ page: String(prevPage) });
	}, [searchPage, activeHasPreviousPage, updateUrlParams]);

	// Auth
	const { authUser } = useAuthUserStore();

	// Discover feed hooks (cursor-paginated)
	const discoverContent = useDiscoverContent(); // "All" — public feed
	const forYouContent = useDiscoverContent({ userId: authUser?.id, enabled: !!authUser }); // "For You" — user's own content (auth-only)

	const originalDiscoverItems: DiscoverContentModel[] = React.useMemo(
		() => discoverContent.data?.pages.flatMap((p) => p.contents).filter((item): item is DiscoverContentModel => !!item) ?? [],
		[discoverContent.data],
	);

	const forYouContents: DiscoverContentModel[] = React.useMemo(
		() => forYouContent.data?.pages.flatMap((p) => p.contents).filter((item): item is DiscoverContentModel => !!item) ?? [],
		[forYouContent.data],
	);

	const filteredForYouItems = React.useMemo(() => {
		const contentType = filters.contentType as string[];
		const metrics = filters.metrics as string[];
		const datePosted = filters.datePosted as string;

		let feed = forYouContents;

		feed = filterByPlatform(feed, selectedPlatforms);
		feed = filterByContentType(feed, contentType);
		feed = filterByDatePosted(feed, datePosted);
		feed = sortByMetrics(feed, metrics);

		return feed;
	}, [forYouContents, selectedPlatforms, filters]);

	const filteredDiscoverItems = React.useMemo(() => {
		const contentType = filters.contentType as string[];
		const metrics = filters.metrics as string[];
		const datePosted = filters.datePosted as string;

		let feed = originalDiscoverItems;

		feed = filterByPlatform(feed, selectedPlatforms);
		feed = filterByContentType(feed, contentType);
		feed = filterByDatePosted(feed, datePosted);
		feed = sortByMetrics(feed, metrics);

		return feed;
	}, [originalDiscoverItems, selectedPlatforms, filters]);

	const reelsAndShortsFeed = React.useMemo(
		() => filteredDiscoverItems.filter((item) => getContentCategory(item) === "reels_shorts"),
		[filteredDiscoverItems],
	);
	const PostsFeed = React.useMemo(
		() => filteredDiscoverItems.filter((item) => getContentCategory(item) === "feed_post"),
		[filteredDiscoverItems],
	);

	const profileSearchResults = useMemo(() => {
		if (!showSearchResults || searchType !== "profiles") return [];
		return searchState.results.filter((r) => r.type === "profile");
	}, [searchState.results, searchType, showSearchResults]);

	const contentSearchResults = useMemo(() => {
		if (!showSearchResults || searchType !== "contents") return [];
		let results = searchState.results.filter(
			(r) => r.type !== "profile" && r.type !== "project",
		);
		if (selectedPlatforms.length > 0) {
			results = results.filter((r) => selectedPlatforms.includes(r.platform));
		}
		return results;
	}, [searchState.results, searchType, showSearchResults, selectedPlatforms]);

	const projectSearchResults = useMemo(() => {
		if (!showSearchResults || searchType !== "projects") return [];
		return searchState.results.filter((r) => r.type === "project");
	}, [searchState.results, searchType, showSearchResults]);

	function renderContentFeedCard(item: DiscoverContentModel, titleLimit = 34) {
		const cardProps = normalizeDiscoverContent(item, titleLimit);
		const validUrl = cardProps.sourceUrl && isValidUrl(cardProps.sourceUrl) ? cardProps.sourceUrl : null;
		return (
			<div
				key={`${item.platform}-${item.id}`}
				onClick={() => {
					if (validUrl) {
						window.open(validUrl, '_blank', 'noopener,noreferrer');
					}
				}}
				className={validUrl ? 'cursor-pointer' : ''}
			>
				<ContentFeedCard
					{...cardProps}
					platformIcon={renderPlatformIcon(cardProps.platform)}
				/>
			</div>
		);
	}

	const handleSearch = useCallback(
		(query: string) => {
			if (!query.trim()) {
				setShowSearchResults(false);
				return;
			}

			if (!showSearchResults) {
				const tabParam = searchParams.get("tab") as SearchTypeTab | null;
				const hasValidTab =
					tabParam &&
					searchTypeTabs.map((t) => t.toLowerCase()).includes(tabParam);
				if (!hasValidTab) {
					setSearchType("profiles");
				}
			}

			setSearchPage(1);
			searchState.debouncedSearch(query);
			setShowSearchResults(true);
		},
		[searchState, showSearchResults, searchParams],
	);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Handle search input change
	const handleSearchInputChange = (query: string) => {
		setSearchQuery(query);
		handleSearch(query);
	};

	// Sync search from URL query param (e.g., from header search bar)
	useEffect(() => {
		if (queryParam && queryParam !== searchQuery) {
			setSearchQuery(queryParam);
			handleSearch(queryParam);
		}
	}, [queryParam, searchQuery, handleSearch]);

	// Reset search state when URL query param is removed (navigation away from search)
	useEffect(() => {
		if (!queryParam) {
			setShowSearchResults(false);
			setSearchQuery("");
			setSearchPage(1);
		}
	}, [queryParam]);

	// Sync tab and page from URL on mount
	useEffect(() => {
		const tabParam = searchParams.get("tab") as SearchTypeTab | null;
		const pageParam = searchParams.get("page");
		if (tabParam && searchTypeTabs.map(t => t.toLowerCase()).includes(tabParam)) {
			setSearchType(tabParam);
		}
		if (pageParam) {
			const page = parseInt(pageParam, 10);
			if (!isNaN(page) && page > 0) {
				setSearchPage(page);
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Handle trending item click
	const handleTrendingClick = (item: TrendingItem) => {
		setSearchQuery(item.title);
		handleSearch(item.title);
	};

	const handleFilterChange = (sectionKey: string, optionId: string, type: string) => {
		setFilters((prev) => {
			if (type === "radio") {
				return {
					...prev,
					[sectionKey]: optionId,
				};
			}

			// checkbox logic
			const currentValues = prev[sectionKey] as string[];
			const updatedValues = currentValues?.includes(optionId)
				? currentValues.filter((id) => id !== optionId)
				: [...(currentValues || []), optionId];

			return {
				...prev,
				[sectionKey]: updatedValues,
			};
		});
	};

	const renderCreators = () => {
		if (creatorState.isLoading) {
			return (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-gray-500" />
				</div>
			);
		}

		if (creatorState.isError) {
			return (
				<div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
					<AlertCircle className="h-8 w-8 text-red-500" />
					<p className="text-sm text-gray-600">
						{creatorState.error?.message ?? "Unable to load creator profiles."}
					</p>
					<Button variant="secondary" onClick={creatorState.retry}>
						Try again
					</Button>
				</div>
			);
		}

		if (creatorState.profiles.length === 0) {
			return (
				<div className="rounded-xl border border-[#E6E6E6] bg-[#FAFAFA] px-4 py-10 text-center">
					<p className="text-sm text-[#595959]">No creator profiles found yet.</p>
				</div>
			);
		}

		return (
			<div className="space-y-6">
				<div
					className="grid gap-6"
					style={{
						gridTemplateColumns:
							viewType === "grid"
								? "repeat(auto-fit, minmax(240px, 1fr))"
								: "1fr",
						maxWidth: "100%",
					}}
				>
					{creatorState.profiles.map((creator) => {
						const cardProps = mapProfileToProps(creator);

						return (
							<ProfileCard
								key={creator.id}
								{...cardProps}
							/>
						);
					})}
				</div>

				<div className="flex items-center justify-center gap-4">
					<Button
						onClick={creatorState.previousPage}
						disabled={creatorState.page === 1}
						className="flex items-center gap-2"
					>
						<ChevronLeft className="w-4 h-4" />
						Previous
					</Button>
					<span className="text-sm text-gray-600">
						Page {creatorState.page}
					</span>
					<Button
						onClick={creatorState.nextPage}
						disabled={!creatorState.hasNextPage}
						className="flex items-center gap-2"
					>
						Next
						<ChevronRight className="w-4 h-4" />
					</Button>
				</div>
			</div>
		);
	};

	// Render content based on search state
	const renderContent = () => {
		if (showSearchResults) {
			const isTabFetching = searchState.isFetching;
			const isTabError = searchState.isError;
			const tabError = searchState.error;
			const activeResults = searchType === "profiles"
				? profileSearchResults
				: searchType === "projects"
					? projectSearchResults
					: contentSearchResults;

			const typeLabel = searchType === "projects" ? "results" : searchType;

			return (
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-gray-900">
							Search Results for &quot;{searchQuery}&quot;
						</h2>
						<span className="text-sm text-gray-600">
							{activeTotalResults} {typeLabel}
						</span>
					</div>
					<SearchResults
						results={activeResults}
						searchType={searchType}
						isLoading={isTabFetching}
						isError={isTabError}
						error={tabError}
						viewType={viewType}
						onRetry={() => handleSearch(searchQuery)}
					/>

					{/* Pagination Controls */}
					{!searchState.isFetching && !searchState.isError && activeTotalResults > 0 && (
						<div className="flex items-center justify-center gap-4 mt-8">
							<Button
								onClick={handlePreviousPage}
								disabled={!activeHasPreviousPage}
								className="flex items-center gap-2"
							>
								<ChevronLeft className="w-4 h-4" />
								Previous
							</Button>

							<span className="text-sm text-gray-600">
								Page {searchPage} of {searchTotalPages}
							</span>

							<Button
								onClick={handleNextPage}
								disabled={!activeHasNextPage}
								className="flex items-center gap-2"
							>
								Next
								<ChevronRight className="w-4 h-4" />
							</Button>
						</div>
					)}
				</div>
			);
		}

		// Default discover view - Tabs
		return (
			<TabPanels className="flex-1 mt-5 text-gray-neutral text-sm">
				<TabPanel className="space-y-6">
					<section className="space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-gray-900">Creators to discover</h2>
							<span className="text-sm text-gray-600">{creatorState.totalResults} profiles</span>
						</div>

					</section>
					<div
						className="grid gap-6"
						style={{
							gridTemplateColumns:
								viewType === "grid"
									? "repeat(auto-fit, minmax(240px, 1fr))"
									: "1fr",
							maxWidth: "100%",
						}}
					>

						{filteredDiscoverItems.map((item) => renderContentFeedCard(item, 34))}
						{discoverContent.hasNextPage && (
							<div className="col-span-full flex justify-center">
								<Button
									onClick={() => discoverContent.fetchNextPage()}
									disabled={discoverContent.isFetchingNextPage}
									className="flex items-center gap-2"
								>
									{discoverContent.isFetchingNextPage ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : null}
									Load More
								</Button>
							</div>
						)}
					</div>
				</TabPanel>
				<TabPanel className="space-y-6">
					{!authUser ? (
						<div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
							<h3 className="text-lg font-semibold text-gray-900">Your content, all in one place</h3>
							<p className="text-sm text-gray-600 max-w-md">
								Sign in to see your own posts, videos, and content across all your connected platforms.
							</p>
							<Link href="/login">
								<Button className="cursor-pointer">Sign in</Button>
							</Link>
						</div>
					) : (
						<div
							className="grid gap-6"
							style={{
								gridTemplateColumns:
									viewType === "grid"
										? "repeat(auto-fit, minmax(240px, 1fr))"
										: "1fr",
								maxWidth: "100%",
							}}
						>
							{filteredForYouItems.map((item) => renderContentFeedCard(item, 34))}
							{forYouContent.hasNextPage && (
								<div className="col-span-full flex justify-center">
									<Button
										onClick={() => forYouContent.fetchNextPage()}
										disabled={forYouContent.isFetchingNextPage}
										className="flex items-center gap-2"
									>
										{forYouContent.isFetchingNextPage ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : null}
										Load More
									</Button>
								</div>
							)}
						</div>
					)}
				</TabPanel>
				<TabPanel className="space-y-6">{renderCreators()}</TabPanel>
				<TabPanel className="space-y-6">
					<div
						className="grid gap-6"
						style={{
							gridTemplateColumns:
								viewType === "grid"
									? "repeat(auto-fit, minmax(240px, 1fr))"
									: "1fr",
							maxWidth: "100%",
						}}
					>
						{PostsFeed.map((item) => renderContentFeedCard(item, 50))}
					</div>
				</TabPanel>
				<TabPanel className="space-y-6">
					<div
						className="grid gap-6"
						style={{
							gridTemplateColumns:
								viewType === "grid"
									? "repeat(auto-fit, minmax(240px, 1fr))"
									: "1fr",
							maxWidth: "100%",
						}}
					>
						{reelsAndShortsFeed.map((item) => renderContentFeedCard(item, 34))}
					</div>
				</TabPanel>
				<TabPanel className="space-y-6">
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-gray-900">Projects</h2>
							{!allProjectsState.isLoading && !allProjectsState.isError && (
								<span className="text-sm text-gray-600">
									{allProjectsState.totalResults} projects
								</span>
							)}
						</div>

						{allProjectsState.isLoading ? (
							<div className={cn("grid gap-6", viewType === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
								{[...Array(12)].map((_, i) => (
									<div key={i} className="bg-white rounded-lg border border-[#E6E6E6] p-4 animate-pulse h-64">
										<div className="flex gap-4 h-full">
											<div className="w-16 h-16 bg-[#F0F0F0] rounded-lg shrink-0"></div>
											<div className="flex-1 space-y-2">
												<div className="h-4 bg-[#F0F0F0] rounded w-3/4"></div>
												<div className="h-3 bg-[#F0F0F0] rounded w-1/2"></div>
												<div className="h-3 bg-[#F0F0F0] rounded w-2/3"></div>
											</div>
										</div>
									</div>
								))}
							</div>
						) : allProjectsState.isError ? (
							<div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
								<AlertCircle className="h-8 w-8 text-red-500" />
								<p className="text-sm text-gray-600">
									{allProjectsState.error?.message ?? "Unable to load projects."}
								</p>
								<Button variant="secondary" onClick={allProjectsState.retry}>
									Try again
								</Button>
							</div>
						) : allProjectsState.projects.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12">
								<div className="rounded-full bg-gray-100 p-4 mb-4">
									<div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin opacity-50"></div>
								</div>
								<h3 className="text-lg font-semibold text-gray-900 mb-2">No projects available yet</h3>
								<p className="text-gray-600 text-center">Check back later for new projects</p>
							</div>
						) : (
							<div className={cn("grid gap-6", viewType === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
								{allProjectsState.projects.map((project) => (
									<ProjectCard key={project.id} project={project} />
								))}
							</div>
						)}

						{!allProjectsState.isLoading && !allProjectsState.isError && allProjectsState.totalResults > 0 && (
							<div className="flex items-center justify-center gap-4 mt-8">
								<Button
									onClick={() => setAllProjectsPage(allProjectsPage - 1)}
									disabled={!allProjectsHasPreviousPage}
									className="flex items-center gap-2"
								>
									<ChevronLeft className="w-4 h-4" />
									Previous
								</Button>
								<span className="text-sm text-gray-600">
									Page {allProjectsPage} of {allProjectsTotalPages}
								</span>
								<Button
									onClick={() => setAllProjectsPage(allProjectsPage + 1)}
									disabled={!allProjectsHasNextPage}
									className="flex items-center gap-2"
								>
									Next
									<ChevronRight className="w-4 h-4" />
								</Button>
							</div>
						)}
					</div>
				</TabPanel>
			</TabPanels>
		);
	};

	return (
		<div className="mt-10">
			{/* Newer Search Section with debounce and instant search render */}
			{/* <div className="mb-8">
				<SearchInput
					value={searchQuery}
					onChange={handleSearchInputChange}
					onSearch={handleSearch}
					isLoading={searchState.isLoading}
					placeholder="Search content, creators, and trending topics..."
				/>
			</div> */}

			{/* Trending Section - Show when not searching */}
			{!isProjectsBrowseTab && !showSearchResults && (
				<div className="mb-8 lg:hidden">
					<TrendingSection
						items={trendingState.items}
						isLoading={trendingState.isLoading}
						isError={trendingState.isError}
						onItemClick={handleTrendingClick}
					/>
				</div>
			)}

			<TabGroup
				selectedIndex={showSearchResults ? searchTabIndex : undefined}
			onChange={(index: number) => {
				if (showSearchResults) {
					const tabKey = searchTypeTabs[index].toLowerCase() as SearchTypeTab;
					setSearchType(tabKey);
					updateUrlParams({ tab: tabKey, page: "1" });
				} else {
					const wasProjectsTab = activeBrowseTab === PROJECTS_TAB_INDEX;
					const isProjectsTab = index === PROJECTS_TAB_INDEX;
					if (wasProjectsTab || isProjectsTab) {
						setAllProjectsPage(1);
					}
					setActiveBrowseTab(index);
				}
			}}
			>
				<div className="flex flex-wrap gap-3 md:justify-between justify-baseline md:border-b md:border-[#E6E6E6]">
					{showSearchResults ? (
						<TabList className="flex gap-3 md:gap-5 overflow-x-auto border-b border-[#E6E6E6] md:border-none w-full md:w-auto">
							{searchTypeTabs.map((tab) => (
								<Tab
									key={tab}
									className={({ selected }) =>
										`px-2 sm:px-3 text-sm transition-colors text-nowrap focus:outline-none border-b-2 cursor-pointer ${selected
											? "gradient-border-primary gradient-text-primary font-semibold"
											: "bg-white border-transparent text-[#0D0D0D]"
										}`
									}
								>
									{tab}
								</Tab>
							))}
						</TabList>
					) : (
						<TabList className="flex gap-3 md:gap-5 overflow-x-auto border-b border-[#E6E6E6] md:border-none w-full md:w-auto">
							{tabs.map((tab) => (
								<Tab
									key={tab}
									className={({ selected }) =>
										`px-2 sm:px-3 text-sm transition-colors text-nowrap focus:outline-none border-b-2 cursor-pointer ${selected
											? "gradient-border-primary gradient-text-primary font-semibold"
											: "bg-white border-transparent text-[#0D0D0D]"
										}`
									}
								>
									{tab}
								</Tab>
							))}
						</TabList>
					)}
					<span className="flex gap-2 items-center w-full md:w-auto justify-end pb-2">
						<Button
							onClick={() => setViewType("grid")}
							size="icon"
							className={cn(
								"cursor-pointer rounded-md border border-[#33333330] shadow-none",
								viewType === "grid" ? "bg-[#333333] text-white" : "bg-white text-gray-neutral"
							)}
						>
							<Grid2x2 className={cn("size-6")} />
						</Button>
						<Button
							onClick={() => setViewType("list")}
							size="icon"
							className={cn(
								"cursor-pointer rounded-md border border-[#33333330] shadow-none",
								viewType === "list" ? "bg-[#333333] text-white" : "bg-white text-gray-neutral"
							)}
						>
							<MenuIcon className="size-5" />
						</Button>

						{!isProjectsBrowseTab && (!showSearchResults || searchType === "contents") && (
							<div className="w-45">
								<MultiSelect onValuesChange={setSelectedPlatforms}>
									<MultiSelectTrigger className="w-full">
										<MultiSelectValue
											badgeClassName="border-none p-0"
											clickToRemove={false}
											placeholder="Filter by platform"
										/>
									</MultiSelectTrigger>
									<MultiSelectContent>
										<MultiSelectGroup>
											{platforms.map((platform) => (
												<MultiSelectItem
													key={platform.id}
													value={platform.id}
													badgeLabel={
														<span>
															<platform.icon className="size-auto scale-70" />
														</span>
													}
												>
													<span className="flex items-center gap-2">
														{<platform.icon className="size-auto scale-80" />}
														{platform.name}
													</span>
												</MultiSelectItem>
											))}
										</MultiSelectGroup>
									</MultiSelectContent>
								</MultiSelect>
							</div>
						)}
					</span>
				</div>

				<div className="flex gap-6">
					{/* Main Content */}
					<div className="flex-1">
						{renderContent()}
					</div>

					{/* Sidebar with Filters and Trending */}
					<div className="hidden lg:block w-72 space-y-6">
						{/* Filters Section */}
						{!isProjectsBrowseTab && !showSearchResults && (
							<div className="px-5 bg-white rounded-lg border border-[#E6E6E6] p-5">
								<h3 className="text-black-default font-semibold text-base mb-4">Filters</h3>
								{filterSections.map((section) => (
									<div key={section.key} className="mb-6 pb-6 border-b border-[#E6E6E6] last:border-0 last:mb-0 last:pb-0">
										<h4 className="text-black-default font-medium text-sm mb-3">{section.title}</h4>
										<div className="space-y-3">
											{section.options.map((option) => (
												<label key={option.id} className={`flex items-center gap-3 ${option.disabled ? '' : 'cursor-pointer'}`}>
													<input
														type={section.type}
														
														checked={
															section.type === "radio"
																? filters[section.key] === option.id
																: (filters[section.key] as string[])?.includes(option.id)
														}
														onChange={() => handleFilterChange(section.key, option.id, section.type)}
														disabled={option.disabled}
														className={
															section.type === "radio"
																? "gradient-radio peer"
																: "w-4 h-4 rounded accent-primary peer"
														}
													/>
													<span className={`text-sm ${option.disabled ? 'opacity-40' : 'text-gray-neutral peer-checked:text-primary'}`}>{option.label}</span>
												</label>
											))}
										</div>
									</div>
								))}
							</div>
						)}

						{/* Trending Section */}
						{!isProjectsBrowseTab && !showSearchResults && (
							<TrendingSection
								items={trendingState.items}
								isLoading={trendingState.isLoading}
								isError={trendingState.isError}
								onItemClick={handleTrendingClick}
							/>
						)}
					</div>

					{/* Mobile Filters - Collapsed */}
					{!isProjectsBrowseTab && !showSearchResults && (
						<div className="lg:hidden mt-5 px-5">
							{filterSections.map((section) => (
								<div key={section.key} className="mb-8">
									<h3 className="text-black-default font-medium text-base mb-4">{section.title}</h3>
									<div className="space-y-3">
										{section.options.map((option) => (
											<label key={option.id} className={`flex items-center gap-3 ${option.disabled ? '' : 'cursor-pointer'}`}>
												<input
													type={section.type}
													// name={section.type === "radio" ? section.key : undefined}
													checked={
														section.type === "radio"
															? filters[section.key] === option.id
															: (filters[section.key] as string[])?.includes(option.id)
													}
													onChange={() => handleFilterChange(section.key, option.id, section.type)}
													disabled={option.disabled}
													className={`w-4 h-4 ${section.type === "radio" ? "rounded-full" : "rounded"} ${option.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer accent-primary peer'}`}
												/>
												<span className={`text-sm ${option.disabled ? 'opacity-40' : 'text-gray-neutral peer-checked:text-primary'}`}>{option.label}</span>
											</label>
										))}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</TabGroup>
		</div>
	);
};

export default DiscoveryPage;
