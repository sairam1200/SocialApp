"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import SocialLinksList from "./SocialLinksList";
import { UserProfileType } from "@/types/account/profile.type";
import { useYoutubeDiscover } from "@/hooks/useYoutubeDiscover";
import { useConnectedPlatforms } from "@/hooks/useConnectedPlatforms";
import Image from "next/image";

function MyPostsTab() {
	const { connectedPlatforms } = useConnectedPlatforms();
	const { contents, loading } = useYoutubeDiscover({ enabled: connectedPlatforms.includes('youtube') });
	const videoContents = contents.filter(

		(item) =>
			 item.type === "uploaded_video" 


	);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
			</div>
		);
	}

	if (contents.length === 0) {
		return (
			<div className="rounded-xl border border-[#E6E6E6] bg-[#FAFAFA] px-4 py-10 text-center">
				<p className="text-sm text-[#595959]">No posts yet. Connect a social account to import your content.</p>
			</div>
		);
	}

	return (
		<div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
			{videoContents.map((item) => (
				<div
					key={`${item.type}-${item.id}`}
					className="flex flex-col rounded-xl border border-[#E6E6E6] bg-white overflow-hidden hover:shadow-md transition-shadow"
				>
					{item.videoId && (
						<div className="relative w-full h-40 bg-gray-100">
							<Image src={`https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`||item.thumbnailUrl} alt={item.title} fill className="object-cover" />
						</div>
					)}
					<div className="p-4 flex flex-col flex-1">
						<span className="text-xs uppercase tracking-wide text-gray-400">{item.type.replace(/_/g, " ")}</span>
						<h4 className="font-semibold text-sm mt-1 line-clamp-2">{item.title}</h4>
						{item.description && (
							<p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
						)}
						<div className="flex items-center gap-3 mt-auto pt-3 text-xs text-gray-400">
							{item.publishedAt && <span>{new Date(item.publishedAt).toLocaleDateString()}</span>}
							{item.viewCount !== undefined && item.viewCount > 0 && <span>{item.viewCount.toLocaleString()} views</span>}
							{item.likeCount !== undefined && item.likeCount > 0 && <span>{item.likeCount.toLocaleString()} likes</span>}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

export default function ProfileTabs({ user }: { user: UserProfileType | undefined }) {
	const tabs = ["My Posts", "Collections"];

	if (!user?.isGuestView) {
		tabs.push("Links");
	}

	return (
		<TabGroup>
			<TabList className="flex gap-3 md-gap-10 justify-center border-b border-[#E6E6E6]">
				{tabs.map((tab) => (
					<Tab
						key={tab}
						className={({ selected }) =>
							`px-3 sm:px-5 py-1 text-sm font-semibold transition-colors focus:outline-none cursor-pointer text-[#0D0D0D] text-nowrap border-b-3 ${selected ? "gradient-border-primary" : "bg-white border-transparent"
							}`
						}
					>
						{tab}
					</Tab>
				))}
			</TabList>

			<TabPanels className="mt-5">
				<TabPanel className="space-y-6">
					<MyPostsTab />
				</TabPanel>

				<TabPanel className="space-y-6">
					<div className="">Collections</div>
				</TabPanel>

				{!user?.isGuestView && (
					<TabPanel className="space-y-6">
						<div className="">
							<SocialLinksList />
						</div>
					</TabPanel>
				)}
			</TabPanels>
		</TabGroup>
	);
}
