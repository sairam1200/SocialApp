"use client";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { AlertCircle, Grid2x2, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

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
import { InfiniteScrollSentinel } from "@/components/ui/infinite-scroll-sentinel";
import { cn } from "@/utils/cn.util";
import ContentFeedCard from "@/components/card/ContentFeedCard";
import ProfileCard from "@/components/card/PorfileCard";
import SocialProfileCard from "@/components/card/SocialProfileCard";
import ProjectCard from "@/components/card/ProjectCard";
import JobCard from "@/components/card/JobCard";
import { platforms } from "@/constants/platforms";
import {
	ClassicSerpResult,
	ClassicSerpResults,
	ResultLayoutSkeleton,
	SearchResultInteraction,
	TrendingSection,
} from "@/components/search";
import { useSearch } from "@/hooks/useSearch";
import { useTrending } from "@/hooks/useTrending";
import { searchTypeToEntity, TrendingItem, SearchTypeTab } from "@/types/search.types";
import { useDiscoverCreators } from "@/hooks/useDiscoverCreators";
import { useDiscoverContent } from "@/hooks/useDiscoverContent";
import { useForYouFeed } from "@/hooks/useForYouFeed";
import { useSearchProjects } from "@/hooks/useSearchProjects";
import { useSearchJobs } from "@/hooks/useSearchJobs";
import { useAuthUserStore } from "@/store/auth-user.store";
import type { DiscoverContentModel, ForYouItem } from "@/types/discover.type";
import { ExternalLink, MapPin, Building2, DollarSign } from "lucide-react";
import { getContentCategory, filterByPlatform, filterByContentType, filterByDatePosted, sortByMetrics } from "@/lib/discover-filters";
import { normalizeDiscoverContent, mapProfileToProps } from "@/lib/card-helpers";
import { normalizeSearchResult } from "@/lib/card-helpers";
import Link from "next/link";
import type { JobSearchResult } from "@/services/api/job.service";
import type { ProjectSearchResult } from "@/services/api/project.service";
import type { SearchResult } from "@/types/search.types";
const tabs = ["All", "For you", "Profiles", "Posts", "Reels & Videos", "Projects", "Jobs"];

function GoogleDiscoverResult({ result }: { result: SearchResult }) {
	return (
		<SearchResultInteraction result={result}>
			<ClassicSerpResult result={result} />
		</SearchResultInteraction>
	);
}

function discoverContentResult(item: DiscoverContentModel): SearchResult {
	const handle = item.userHandle.replace(/^@/, "");
	return {
		id: item.id,
		contentStreamId: item.contentStreamId ?? undefined,
		gaddrViews: item.gaddrViews ?? undefined,
		type: "content",
		platform: item.platform || "gaddr",
		title: item.title ?? item.description ?? "Content",
		description: item.description,
		url: item.sourceUrl ?? (handle ? `/community/${handle}/${item.id}` : undefined),
		publishedAt: item.publishedAt ?? undefined,
		author: {
			name: item.userName,
			handle: item.userHandle,
			profileImage: item.userProfileImage ?? undefined,
			verified: item.verified,
		},
		media: item.imageUrl
			? { type: "image", thumbnailUrl: item.imageUrl, url: item.imageUrl }
			: undefined,
		engagement: {
			views: item.views,
			likes: item.likes,
			comments: item.comments,
		},
	};
}

function projectResult(project: ProjectSearchResult): SearchResult {
	return {
		id: String(project.id),
		type: "project",
		platform: "gaddr-jobs",
		title: project.title,
		description: project.description,
		url: `https://jobs.gaddr.com/projects/${project.id}`,
		publishedAt: project.createdAt,
		platformMetadata: { ...project },
	};
}

function jobResult(job: JobSearchResult): SearchResult {
	return {
		id: String(job.id),
		type: "job",
		platform: "gaddr-jobs",
		title: job.title,
		description: job.description,
		url: job.url,
		publishedAt: job.createdAt,
		platformMetadata: { ...job },
	};
}

function forYouResult(item: ForYouItem): SearchResult {
	const type = item.type === "content" ? "content" : item.type;
	const fallbackUrl = item.type === "project"
		? `https://jobs.gaddr.com/projects/${item.id}`
		: typeof item.meta.url === "string" && item.meta.url.trim()
			? item.meta.url
			: item.type === "content"
				? `/community/explore?q=${encodeURIComponent(item.title)}`
				: undefined;
	return {
		id: item.id,
		contentStreamId: item.contentStreamId,
		gaddrViews: item.gaddrViews,
		type,
		platform: item.platform ?? (item.type === "content" ? "gaddr" : "gaddr-jobs"),
		title: item.title,
		description: item.description,
		url: item.sourceUrl ?? fallbackUrl,
		publishedAt: item.publishedAt ?? undefined,
		media: item.imageUrl
			? { type: "image", thumbnailUrl: item.imageUrl, url: item.imageUrl }
			: undefined,
		platformMetadata: item.meta,
	};
}

function ForYouCard({ item, viewType }: { item: ForYouItem; viewType: "list" | "grid" }) {
	if (viewType === "list") {
		return <ClassicSerpResult result={forYouResult(item)} />;
	}

	if (item.type === "project") {
		const meta = item.meta;
		return (
			<Link
				href={`https://jobs.gaddr.com/projects/${item.id}`}
				className="group block h-[340px]"
				target="_blank"
				rel="noopener noreferrer"
			>
				<div className="flex h-full flex-col rounded-2xl border border-border bg-card px-5 pb-10 pt-5 text-card-foreground shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-2xl">
					<div className="flex-1">
						<div className="flex items-start justify-between gap-3 mb-3">
							<span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">Project</span>
							<span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">{meta.status}</span>
						</div>
						<h3 className="mb-2 line-clamp-2 text-[17px] font-semibold leading-6 text-card-foreground transition-colors group-hover:text-primary">
							{item.title}
						</h3>
						{item.description && (
							<p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
						)}
						<div className="mt-3 flex items-center gap-3 text-sm">
							{meta.budget && (
								<span className="text-base font-bold text-primary">
									{new Intl.NumberFormat("en-US", { style: "currency", currency: meta.currency || "USD", minimumFractionDigits: 0 }).format(parseFloat(meta.budget))}
								</span>
							)}
							{meta.timeline && <span className="text-muted-foreground">{meta.timeline}</span>}
						</div>
						{meta.skills?.length > 0 && (
							<div className="mt-3 flex flex-wrap gap-1.5">
								{meta.skills.slice(0, 4).map((skill: string) => (
									<span key={skill} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{skill}</span>
								))}
								{meta.skills.length > 4 && (
									<span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">+{meta.skills.length - 4}</span>
								)}
							</div>
						)}
					</div>
					<div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
						<span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
						{meta.projectType && <span className="capitalize">{String(meta.projectType).replace(/([A-Z])/g, " $1").trim()}</span>}
					</div>
				</div>
			</Link>
		);
	}

	if (item.type === "job") {
		const meta = item.meta;
		return (
			<a
				href={item.sourceUrl ?? "#"}
				className="group block h-full"
				target="_blank"
				rel="noopener noreferrer"
			>
				<div className="flex h-full flex-col rounded-2xl border border-border bg-card px-5 pb-10 pt-5 text-card-foreground shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-2xl">
					<div className="flex-1">
						<div className="flex items-start justify-between gap-3 mb-3">
							<span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">Job</span>
							{meta.jobType && <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{meta.jobType}</span>}
						</div>
						<h3 className="mb-1 line-clamp-2 text-[17px] font-semibold leading-6 text-card-foreground transition-colors group-hover:text-primary">
							{item.title}
						</h3>
						{meta.company && (
							<div className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
								<Building2 size={14} />
								<span>{meta.company}</span>
							</div>
						)}
						{meta.location && (
							<div className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
								<MapPin size={14} />
								<span>{meta.location}</span>
							</div>
						)}
						{(meta.salaryMin || meta.salaryMax || meta.salary) && (
							<div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary">
								<DollarSign size={14} />
								<span>{meta.salary || `${meta.salaryMin ?? '?'} - ${meta.salaryMax ?? '?'}`}</span>
							</div>
						)}
						{item.description && (
							<p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">{item.description}</p>
						)}
					</div>
					<div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
						<span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
						<div className="flex items-center gap-1">
							<span>{item.platform}</span>
							<ExternalLink size={10} />
						</div>
					</div>
				</div>
			</a>
		);
	}

	const cardProps = normalizeDiscoverContent({
		id: item.id,
		userId: "",
		userName: "",
		userHandle: "",
		userProfileImage: null,
		platform: item.platform ?? "",
		type: "post",
		title: item.title,
		description: item.description,
		imageUrl: item.imageUrl,
		publishedAt: item.publishedAt,
		sourceUrl: forYouResult(item).url ?? null,
		views: null,
		likes: null,
		comments: null,
		verified: false,
	}, 34);

	return (
		<div>
			<ContentFeedCard
				{...cardProps}
				contentId={item.id}
			/>
		</div>
	);
}
const PROJECTS_TAB_INDEX = tabs.indexOf("Projects");
const JOBS_TAB_INDEX = tabs.indexOf("Jobs");
const searchTypeTabs = ["All", "Profiles", "Contents", "Projects", "Jobs"];

function toProjectCardData(result: SearchResult): ProjectSearchResult {
	const meta = result.platformMetadata ?? {};
	return {
		id: Number(result.id), title: result.title ?? "", description: result.description,
		budget: typeof meta.budget === "string" ? meta.budget : null,
		currency: typeof meta.currency === "string" ? meta.currency : "USD",
		paymentType: typeof meta.paymentType === "string" ? meta.paymentType : "",
		timeline: typeof meta.timeline === "string" ? meta.timeline : null,
		skills: Array.isArray(meta.skills) ? meta.skills : [],
		status: typeof meta.status === "string" ? meta.status : "open",
		projectType: typeof meta.projectType === "string" ? meta.projectType : "",
		bountyAmount: typeof meta.bountyAmount === "string" ? meta.bountyAmount : null,
		trialDuration: typeof meta.trialDuration === "number" ? meta.trialDuration : null,
		hireOnCompletion: Boolean(meta.hireOnCompletion),
		createdAt: result.publishedAt ?? "", updatedAt: "",
	};
}

function toJobCardData(result: SearchResult): JobSearchResult {
	const meta = result.platformMetadata ?? {};
	return {
		id: result.id, title: result.title ?? "", companyName: typeof meta.companyName === "string" ? meta.companyName : "",
		companyInitials: typeof meta.companyInitials === "string" ? meta.companyInitials : "",
		jobType: typeof meta.jobType === "string" ? meta.jobType : "unknown",
		salaryType: typeof meta.salaryType === "string" ? meta.salaryType : null,
		currency: typeof meta.currency === "string" ? meta.currency : "USD",
		salaryMin: typeof meta.salaryMin === "number" ? meta.salaryMin : null,
		salaryMax: typeof meta.salaryMax === "number" ? meta.salaryMax : null,
		location: typeof meta.location === "string" ? meta.location : "",
		locationType: typeof meta.locationType === "string" ? meta.locationType : null,
		description: result.description, skills: Array.isArray(meta.skills) ? meta.skills : [],
		status: typeof meta.status === "string" ? meta.status : "published",
		sourceType: typeof meta.sourceType === "string" ? meta.sourceType : null,
		createdAt: result.publishedAt ?? "", updatedAt: "", url: result.url ?? "#",
	};
}

/* Redundant duplicate of ForYouCard retained temporarily for reference.
function LegacyForYouCard({ item, viewType }: { item: ForYouItem; viewType: "list" | "grid" }) {
	if (item.type === "project") {
		const meta = item.meta;
		return (
			<Link
				href={`https://jobs.gaddr.com/projects/${item.id}`}
				className="group block h-full"
				target="_blank"
				rel="noopener noreferrer"
			>
				<div className="h-full rounded-2xl border border-[#ECE8FF] bg-white p-5 flex flex-col transition-all duration-200 hover:-translate-y-1 hover:border-[#7C3AED] shadow-lg hover:shadow-2xl">
					<div className="flex-1">
						<div className="flex items-start justify-between gap-3 mb-3">
							<span className="rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-xs font-semibold">Project</span>
							<span className="rounded-full bg-green-100 text-green-800 px-2.5 py-0.5 text-xs font-semibold">{meta.status}</span>
						</div>
						<h3 className="text-[17px] font-semibold leading-6 text-[#1F1F1F] line-clamp-2 group-hover:text-[#7C3AED] transition-colors mb-2">
							{item.title}
						</h3>
						{item.description && (
							<p className="text-sm leading-6 text-[#6B7280] line-clamp-2">{item.description}</p>
						)}
						<div className="mt-3 flex items-center gap-3 text-sm">
							{meta.budget && (
								<span className="text-base font-bold text-[#7C3AED]">
									{new Intl.NumberFormat("en-US", { style: "currency", currency: meta.currency || "USD", minimumFractionDigits: 0 }).format(parseFloat(meta.budget))}
								</span>
							)}
							{meta.timeline && <span className="text-[#667085]">{meta.timeline}</span>}
						</div>
						{meta.skills?.length > 0 && (
							<div className="mt-3 flex flex-wrap gap-1.5">
								{meta.skills.slice(0, 4).map((skill: string) => (
									<span key={skill} className="rounded-full bg-[#F4F3FF] px-2.5 py-0.5 text-xs font-medium text-[#6D28D9]">{skill}</span>
								))}
								{meta.skills.length > 4 && (
									<span className="rounded-full bg-[#F8F9FC] px-2.5 py-0.5 text-xs text-[#667085]">+{meta.skills.length - 4}</span>
								)}
							</div>
						)}
					</div>
					<div className="mt-4 pt-3 border-t border-[#F0F0F0] flex items-center justify-between text-xs text-[#98A2B3]">
						<span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
						{meta.projectType && <span className="capitalize">{String(meta.projectType).replace(/([A-Z])/g, " $1").trim()}</span>}
					</div>
				</div>
			</Link>
		);
	}

	if (item.type === "job") {
		const meta = item.meta;
		return (
			<a
				href={item.sourceUrl ?? "#"}
				className="group block h-full"
				target="_blank"
				rel="noopener noreferrer"
			>
				<div className="h-full rounded-2xl border border-blue-100 bg-white p-5 flex flex-col transition-all duration-200 hover:-translate-y-1 hover:border-blue-500 shadow-lg hover:shadow-2xl">
					<div className="flex-1">
						<div className="flex items-start justify-between gap-3 mb-3">
							<span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-semibold">Job</span>
							{meta.jobType && <span className="rounded-full bg-gray-100 text-gray-700 px-2.5 py-0.5 text-xs font-medium">{meta.jobType}</span>}
						</div>
						<h3 className="text-[17px] font-semibold leading-6 text-[#1F1F1F] line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">
							{item.title}
						</h3>
						{meta.company && (
							<div className="flex items-center gap-1.5 text-sm text-[#6B7280] mb-2">
								<Building2 size={14} />
								<span>{meta.company}</span>
							</div>
						)}
						{meta.location && (
							<div className="flex items-center gap-1.5 text-sm text-[#6B7280] mb-2">
								<MapPin size={14} />
								<span>{meta.location}</span>
							</div>
						)}
						{(meta.salaryMin || meta.salaryMax || meta.salary) && (
							<div className="flex items-center gap-1.5 text-sm text-green-700 font-medium mt-2">
								<DollarSign size={14} />
								<span>{meta.salary || `${meta.salaryMin ?? '?'} - ${meta.salaryMax ?? '?'}`}</span>
							</div>
						)}
						{item.description && (
							<p className="mt-2 text-sm leading-5 text-[#6B7280] line-clamp-2">{item.description}</p>
						)}
					</div>
					<div className="mt-4 pt-3 border-t border-[#F0F0F0] flex items-center justify-between text-xs text-[#98A2B3]">
						<span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
						<div className="flex items-center gap-1">
							<span>{item.platform}</span>
							<ExternalLink size={10} />
						</div>
					</div>
				</div>
			</a>
		);
	}

	const cardProps = normalizeDiscoverContent({
		id: item.id,
		userId: "",
		userName: "",
		userHandle: "",
		userProfileImage: null,
		platform: item.platform ?? "",
		type: "post",
		title: item.title,
		description: item.description,
		imageUrl: item.imageUrl,
		publishedAt: item.publishedAt,
		sourceUrl: item.sourceUrl,
		views: null,
		likes: null,
		comments: null,
		verified: false,
	}, 34);

	return (
		<div>
			<ContentFeedCard
				{...cardProps}
				contentId={item.id}
			/>
		</div>
	);
}
*/

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
];

