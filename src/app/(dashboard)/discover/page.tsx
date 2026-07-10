"use client";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { AlertCircle, Grid2x2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import React, { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectGroup,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@/components/ui/multi-select";

import YoutubeRedIcon from "@/components/svg/Youtube.svg";
import FacebookBlueIcon from "@/components/svg/facebook-blue.svg";
import InstagramColorIcon from "@/components/svg/instagram-colored.svg";
import MenuIcon from "@/components/svg/menu-icon.svg";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn.util";
import ContentFeedCard from "@/components/card/ContentFeedCard";
import ProfileCard from "@/components/card/PorfileCard";
import { platforms } from "@/constants/platforms";
import { SearchResults, TrendingSection } from "@/components/search";
import { useSearch } from "@/hooks/useSearch";
import { useTrending } from "@/hooks/useTrending";
import { SearchFilter, TrendingItem } from "@/types/search.types";
import PinterestIcon from "@/components/svg/pinterest.svg";
import { useDiscoverCreators } from "@/hooks/useDiscoverCreators";
import { useDiscoverContent } from "@/hooks/useDiscoverContent";
import { useAuthUserStore } from "@/store/auth-user.store";
import type { DiscoverContentModel } from "@/types/discover.type";
import { getContentCategory, filterByPlatform, filterByContentType, filterByDatePosted, sortByMetrics } from "@/lib/discover-filters";
import Link from "next/link";
const tabs = ["All", "For you", "Profiles", "Posts", "Reels & Videos"];

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

const DiscoveryPage = () => {
	const searchParams = useSearchParams();
	const queryParam = searchParams.get("q") ?? "";
	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
	const [viewType, setViewType] = useState<"list" | "grid">("grid");
	const [searchQuery, setSearchQuery] = useState("");
	const [showSearchResults, setShowSearchResults] = useState(false);
	const [filters, setFilters] = useState<Record<string, string | string[]>>({
		contentType: [],
		metrics: [],
		datePosted: "anytime",
		monetization: [],
	});

	const searchState = useSearch({ debounceMs: 120, useMockData: false });
	const trendingState = useTrending(selectedPlatforms || undefined, true);
	const creatorState = useDiscoverCreators(12);

	// Auth
	const { authUser } = useAuthUserStore();

	// Discover feed hooks (cursor-paginated)
	const discoverContent = useDiscoverContent(); // "All" — public feed
	const forYouContent = useDiscoverContent({ userId: authUser?.id, enabled: !!authUser }); // "For You" — user's own content (auth-only)

	const originalDiscoverItems: DiscoverContentModel[] = React.useMemo(
		() => discoverContent.data?.pages.flatMap((p) => p.contents) ?? [],
		[discoverContent.data],
	);

	const forYouContents: DiscoverContentModel[] = React.useMemo(
		() => forYouContent.data?.pages.flatMap((p) => p.contents) ?? [],
		[forYouContent.data],
	);

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

	function renderPlatformIcon(platform: string, className?: string): React.ReactNode {
		const cls = className ?? 'w-5 h-5 text-blue-600';
		switch (platform) {
			case 'facebook':
				return <FacebookBlueIcon className={cls} />;
			case 'youtube':
				return <YoutubeRedIcon />;
			case 'instagram':
				return <InstagramColorIcon className={cls} />;
			case 'pinterest':
				return <PinterestIcon className={cls} />;
			default:
				return null;
		}
	}

	function isValidUrl(url: string): boolean {
		try {
			const parsed = new URL(url);
			return parsed.protocol === 'http:' || parsed.protocol === 'https:';
		} catch {
			return false;
		}
	}

	function renderContentFeedCard(item: DiscoverContentModel, titleLimit = 34) {
		const validUrl = item.sourceUrl && isValidUrl(item.sourceUrl) ? item.sourceUrl : null;
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
					imageSrc={item.imageUrl ?? undefined}
					profilePicSrc={item.userProfileImage ?? '/icons/gaddr-logo-xs.svg'}
					userName={item.userName}
					userHandle={item.userHandle}
					platformIcon={renderPlatformIcon(item.platform)}
					textContent={
						(() => {
							const t = item.title?.trim() ?? '';
							const d = item.description?.trim() ?? '';
							if (!t && !d) return null;
							return (
								<>
									{t && (
										<span className="font-semibold block line-clamp-1">
											{t.substring(0, titleLimit)}
										</span>
									)}
									{d && (
										<span className="text-sm text-muted-foreground block line-clamp-2">
											{d}
										</span>
									)}
								</>
							);
						})()
					}
					date={item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'none'}
					views={item.views ?? 0}
					likes={item.likes ?? 0}
					comments={item.comments ?? 0}
				/>
			</div>
		);
	}

	// Trigger search when query or selected platforms change
	const handleSearch = useCallback(
		(query: string) => {
			if (!query.trim()) {
				setShowSearchResults(false);
				return;
			}

			const searchFilter: SearchFilter = {
				contentType: filters.contentType as string[],
				metrics: filters.metrics as string[],
				datePosted: filters.datePosted as string,
				monetization: filters.monetization as string[],
			};

			searchState.debouncedSearch(
				query,
				selectedPlatforms.length > 0 ? selectedPlatforms : ["twitter", "instagram", "facebook", "youtube"],
				searchFilter,
				1
			);
			setShowSearchResults(true);
		},
		[filters, selectedPlatforms, searchState]
	);

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
		}
	}, [queryParam]);

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
						const displayName = [creator.firstName, creator.lastName].filter(Boolean).join(" ").trim();
						const isProfileAvailable = !!creator.userName;

						return (
							<ProfileCard
								key={creator.id}
								userId={creator.id}
								profilePicSrc={creator.profileImage ?? "/icons/gaddr-logo-xs.svg"}
								userName={displayName || creator.userName}
								userHandle={isProfileAvailable ? `@${creator.userName}` : ""}
								category={creator.niche ?? "Creator"}
								postCount={creator.totalPosts}
								followerCount={creator.followersCount}
								followingCount={creator.followingCount}
								linkedAccounts={creator.linkedAccounts ?? []}
								profileHref={isProfileAvailable ? `/u/${creator.userName}` : undefined}
								initialIsFollowing={creator.isFollowing ?? false}
								isProfileAvailable={isProfileAvailable}
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
			const platformFilteredResults = selectedPlatforms.length > 0
				? searchState.results.filter((r) => selectedPlatforms.includes(r.platform))
				: searchState.results;

			return (
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-gray-900">
							Search Results for &quot;{searchQuery}&quot;
						</h2>
						<span className="text-sm text-gray-600">
							{platformFilteredResults.length} results
						</span>
					</div>
					<SearchResults
						results={platformFilteredResults}
						isLoading={searchState.isLoading}
						isError={searchState.isError}
						error={searchState.error}
						viewType={viewType}
						onRetry={() => handleSearch(searchQuery)}
					/>

					{/* Pagination Controls */}
					{!searchState.isLoading && !searchState.isError && searchState.results.length > 0 && (
						<div className="flex items-center justify-center gap-4 mt-8">
							<Button
								onClick={() =>
									searchState.previousPage(
										searchQuery,
										selectedPlatforms.length > 0
											? selectedPlatforms
											: ["twitter", "instagram", "facebook", "youtube"],
										filters as SearchFilter
									)
								}
								disabled={searchState.page === 1}
								className="flex items-center gap-2"
							>
								<ChevronLeft className="w-4 h-4" />
								Previous
							</Button>

							<span className="text-sm text-gray-600">
								Page {searchState.page}
							</span>

							<Button
								onClick={() =>
									searchState.nextPage(
										searchQuery,
										selectedPlatforms.length > 0
											? selectedPlatforms
											: ["twitter", "instagram", "facebook", "youtube"],
										filters as SearchFilter
									)
								}
								disabled={!searchState.hasNextPage}
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
							{forYouContents.map((item) => renderContentFeedCard(item, 34))}
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
			{!showSearchResults && (
				<div className="mb-8 lg:hidden">
					<TrendingSection
						items={trendingState.items}
						isLoading={trendingState.isLoading}
						isError={trendingState.isError}
						onItemClick={handleTrendingClick}
					/>
				</div>
			)}

			<TabGroup>
				<div className="flex flex-wrap gap-3 md:justify-between justify-baseline md:border-b md:border-[#E6E6E6]">
					{!showSearchResults && (
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
					</span>
				</div>

				<div className="flex gap-6">
					{/* Main Content */}
					<div className="flex-1">
						{renderContent()}
					</div>

					{/* Sidebar with Filters and Trending */}
					<div className="hidden lg:block w-80 space-y-6">
						{/* Filters Section */}
						{!showSearchResults && (
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
						{!showSearchResults && (
							<TrendingSection
								items={trendingState.items}
								isLoading={trendingState.isLoading}
								isError={trendingState.isError}
								onItemClick={handleTrendingClick}
							/>
						)}
					</div>

					{/* Mobile Filters - Collapsed */}
					{!showSearchResults && (
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
