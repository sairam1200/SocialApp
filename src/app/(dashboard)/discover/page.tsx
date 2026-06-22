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
import { useYoutubeDiscover } from "@/hooks/useYoutubeDiscover";
import { useFacebookDiscover } from "@/hooks/discovery/useFacebookDiscover";
import { useInstagramDiscover } from "@/hooks/discovery/useInstagramDiscover";
import { usePinterestDiscover } from "@/hooks/discovery/usePinterestDiscover";
import PinterestIcon from "@/components/svg/pinterest.svg";
import { useLinkedInDiscover } from "@/hooks/discovery/useLinkedinDiscover";
import { useProfileCardProps } from "@/hooks/useProfileCard";
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
	// Instagram hook
	const {
		profile: InstagramProfile,
		contents: InstagramContent,

	} = useInstagramDiscover();
	//pinterest hook
	const {
		profile: PinterestProfile,
		contents: PinterestContent,
	} = usePinterestDiscover();
	//linkedin hook
	const {
		profile: LinkedInProfile,
		contents: LinkedInContent,
	} = useLinkedInDiscover();

	const videoContents = contents.filter(

		(item) =>
			item.type === "playlist_video" || item.type === "video" || item.type === "subscription_video"


	);

	const youtubeFeed = videoContents.map((item) => ({
		platform: "youtube",
		isShort: item.shorts,
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
			"YouTube User",
		handle: profile?.channel.handle ??

			"",
		url: `https://www.youtube.com/watch?v=${item.videoId}`,
	}));
	const InstagramFeed = InstagramContent.map((item) => ({
		platform: "instagram",
		isReel: item.mediaType === "VIDEO",
		id: item.id,
		title:
			item.title
				?.split(" ")
				.slice(0, 2)
				.join(" ") ||
			item.caption
				?.split(" ")
				.slice(0, 2)
				.join(" ") ||
			"Untitled",
		description: item.caption,
		image:
			item.thumbnailUrl &&
				!item.thumbnailUrl.endsWith(".mp4")
				? item.thumbnailUrl
				: "/images/video-placeholder.jpg",
		publishedAt: item.timestamp ? new Date(item.timestamp) : "",
		views: item.reach ?? 0,
		likes: item.likeCount ?? 0,
		comments: item.commentsCount ?? 0,
		profileImage: InstagramProfile?.profileImage || "/icons/gaddr-logo-xs.svg",
		userName: InstagramProfile?.userName ??
			"Instagram User",
		handle: InstagramProfile?.userId ??

			"",
		url: item.permalink || item.mediaUrl,
	}));
	const facebookFeed = facebookContents.map((item) => ({
		platform: "facebook",
		isVideo: item.type === "video",
		id: item.id,

		title:
			item.title
				?.split(" ")
				.slice(0, 2)
				.join(" ") ||
			item.message
				?.split(" ")
				.slice(0, 2)
				.join(" ") ||
			"Facebook Post",

		description:
			item.message ||
			"User dont have description.",

		image: item.picture,

		publishedAt: item.createdAt ? new Date(item.createdAt) : "",

		views: item.engagement,

		likes: item.reactions || 0,

		comments: item.commentCount,

		profileImage: facebookProfile?.profileImage || "/icons/gaddr-logo-xs.svg",

		userName: facebookProfile?.name ??
			"Facebook User",

		handle: "",

		url: item.permalinkUrl,
	}));
	const PinterestFeed = PinterestContent.map((item) => ({
		platform: "pinterest",
		isVideo: false,
		id: item.id,
		title:
			item.title?.split(" ").slice(0, 2).join(" ") ||
			item.description?.split(" ").slice(0, 2).join(" ") ||
			"Untitled",
		description: item.description || item.title,
		image:
			item.imageUrl ||
			"/images/image-placeholder.jpg",
		publishedAt: item.createdAt
			? new Date(item.createdAt)
			: "",
		views: 0,
		likes: item.pinCount ?? 0,
		comments: 0,
		profileImage:
			PinterestProfile?.profileImage ||
			"/icons/gaddr-logo-xs.svg",
		userName:
			PinterestProfile?.userName ??
			"Pinterest User",
		handle: "",
		url:
			item.link ||
			`https://www.pinterest.com/pin/${item.externalId ?? item.id}/`,
	}));
	const LinkedInFeed = LinkedInContent.map((item) => ({
		platform: "linkedin",
		isVideo: false,
		id: item.id,

		title:
			item.title ||
			item.text
				?.split(" ")
				.slice(0, 4)
				.join(" ") ||
			"Untitled",

		description: item.text,

		image:
			item.author?.image ||
			LinkedInProfile?.profileImage ||
			"/icons/gaddr-logo-xs.svg",

		publishedAt: item.created
			? new Date(item.created)
			: "",

		views: item.activity?.impressions ?? 0,

		likes: item.activity?.likes ?? 0,

		comments: item.activity?.comments ?? 0,

		shares: item.activity?.shares ?? 0,

		profileImage:
			LinkedInProfile?.profileImage ||
			"/icons/gaddr-logo-xs.svg",

		userName:
			`${LinkedInProfile?.firstName ?? ""} ${LinkedInProfile?.lastName ?? ""
				}`.trim() || "LinkedIn User",

		handle:
			LinkedInProfile?.userName ||
			LinkedInProfile?.linkedInId ||
			"",

		url: item.externalId
			? `https://www.linkedin.com/feed/update/${item.externalId}`
			: "#",
	}));
	const platformFeeds = {
		youtube: youtubeFeed,
		facebook: facebookFeed,
		instagram: InstagramFeed,
		pinterest: PinterestFeed,
		linkedin: LinkedInFeed,
		/* tiktok: tiktokFeed,
		linkedin: linkedinFeed, */
	};
	const combinedFeed = Object.values(platformFeeds)
		.flat()
		.sort(
			(a, b) =>
				new Date(b.publishedAt).getTime() -
				new Date(a.publishedAt).getTime()
		);
	const filteredFeed =
		selectedPlatforms.length > 0
			? combinedFeed.filter((item) =>
				selectedPlatforms.includes(item.platform)
			)
			: combinedFeed;
	const reelsAndShortsFeed = filteredFeed.filter(
		(item) =>
			("isShort" in item && item.isShort) ||
			("isReel" in item && item.isReel) ||
			("isVideo" in item && item.isVideo)
	);
	const PostsFeed = filteredFeed.filter(
		(item) =>
			!("isShort" in item && item.isShort) &&
			!("isReel" in item && item.isReel) &&
			!("isVideo" in item && item.isVideo)
	);
	const profiles = [
		profile && {
			id: profile.id,
			profileImage: profile.profileImage,
			username: profile.userName || profile.name,
			platform: "youtube",
			followersCount: profile.followersCount,
			followingCount: profile.followingCount,
		},
		facebookProfile && {
			id: facebookProfile.id,
			profileImage: facebookProfile.profileImage,
			username: facebookProfile.name,
			platform: "facebook",
			followersCount: facebookProfile.followersCount,
			followingCount: facebookProfile.followingCount,
		},
		InstagramProfile && {
			id: InstagramProfile.id,
			profileImage: InstagramProfile.profileImage,
			username: InstagramProfile.userName,
			platform: "instagram",
			followersCount: InstagramProfile.followersCount,
			followingCount: InstagramProfile.followingCount,
		},
		PinterestProfile && {
			id: PinterestProfile.id,
			profileImage: PinterestProfile.profileImage,
			username: PinterestProfile.userName,
			platform: "pinterest",
			followersCount: PinterestProfile.followersCount,
			followingCount: PinterestProfile.followingCount,
		},
		LinkedInProfile && {
			id: LinkedInProfile.id,
			profileImage: LinkedInProfile.profileImage,
			username: LinkedInProfile.userName,
			platform: "linkedin",
			followersCount: LinkedInProfile.followersCount,
			followingCount: LinkedInProfile.followingCount,
		},
	].filter(Boolean);
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
						className="grid gap-6"
						style={{
							gridTemplateColumns:
								viewType === "grid"
									? "repeat(auto-fit, minmax(240px, 1fr))"
									: "1fr",
							maxWidth: "100%",
						}}
					>
						{profiles.filter(Boolean).map((account) => (
							<ProfileCard
								key={account.id}
								profilePicSrc={account.profileImage ?? "/icons/gaddr-logo-xs.svg"}
								userName={account.username ?? "Unknown User"}
								userHandle={`@${account.username ?? "unknown"}`}
								category={account.platform}
								postCount={0}
								followerCount={account.followersCount ?? 0}
								followingCount={account.followingCount ?? 0}
								channelIcons={[]}
							/>
						))}
						{filteredFeed.map((item) => (
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
										item.platform === "facebook" ? (
											<FacebookBlueIcon className="w-5 h-5 text-blue-600" />
										) : item.platform === "youtube" ? (
											<YoutubeRedIcon />
										) : item.platform === "instagram" ? (
											<InstagramColorIcon className="w-5 h-5 text-blue-600" />
										) : item.platform === "pinterest" ? (
											<PinterestIcon className="w-5 h-5 text-blue-600" />
										) : null
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
						{PostsFeed.map((item) => (
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
										item.platform === "facebook" ? (
											<FacebookBlueIcon className="w-5 h-5" />
										) : item.platform === "youtube" ? (
											<YoutubeRedIcon />
										) : item.platform === "instagram" ? (
											<InstagramColorIcon className="w-5 h-5" />
										) : item.platform === "pinterest" ? (
											<PinterestIcon className="w-5 h-5" />
										) : null
									}
									textContent={
										<>
											<span className="font-semibold block line-clamp-1">
												{item.title?.substring(0, 50)}
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
						{reelsAndShortsFeed.map((item) => (
							<div
								key={`${item.platform}-${item.id}`}
								onClick={() => item.url && window.open(item.url, "_blank")}
								className="cursor-pointer"
							>
								<ContentFeedCard
									imageSrc={item.image}
									profilePicSrc={
										item.profileImage ?? "/icons/gaddr-logo-xs.svg"
									}
									userName={item.userName ?? "Unknown"}
									userHandle={item.handle ?? ""}
									platformIcon={
										item.platform === "facebook" ? (
											<FacebookBlueIcon className="w-5 h-5" />
										) : item.platform === "youtube" ? (
											<YoutubeRedIcon />
										) : item.platform === "instagram" ? (
											<InstagramColorIcon className="w-5 h-5" />
										) : item.platform === "pinterest" ? (
											<PinterestIcon className="w-5 h-5" />
										) : null
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
