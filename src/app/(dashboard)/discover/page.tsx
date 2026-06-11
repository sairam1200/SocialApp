"use client";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Grid2x2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectGroup,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@/components/ui/multi-select";

import TwitterIcon from "@/components/svg/x-icon.svg";
import YoutubeIcon from "@/components/svg/youtube-black-icon.svg";
import YoutubeRedIcon from "@/components/svg/Youtube.svg";
import FacebookIcon from "@/components/svg/facebook-black-icon.svg";
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
import { useYoutubeDiscover } from "@/hooks/useYoutubeDiscover";
import { useFacebookDiscover } from "@/hooks/discovery/useFacebookDiscover";

const tabs = ["All", "For you", "Profiles", "Posts", "Reels & Videos"];

const filterSections = [
	{
		title: "Content Type",
		key: "contentType",
		type: "checkbox",
		options: [
			{ id: "feed_post", label: "Feed Post" },
			{ id: "story", label: "Story" },
			{ id: "reels_shorts", label: "Reels/Shorts" },
			{ id: "partnered", label: "Partnered" },
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
			{ id: "most_shared", label: "Most Shared" },
			{ id: "organic_reach", label: "Organic Reach" },
			{ id: "most_views", label: "Most Views" },
			{ id: "fastest_growing", label: "Fastest-Growing" },
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
	{
		title: "Monetization",
		key: "monetization",
		type: "checkbox",
		options: [
			{ id: "contains_ads", label: "Contains Ads" },
			{ id: "non_monetized", label: "Non-Monetized" },
		],
	},
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
		datePosted: "",
		monetization: [],
	});

	// Initialize search and trending hooks with mock data enabled (for now)
	const searchState = useSearch({ debounceMs: 120, useMockData: true });
	const trendingState = useTrending(selectedPlatforms || undefined, true);
	// YouTube discover hook
	const {
		profile,
		contents,
	} = useYoutubeDiscover();
	//facebook hook
	const {
		profile: facebookProfile,
		contents: facebookContents,
	} = useFacebookDiscover();

	const videoContents = contents.filter(

		(item) =>
			item.type === "playlist_video" || item.type === "video" || item.type === "subscription_video"


	);
	const youtubeFeed = videoContents.map((item) => ({
		platform: "youtube",
		id: item.id,
		title: item.title,
		description: item.description,
		image:
			item.thumbnailUrl ||
			`https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
		publishedAt: item.publishedAt,
		views: item.viewCount,
		likes: item.likeCount,
		comments: item.commentCount,
		profileImage: profile?.profileImage || "/icons/gaddr-logo-xs.svg",
		userName: profile?.name ??
			"YouTube <YoutubeIcon className='inline-block size-4 bg-blue-500 text-black' />",
		handle: profile?.channel.handle ??

			"@youtube",
		url: `https://www.youtube.com/watch?v=${item.videoId}`,
	}));
	
	const facebookFeed = facebookContents.map((item) => ({
		platform: "facebook",

		id: item.id,

		title:
			item.title ||
			item.message?.slice(0, 80) ||
			"Facebook Post",

		description:
			item.description ||
			item.message ||
			"",

		image: item.picture,

		publishedAt:item.createdAt ? new Date(item.createdAt) : "",

		views: 0,

		likes:   0,

		comments:  0,

		profileImage: facebookProfile?.profileImage,

		userName: facebookProfile?.name,

		handle: facebookProfile?.userName,

		url: item.postId
			? `https://facebook.com/${item.postId}`
			: undefined,
	}));

	const combinedFeed = [...youtubeFeed, ...facebookFeed].sort(
		(a, b) =>
			new Date(b.publishedAt).getTime() -
			new Date(a.publishedAt).getTime()
	);
	type FeedItem = {
		platform: "youtube" | "facebook";
		id: string;

		title: string;
		description: string;

		image?: string;

		publishedAt: string;

		views: number;
		likes: number;
		comments: number;

		profileImage?: string;
		userName?: string;
		handle?: string;

		url?: string;
	};
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

	// Render content based on search state
	const renderContent = () => {
		if (showSearchResults) {
			return (
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-gray-900">
							Search Results for &quot;{searchQuery}&quot;
						</h2>
						<span className="text-sm text-gray-600">
							{searchState.totalResults} results
						</span>
					</div>
					<SearchResults
						results={searchState.results}
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
					<div
						className={`grid gap-6 ${viewType === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
							}`}
					>
						{/* <ProfileCard
							profilePicSrc={cardProps.profilePicSrc}
							userName={cardProps.userName}
							userHandle={cardProps.userHandle}
							category={cardProps.category}
							postCount={cardProps.postCount}
							followerCount={cardProps.followerCount}
							followingCount={cardProps.followingCount}
							channelIcons={cardProps.channelIcons}
						></ProfileCard> */}
						{combinedFeed.map((item) => (
							<div
								key={`${item.platform}-${item.id}`}
								onClick={() => item.url && window.open(item.url, "_blank")}
								className="cursor-pointer"
							>
								<ContentFeedCard
									imageSrc={item.image}
									profilePicSrc={
										item.profileImage ??
										"/icons/gaddr-logo-xs.svg"
									}
									userName={item.userName ?? "Unknown"}
									userHandle={item.handle ?? ""}
									platformIcon={
										item.platform === "youtube" ? (
											<YoutubeRedIcon />
										) : (
											<FacebookIcon />
										)
									}
									textContent={
										<>
											<span className="font-semibold block line-clamp-1">
												{item.title?.substring(0, 34)}
											</span>

											<span className="text-sm text-muted-foreground block line-clamp-2">
												{item.description}
											</span>
										</>
									}
									date={
										item.publishedAt
											? new Date(item.publishedAt).toLocaleDateString()
											: "none"
									}
									views={item.views ?? 0}
									likes={item.likes ?? 0}
									comments={item.comments ?? 0}
								/>
							</div>
						))}
					</div>
				</TabPanel>
				<TabPanel className="space-y-6">For you</TabPanel>
				<TabPanel className="space-y-6">Profiles</TabPanel>
				<TabPanel className="space-y-6">Posts</TabPanel>
				<TabPanel className="space-y-6">Reels & Videos</TabPanel>
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
												<label key={option.id} className="flex items-center gap-3 cursor-pointer">
													<input
														type={section.type}
														name={section.type === "radio" ? section.key : undefined}
														checked={
															section.type === "radio"
																? filters[section.key] === option.id
																: (filters[section.key] as string[])?.includes(option.id)
														}
														onChange={() => handleFilterChange(section.key, option.id, section.type)}
														className="w-4 h-4 border border-black-default rounded cursor-pointer accent-black-default"
													/>
													<span className="text-gray-neutral text-sm">{option.label}</span>
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
											<label key={option.id} className="flex items-center gap-3 cursor-pointer">
												<input
													type={section.type}
													name={section.type === "radio" ? section.key : undefined}
													checked={
														section.type === "radio"
															? filters[section.key] === option.id
															: (filters[section.key] as string[])?.includes(option.id)
													}
													onChange={() => handleFilterChange(section.key, option.id, section.type)}
													className="w-4 h-4 border border-black-default rounded cursor-pointer accent-black-default"
												/>
												<span className="text-gray-neutral text-sm">{option.label}</span>
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
