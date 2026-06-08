"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import SocialLinksList from "./SocialLinksList";
import { UserProfileType } from "@/types/account/profile.type";

export default function ProfileTabs({ user }: { user: UserProfileType | undefined }) {
	const tabs = ["My Posts", "Collections"];

	// Only show Links when NOT guest view
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
					<div className="">My Posts</div>
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
