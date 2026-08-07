"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { UserProfileType } from "@/types/account/profile.type";
import { apiClient } from "@/services/apiClient.service";
import { UnifiedResultCard } from "@/components/search/UnifiedResultCard";
import { SearchResultInteraction } from "@/components/search/SearchResultInteraction";
import { ResultLayoutSkeleton } from "@/components/search/ResultLayoutSkeleton";
import { Button } from "@/components/ui/button";
import CollectionFolders from "@/components/bookmarks/CollectionFolders";
import SocialLinksList from "./SocialLinksList";

function MyPostsTab({ username }: { username: string }) {
	const query = useInfiniteQuery({
		queryKey: ["profile-content-streams", username],
		queryFn: ({ pageParam }) =>
			apiClient.Search.getProfileContentStreams(username, pageParam, 24),
		initialPageParam: 1,
		getNextPageParam: (page) => (page.hasMore ? page.page + 1 : undefined),
		enabled: Boolean(username),
	});
	const contents = query.data?.pages.flatMap((page) => page.items) ?? [];

	if (query.isLoading) {
		return <ResultLayoutSkeleton layout="grid" kind="content" />;
	}

	if (query.isError) {
		return (
			<div className="rounded-xl border border-border bg-muted/40 px-4 py-10 text-center">
				<p className="text-sm text-muted-foreground">Unable to load this profile&apos;s posts.</p>
				<Button className="mt-4" variant="secondary" onClick={() => void query.refetch()}>
					Try again
				</Button>
			</div>
		);
	}

	if (contents.length === 0) {
		return (
			<div className="rounded-xl border border-border bg-muted/40 px-4 py-10 text-center">
				<p className="text-sm text-muted-foreground">No posts have been published or imported yet.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
				{contents.map((item) => (
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
						<UnifiedResultCard item={item} layout="grid" />
					</SearchResultInteraction>
				))}
			</div>
			{query.hasNextPage && (
				<div className="flex justify-center">
					<Button
						type="button"
						variant="secondary"
						disabled={query.isFetchingNextPage}
						onClick={() => void query.fetchNextPage()}
					>
						{query.isFetchingNextPage ? "Loading…" : "Load more"}
					</Button>
				</div>
			)}
		</div>
	);
}

export default function ProfileTabs({
	user,
	isOwner,
	username,
}: {
	user: UserProfileType | undefined;
	isOwner?: boolean;
	username?: string;
}) {
	const t = useTranslations("profile");
	const tabs = [t("myPosts")];
	if (isOwner) tabs.push(t("collections"), t("links"));

	return (
		<TabGroup>
			<TabList className="flex justify-center gap-3 border-b border-border md:gap-10">
				{tabs.map((tab) => (
					<Tab
						key={tab}
						className={({ selected }) =>
							`cursor-pointer text-nowrap border-b-3 px-3 py-1 text-sm font-semibold text-foreground transition-colors focus:outline-none sm:px-5 ${selected ? "gradient-border-primary" : "border-transparent bg-card"}`
						}
					>
						{tab}
					</Tab>
				))}
			</TabList>

			<TabPanels className="mt-5">
				<TabPanel className="space-y-6">
					<MyPostsTab username={username ?? ""} />
				</TabPanel>
				{isOwner && (
					<>
						<TabPanel className="space-y-6">
							<CollectionFolders username={username ?? ""} />
						</TabPanel>
						<TabPanel className="space-y-6">
							<SocialLinksList accounts={user?.linkedAccounts ?? []} />
						</TabPanel>
					</>
				)}
			</TabPanels>
		</TabGroup>
	);
}