const listingFilterSection = {
	title: "Listings",
	key: "listingTypes",
	type: "checkbox",
	options: [
		{ id: "profiles", label: "Profiles", disabled: false },
		{ id: "projects", label: "Projects", disabled: false },
		{ id: "jobs", label: "Jobs", disabled: false },
	],
};

const DiscoveryPage = () => {
	const tSearch = useTranslations("search");
	const router = useRouter();
	const searchParams = useSearchParams();
	const queryParam = searchParams.get("q") ?? "";
	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
	const [viewType, setViewType] = useState<"list" | "grid">("grid");
	const [searchQuery, setSearchQuery] = useState("");
	const [showSearchResults, setShowSearchResults] = useState(false);
	const [searchType, setSearchType] = useState<SearchTypeTab>("all");
	const [searchPage, setSearchPage] = useState(1);
	const [activeBrowseTab, setActiveBrowseTab] = useState(0);
	const [allProjectsPage, setAllProjectsPage] = useState(1);
	const [allJobsPage, setAllJobsPage] = useState(1);
	const [filters, setFilters] = useState<Record<string, string | string[]>>({
		contentType: [],
		metrics: [],
		datePosted: "anytime",
		monetization: [],
		listingTypes: ["profiles", "projects", "jobs"],
	});

	const isProjectsBrowseTab = !showSearchResults && activeBrowseTab === PROJECTS_TAB_INDEX;
	const isJobsBrowseTab = !showSearchResults && activeBrowseTab === JOBS_TAB_INDEX;
	const isAllBrowseTab = !showSearchResults && activeBrowseTab === 0;
	const isBrowseContentTab = !isProjectsBrowseTab && !isJobsBrowseTab;
	const activeFilterSections = isAllBrowseTab
		? [...filterSections, listingFilterSection]
		: filterSections;

	const SEARCH_LIMIT = 12;

	const searchState = useSearch({
		debounceMs: 400,
		page: searchPage,
		limit: SEARCH_LIMIT,
		enabled: showSearchResults,
		platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
	});
	const allProjectsState = useSearchProjects({
		q: "",
		page: allProjectsPage,
		limit: SEARCH_LIMIT,
		enabled: isProjectsBrowseTab || isAllBrowseTab,
		allowEmpty: true,
	});
	const allJobsState = useSearchJobs({
		q: "",
		page: allJobsPage,
		limit: SEARCH_LIMIT,
		enabled: isJobsBrowseTab || isAllBrowseTab,
		allowEmpty: true,
	});
	const trendingState = useTrending(selectedPlatforms || undefined, true);
	const creatorState = useDiscoverCreators(12);

	// Pagination
	const searchTotalPages = Math.max(1, Math.ceil(searchState.totalResults / SEARCH_LIMIT));
	const activeHasNextPage = searchState.hasNextPage;
	const activeHasPreviousPage = false;

	const allProjectsTotalPages = Math.ceil(allProjectsState.totalResults / SEARCH_LIMIT);
	const allProjectsHasNextPage = allProjectsPage < allProjectsTotalPages;
	const allProjectsHasPreviousPage = allProjectsPage > 1;

	const allJobsTotalPages = Math.ceil(allJobsState.totalResults / SEARCH_LIMIT);
	const allJobsHasNextPage = allJobsPage < allJobsTotalPages;
	const allJobsHasPreviousPage = allJobsPage > 1;

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

	const { authUser } = useAuthUserStore();

	const discoverContent = useDiscoverContent();
	const forYouFeed = useForYouFeed({ enabled: !!authUser });

	const originalDiscoverItems: DiscoverContentModel[] = React.useMemo(
		() => discoverContent.data?.pages.flatMap((p) => p.contents).filter((item): item is DiscoverContentModel => !!item) ?? [],
		[discoverContent.data],
	);

	const forYouItems: ForYouItem[] = React.useMemo(
		() => forYouFeed.data?.items ?? [],
		[forYouFeed.data],
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

	const profileSearchResults = useMemo(() => {
		if (!showSearchResults || searchType !== "profiles") return [];
		return searchState.results.filter((r) => r.type === "profile");
	}, [searchState.results, searchType, showSearchResults]);

	const contentSearchResults = useMemo(() => {
		if (!showSearchResults || searchType !== "contents") return [];
		let results = searchState.results.filter(
			(r) => r.type === "content",
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

	const jobSearchResults = useMemo(() => {
		if (!showSearchResults || searchType !== "jobs") return [];
		return searchState.results.filter((r) => r.type === "job");
	}, [searchState.results, searchType, showSearchResults]);

	function renderContentFeedCard(item: DiscoverContentModel, titleLimit = 34) {
		const result = discoverContentResult(item);
		if (viewType === "list") {
			return (
				<GoogleDiscoverResult
					key={`${item.platform}-${item.id}`}
					result={result}
				/>
			);
		}

		const cardProps = normalizeDiscoverContent(item, titleLimit);
		return (
			<SearchResultInteraction key={`${item.platform}-${item.id}`} result={result}>
				<ContentFeedCard
					{...cardProps}
					contentId={item.id}
				/>
			</SearchResultInteraction>
		);
	}

	const handleSearch = useCallback(
		(query: string) => {
			if (!query.trim()) {
				setShowSearchResults(false);
				return;
			}

			if (!showSearchResults) {
				setSearchType("all");
			}

			setSearchPage(1);
			searchState.search(query);
			setShowSearchResults(true);
		},
		[searchState, showSearchResults],
	);

	useEffect(() => {
		if (queryParam && queryParam !== searchQuery) {
			setSearchQuery(queryParam);
			handleSearch(queryParam);
		}
	}, [queryParam, searchQuery, handleSearch]);

	// Reset search state when the URL query param is cleared (e.g. clicking Discover)
	useEffect(() => {
		if (!queryParam && showSearchResults) {
			setShowSearchResults(false);
			setSearchQuery("");
			setSearchPage(1);
		}
	}, [queryParam, showSearchResults]);

	useEffect(() => {
		const pageParam = searchParams.get("page");
		if (pageParam) {
			const page = parseInt(pageParam, 10);
			if (!isNaN(page) && page > 0) {
				setSearchPage(page);
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleTrendingClick = (item: TrendingItem) => {
		setSearchQuery(item.title);
		handleSearch(item.title);
		updateUrlParams({ q: item.title });
	};

	const handleFilterChange = (sectionKey: string, optionId: string, type: string) => {
		setFilters((prev) => {
			if (type === "radio") {
				return {
					...prev,
					[sectionKey]: optionId,
				};
			}

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
			return <ResultLayoutSkeleton layout={viewType} kind="profile" singleColumnCards />;
		}

		if (creatorState.isError) {
			return (
				<div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
					<AlertCircle className="h-8 w-8 text-red-500" />
					<p className="text-sm text-muted-foreground">
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
				<div className="rounded-xl border border-border bg-card px-4 py-10 text-center">
					<p className="text-sm text-muted-foreground">No creator profiles found yet.</p>
				</div>
			);
		}

		return (
			<div className="space-y-6">
				<div
					className={cn("grid", viewType === "grid" && "gap-6")}
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
								compact
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
					<span className="text-sm text-muted-foreground">
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

	const renderAllBrowseListings = () => {
		if (!isAllBrowseTab) return null;
		const listingTypes = filters.listingTypes as string[];
		const gridClassName = cn(
			"grid",
			viewType === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1",
			viewType === "grid" && "gap-6",
		);

		return (
			<div className="space-y-10 pt-10">
				{listingTypes.includes("profiles") && <section className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-foreground">Profiles</h2>
						<span className="text-sm text-muted-foreground">{creatorState.totalResults} profiles</span>
					</div>
					{creatorState.isLoading ? (
						<ResultLayoutSkeleton layout={viewType} kind="profile" count={3} singleColumnCards />
					) : creatorState.profiles.length > 0 ? (
						<div className={gridClassName}>{creatorState.profiles.slice(0, 6).map((creator) => <ProfileCard key={creator.id} {...mapProfileToProps(creator)} compact />)}</div>
					) : null}
				</section>}

				{listingTypes.includes("projects") && (
					<section className="space-y-4">
						<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-foreground">Projects</h2>
							<Button variant="link" onClick={() => setActiveBrowseTab(PROJECTS_TAB_INDEX)}>View all</Button>
						</div>
						{allProjectsState.isLoading ? <ResultLayoutSkeleton layout={viewType} kind="project" count={3} /> : allProjectsState.projects.length > 0 ? <div className={gridClassName}>{allProjectsState.projects.slice(0, 6).map((project) => viewType === "list" ? <GoogleDiscoverResult key={project.id} result={projectResult(project)} /> : <ProjectCard key={project.id} project={project} />)}</div> : null}
					</section>
				)}

				{listingTypes.includes("jobs") && (
					<section className="space-y-4">
						<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-foreground">Jobs</h2>
							<Button variant="link" onClick={() => setActiveBrowseTab(JOBS_TAB_INDEX)}>View all</Button>
						</div>
						{allJobsState.isLoading ? <ResultLayoutSkeleton layout={viewType} kind="job" count={3} /> : allJobsState.jobs.length > 0 ? <div className={gridClassName}>{allJobsState.jobs.slice(0, 6).map((job) => viewType === "list" ? <GoogleDiscoverResult key={job.id} result={jobResult(job)} /> : <JobCard key={job.id} job={job} />)}</div> : null}
					</section>
				)}
			</div>
		);
	};

	const renderContent = () => {
		if (showSearchResults) {
			const isTabFetching = searchState.isLoading;
			const isTabError = searchState.isError;
			const tabError = searchState.error;
			const activeResults = searchType === "all"
				? searchState.results
				: searchType === "profiles"
					? profileSearchResults
				: searchType === "projects"
					? projectSearchResults
					: searchType === "jobs"
						? jobSearchResults
						: contentSearchResults;

			const renderSearchResultCard = (result: SearchResult) => {
				let card: React.ReactNode = <ClassicSerpResult result={result} />;

				if (viewType === "grid" && result.type === "profile") {
					if (result.platform !== "gaddr") {
						card = <SocialProfileCard
							name={result.author?.name || result.title || "Unknown profile"}
							handle={result.author?.handle}
							avatar={result.author?.profileImage}
							platform={result.platform}
							followers={typeof result.platformMetadata?.followerCount === "number" ? result.platformMetadata.followerCount : result.engagement?.views}
							description={result.description}
							url={result.url}
						/>;
					} else {
						card = <ProfileCard {...mapProfileToProps(result.publicProfile as Parameters<typeof mapProfileToProps>[0], { id: result.author?.id ?? result.id, profileImage: result.author?.profileImage })} compact />;
					}
				} else if (viewType === "grid" && result.type === "project") {
					card = <ProjectCard project={toProjectCardData(result)} />;
				} else if (viewType === "grid" && result.type === "job") {
					card = <JobCard job={toJobCardData(result)} />;
				} else if (viewType === "grid") {
					card = <ContentFeedCard {...normalizeSearchResult(result)} contentId={result.id} />;
				}

				return (
					<SearchResultInteraction result={result}>
						{card}
					</SearchResultInteraction>
				);
			};

			const skeletonKind = searchType === "profiles"
				? "profile"
				: searchType === "projects"
					? "project"
					: searchType === "jobs"
						? "job"
						: searchType === "contents"
							? "content"
							: "mixed";
			const typedLoadingContent = (
				<ResultLayoutSkeleton layout={viewType} kind={skeletonKind} />
			);

			const activeFacetTotal = searchType === "all"
				? searchState.totalResults
				: (searchState.facets[searchTypeToEntity[searchType as keyof typeof searchTypeToEntity]] ?? 0);

			return (
				<ClassicSerpResults
					results={activeResults}
					query={searchQuery}
					totalResults={activeFacetTotal}
					page={searchPage}
					totalPages={searchTotalPages}
					hasNextPage={activeHasNextPage}
					hasPreviousPage={activeHasPreviousPage}
					isLoading={isTabFetching}
					isError={isTabError}
					error={tabError}
					onNextPage={handleNextPage}
					onPreviousPage={handlePreviousPage}
					onRetry={() => handleSearch(searchQuery)}
					renderResult={renderSearchResultCard}
					resultsClassName={viewType === "grid"
						? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
						: undefined}
					fullWidth
					onLoadMore={() => searchState.fetchNextPage()}
					isFetchingNextPage={searchState.isFetchingNextPage}
					loadingContent={typedLoadingContent}
				/>
			);
		}

		return (
			<TabPanels className="flex-1 mt-5 text-gray-neutral text-sm">
				<TabPanel className="space-y-6">
					<section className="space-y-4">
						{/* <div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-gray-900">Creators to discover</h2>
							<span className="text-sm text-gray-600">{creatorState.totalResults} profiles</span>
						</div> */}

					</section>
					{discoverContent.isLoading ? (
						<ResultLayoutSkeleton layout={viewType} kind="content" />
					) : (
					<div
						className={cn("grid", viewType === "grid" && "gap-6")}
						style={{
							gridTemplateColumns:
								viewType === "grid"
									? "repeat(auto-fit, minmax(240px, 1fr))"
									: "1fr",
							maxWidth: "100%",
						}}
					>

						{filteredDiscoverItems.map((item) => renderContentFeedCard(item, 34))}
						<InfiniteScrollSentinel
							hasMore={discoverContent.hasNextPage}
							isLoading={discoverContent.isFetchingNextPage}
							onLoadMore={() => discoverContent.fetchNextPage()}
						/>
					</div>
					)}
					{renderAllBrowseListings()}
				</TabPanel>
			<TabPanel className="space-y-6">
				{!authUser ? (
					<div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
							<h3 className="text-lg font-semibold text-foreground">Your content, all in one place</h3>
							<p className="text-sm text-muted-foreground max-w-md">
							Sign in to see personalized content, projects, and jobs based on your interests.
						</p>
						<Link href="/login">
							<Button className="cursor-pointer">Sign in</Button>
						</Link>
					</div>
				) : forYouFeed.isLoading ? (
					<ResultLayoutSkeleton layout={viewType} kind="mixed" />
				) : forYouFeed.isError ? (
					<div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
						<AlertCircle className="h-8 w-8 text-red-500" />
						<p className="text-sm text-muted-foreground">
							{forYouFeed.error?.message ?? "Unable to load personalized content."}
						</p>
						<Button variant="secondary" onClick={() => forYouFeed.refetch()}>
							Try again
						</Button>
					</div>
				) : forYouItems.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 text-center">
						<h3 className="text-lg font-semibold text-foreground mb-2">No recommendations yet</h3>
						<p className="text-muted-foreground max-w-md">
							Add some topics to your interests to get personalized content, projects, and job recommendations.
						</p>
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-foreground">Recommended for you</h2>
							<span className="text-sm text-muted-foreground">
								{forYouFeed.data?.totalCount ?? forYouItems.length} results
							</span>
						</div>
						<div
							className={cn("grid", viewType === "grid" && "gap-6")}
							style={{
								gridTemplateColumns:
									viewType === "grid"
										? "repeat(auto-fit, minmax(280px, 1fr))"
										: "1fr",
								maxWidth: "100%",
							}}
						>
							{forYouItems.map((item) => (
								<SearchResultInteraction key={`${item.type}-${item.id}`} result={forYouResult(item)}>
									<ForYouCard item={item} viewType={viewType} />
								</SearchResultInteraction>
							))}
						</div>
					</div>
				)}
			</TabPanel>
				<TabPanel className="space-y-6">{renderCreators()}</TabPanel>
				<TabPanel className="space-y-6">
					{discoverContent.isLoading ? (
						<ResultLayoutSkeleton layout={viewType} kind="content" />
					) : (
					<div
						className={cn("grid", viewType === "grid" && "gap-6")}
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
					)}
				</TabPanel>
				<TabPanel className="space-y-6">
					{discoverContent.isLoading ? (
						<ResultLayoutSkeleton layout={viewType} kind="content" />
					) : (
					<div
						className={cn("grid", viewType === "grid" && "gap-6")}
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
					)}
				</TabPanel>
				<TabPanel className="space-y-6">
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-foreground">Projects</h2>
							{!allProjectsState.isLoading && !allProjectsState.isError && (
								<span className="text-sm text-muted-foreground">
									{allProjectsState.totalResults} projects
								</span>
							)}
						</div>

						{allProjectsState.isLoading ? (
							<ResultLayoutSkeleton layout={viewType} kind="project" count={12} />
						) : allProjectsState.isError ? (
							<div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
								<AlertCircle className="h-8 w-8 text-red-500" />
								<p className="text-sm text-muted-foreground">
									{allProjectsState.error?.message ?? "Unable to load projects."}
								</p>
								<Button variant="secondary" onClick={allProjectsState.retry}>
									Try again
								</Button>
							</div>
						) : allProjectsState.projects.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12">
								<div className="rounded-full bg-muted p-4 mb-4">
									<div className="w-8 h-8 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin opacity-50"></div>
								</div>
								<h3 className="text-lg font-semibold text-foreground mb-2">No projects available yet</h3>
								<p className="text-muted-foreground text-center">Check back later for new projects</p>
							</div>
						) : (
							<div className={cn("grid", viewType === "grid" ? "grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
								{allProjectsState.projects.map((project) => (
									viewType === "list"
										? <GoogleDiscoverResult key={project.id} result={projectResult(project)} />
										: <ProjectCard key={project.id} project={project} />
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
								<span className="text-sm text-muted-foreground">
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
				<TabPanel className="space-y-6">
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-foreground">Jobs</h2>
							{!allJobsState.isLoading && !allJobsState.isError && (
								<span className="text-sm text-muted-foreground">
									{allJobsState.totalResults} jobs
								</span>
							)}
						</div>

						{allJobsState.isLoading ? (
							<ResultLayoutSkeleton layout={viewType} kind="job" count={12} />
						) : allJobsState.isError ? (
							<div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
								<AlertCircle className="h-8 w-8 text-red-500" />
								<p className="text-sm text-muted-foreground">
									{allJobsState.error?.message ?? "Unable to load jobs."}
								</p>
								<Button variant="secondary" onClick={allJobsState.retry}>
									Try again
								</Button>
							</div>
						) : allJobsState.jobs.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12">
								<div className="rounded-full bg-muted p-4 mb-4">
									<div className="w-8 h-8 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin opacity-50"></div>
								</div>
								<h3 className="text-lg font-semibold text-foreground mb-2">No jobs available yet</h3>
								<p className="text-muted-foreground text-center">Check back later for new opportunities</p>
							</div>
						) : (
							<div className={cn("grid", viewType === "grid" ? "grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
								{allJobsState.jobs.map((job) => (
									viewType === "list"
										? <GoogleDiscoverResult key={job.id} result={jobResult(job)} />
										: <JobCard key={job.id} job={job} />
								))}
							</div>
						)}

						{!allJobsState.isLoading && !allJobsState.isError && allJobsState.totalResults > 0 && (
							<div className="flex items-center justify-center gap-4 mt-8">
								<Button
									onClick={() => setAllJobsPage(allJobsPage - 1)}
									disabled={!allJobsHasPreviousPage}
									className="flex items-center gap-2"
								>
									<ChevronLeft className="w-4 h-4" />
									Previous
								</Button>
								<span className="text-sm text-muted-foreground">
									Page {allJobsPage} of {allJobsTotalPages}
								</span>
								<Button
									onClick={() => setAllJobsPage(allJobsPage + 1)}
									disabled={!allJobsHasNextPage}
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
		<div className={cn("mt-10 w-full", showSearchResults && "mx-auto max-w-[1260px] min-h-[1968px]")}>
			{isBrowseContentTab && !showSearchResults && (
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
				selectedIndex={showSearchResults ? searchTabIndex : activeBrowseTab}
		onChange={(index: number) => {
			if (showSearchResults) {
				const tabKey = searchTypeTabs[index].toLowerCase() as SearchTypeTab;
				setSearchType(tabKey);
			} else {
				const wasProjectsTab = activeBrowseTab === PROJECTS_TAB_INDEX;
				const isProjectsTab = index === PROJECTS_TAB_INDEX;
				const wasJobsTab = activeBrowseTab === JOBS_TAB_INDEX;
				const isJobsTab = index === JOBS_TAB_INDEX;
				if (wasProjectsTab || isProjectsTab) {
					setAllProjectsPage(1);
				}
				if (wasJobsTab || isJobsTab) {
					setAllJobsPage(1);
				}
				setActiveBrowseTab(index);
			}
		}}
			>
				<div className="flex w-full flex-wrap items-center gap-3 md:justify-between">
					{showSearchResults ? (
						<TabList className="flex min-w-0 w-full md:w-auto items-center gap-1 overflow-x-auto rounded-xl border border-border bg-background p-1 shadow-sm">
							{searchTypeTabs.map((tab) => (
								<Tab
									key={tab}
									className={({ selected }) =>
									`whitespace-nowrap rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer ${selected
										? "border-primary bg-accent text-accent-foreground shadow-sm"
										: "bg-transparent"
										}`
									}
								>
									{tab}
								</Tab>
							))}
						</TabList>
					) : (
						<TabList className="flex min-w-0 w-full md:w-auto items-center gap-1 overflow-x-auto rounded-xl border border-border bg-background p-1 shadow-sm">
							{tabs.map((tab) => (
								<Tab
									key={tab}
									className={({ selected }) =>
									`whitespace-nowrap rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer ${selected
										? "border-primary bg-accent text-accent-foreground shadow-sm"
										: "bg-transparent"
										}`
									}
								>
									{tab}
								</Tab>
							))}
						</TabList>
					)}
					<span className="flex w-full md:w-auto items-center justify-end gap-1 rounded-xl border border-border bg-background p-1">
						<Button
							onClick={() => setViewType("grid")}
							type="button"
							aria-label={tSearch("asGrid")}
							data-testid="results-grid-view"
							size="icon"
							className={cn(
								"cursor-pointer rounded-md border-0 shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
								viewType === "grid"
									? "bg-accent text-accent-foreground hover:bg-accent/90"
									: "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
							)}
						>
							<Grid2x2 className={cn("size-6")} />
						</Button>
						<Button
							onClick={() => setViewType("list")}
							type="button"
							aria-label={tSearch("asList")}
							data-testid="results-list-view"
							size="icon"
							className={cn(
								"cursor-pointer rounded-md border-0 shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
								viewType === "list"
									? "bg-accent text-accent-foreground hover:bg-accent/90"
									: "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
							)}
						>
							<MenuIcon className="size-5" />
						</Button>

						{isBrowseContentTab && (!showSearchResults || searchType === "contents" || searchType === "all") && (
							<div className="w-45">
								<MultiSelect onValuesChange={setSelectedPlatforms}>
											<MultiSelectTrigger className="w-full border-border bg-background text-foreground">
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

				<div className={cn("gap-6", showSearchResults ? "flex w-full" : "flex")}>
					<div className="flex-1">
						{renderContent()}
					</div>

					<div className="hidden lg:block w-72 space-y-6">
						{isBrowseContentTab && !showSearchResults && (
							<div className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
								<h3 className="mb-4 text-base font-semibold text-card-foreground">Filters</h3>
								{activeFilterSections.map((section) => (
									<div key={section.key} className="mb-6 border-b border-border pb-6 last:mb-0 last:border-0 last:pb-0">
										<h4 className="mb-3 text-sm font-medium text-card-foreground">{section.title}</h4>
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

						{isBrowseContentTab && !showSearchResults && (
							<TrendingSection
								items={trendingState.items}
								isLoading={trendingState.isLoading}
								isError={trendingState.isError}
								onItemClick={handleTrendingClick}
							/>
						)}
					</div>

					{isBrowseContentTab && !showSearchResults && (
						<div className="mt-5 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm lg:hidden">
							{activeFilterSections.map((section) => (
								<div key={section.key} className="mb-8">
									<h3 className="mb-4 text-base font-medium text-card-foreground">{section.title}</h3>
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
