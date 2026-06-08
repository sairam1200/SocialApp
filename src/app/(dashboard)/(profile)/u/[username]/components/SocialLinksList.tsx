"use client";

import * as React from "react";
import CheckIcon from "@/components/svg/check-circle-gradient.svg";
import { platforms } from "@/constants/platforms";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

type Metrics = { posts: number | string; followers: string; following: string };

interface LinkedAccount {
	platformId: string;
	username: string;
	metrics: Metrics;
}

export default function SocialLinksList() {
	const linkedAccounts: LinkedAccount[] = [
		{
			platformId: "instagram",
			username: "Instagram_User_Name",
			metrics: { posts: 832, followers: "38.3K", following: "1.2K" },
		},
		{
			platformId: "youtube",
			username: "YouTube_User_Name",
			metrics: { posts: 832, followers: "38.3K", following: "1.2K" },
		},
		{
			platformId: "facebook",
			username: "Facebook_User_Name",
			metrics: { posts: 832, followers: "38.3K", following: "1.2K" },
		},
		{
			platformId: "whatsapp",
			username: "YouTube_User_Name",
			metrics: { posts: 832, followers: "38.3K", following: "1.2K" },
		},
	];

	const handleDisconnect = (platformId: string, username: string) => {
		console.log(`Disconnected ${username} from ${platformId}`);
	};

	return (
		<TabGroup>
			<TabList className="flex gap-10">
				{["Personal", "Business"].map((tab) => (
					<Tab
						key={tab}
						className={({ selected }) =>
							`px-6 py-2 text-sm font-medium rounded-full transition-colors focus:outline-none cursor-pointer ${
								selected
									? "gradient-text-primary border-b-2 gradient-border-primary"
									: "bg-white border-b-2 border-transparent text-[#313036]"
							}`
						}
					>
						{tab}
					</Tab>
				))}
			</TabList>

			<TabPanels className="mt-5">
				<TabPanel className="space-y-6">
					<div className="">
						{platforms.map((platform) => {
							const account = linkedAccounts.find((a) => a.platformId === platform.id);
							if (!account) return null;

							const Icon = platform.icon as React.ComponentType<React.SVGProps<SVGSVGElement>>;

							return (
								<section key={platform.id} className="mb-4">
									<h3 className="text-sm font-semibold mb-2">{platform.name}</h3>

									<div className="flex flex-wrap justify-end gap-3 items-center md:justify-between p-4 rounded-[12px] border border-[#E6EBE6] bg-[#FAFAFA]">
										<div className="flex items-center gap-4">
											<span className=" hidden md:flex items-center justify-center w-8 h-8 rounded-full border border-[#E6E6E6]">
												<Icon className="scale-70" />
											</span>

											<div>
												<div className="flex items-center gap-2">
													<span className="font-semibold text-[14px] text-[#1F1F1F]">@{account.username}</span>
													<CheckIcon />
												</div>

												<div className="flex items-center gap-4 text-[12px] mt-1">
													<span className="gradient-text-primary">
														Posts <span className="text-[#0D0D0D] ml-1">{account.metrics.posts}</span>
													</span>
													<span className="gradient-text-primary">
														Followers <span className="text-[#0D0D0D] ml-1">{account.metrics.followers}</span>
													</span>
													<span className="gradient-text-primary">
														Following <span className="text-[#0D0D0D] ml-1">{account.metrics.following}</span>
													</span>
												</div>
											</div>
										</div>

										<button
											type="button"
											onClick={() => handleDisconnect(platform.id, account.username)}
											className="h-8 px-4 rounded-[20px] border border-[#FFD1D1] bg-white text-[#F64028] text-[13px] font-semibold hover:bg-[#FFF3F4] transition"
										>
											Disconnect
										</button>
									</div>
								</section>
							);
						})}
					</div>
				</TabPanel>

				<TabPanel className="space-y-6">
					<div className="">Business</div>
				</TabPanel>
			</TabPanels>
		</TabGroup>
	);
}
