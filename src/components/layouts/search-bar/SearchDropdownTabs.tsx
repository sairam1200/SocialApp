import React from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import HistoryIcon from "@/components/svg/history-icon.svg";
import { Button } from "@/components/ui/button";

const searchTabs = ["Quick", "Inspiration", "Trending", "By Category"];
const recentSearches = ["Social media marketing tips", "Content creation tools"];

const hotTopics = [
	"Sustainable Brands",
	"Profit Margins",
	"Customer-Generated Content",
	"TikTok Shop",
	"Instagram Shops",
	"Predictive Trends",
];

const nicheTopics = [
	"Captions for Travel Reels",
	"AI-Recommended Travel Itineraries",
	"Trending Destinations 2024",
	"Wanderlust Spots",
];

const inspirations = [
	"👗 Style & Aesthetics",
	"📸 Photo Magic",
	"💡Life Hacks",
	"🎶 Mood Music",
	"🐾 Nature & Wildlife",
	"🎨 Creative Sparks",
	"🏡 Cozy Corners",
	"👟 Wellness & Energy",
	"🍲 Foodie Finds",
	"🌱 Green Living",
	"🚀 Future Visions",
	"🌍 Wanderlust",
	"✈️ Dream Destinations",
	"💎 Hidden Gems",
	"🧘 Mindful Moments",
	"🏔️ Adventure Awaits",
	"🪩 Everyday Aesthetics",
];

function SearchDropdownTabs() {
	return (
		<TabGroup>
			<TabList className="flex gap-3 md:gap-5 overflow-x-auto">
				{searchTabs.map((tab) => (
					<Tab
						key={tab}
						className={({ selected }) =>
							`px-2 sm:px-5 py-1 text-sm transition-colors text-nowrap focus:outline-none cursor-pointer] border-b-2 cursor-pointer ${
								selected
									? "gradient-border-primary gradient-text-primary font-semibold"
									: "bg-white border-transparent text-[#0D0D0D]"
							}`
						}
					>
						{tab}
					</Tab>
				))}
			</TabList>

			<TabPanels className="mt-5 text-gray-neutral text-sm">
				<TabPanel className="space-y-6">
					<div>
						{/* Recent Searches */}
						<h3 className="font-semibold mb-3">Recent Searches</h3>
						<div className="flex flex-wrap gap-3 mb-6">
							{recentSearches?.map((s) => (
								<Button
									key={s}
									size="sm"
									className="flex items-center gap-2 bg-[#FAFAFA] text-sm shadow-none text-gray-neutral font-normal flex-wrap"
								>
									<HistoryIcon />
									{s}
								</Button>
							))}
						</div>

						<hr className="my-4" />

						{/* What's Hot */}
						<h3 className="font-semibold mb-3">What&apos;s Hot Right Now</h3>
						<div className="flex flex-wrap gap-3 mb-6">
							{hotTopics.map((t) => (
								<Button
									key={t}
									size="sm"
									className="flex items-center gap-2 bg-[#FAFAFA] text-sm shadow-none text-gray-neutral font-normal"
								>
									{t}
								</Button>
							))}
						</div>

						<h3 className="font-semibold mb-3">Your Niche&apos;s Most Talked-About Topics</h3>
						<div className="flex flex-wrap gap-3">
							{nicheTopics.map((t) => (
								<Button
									key={t}
									size="sm"
									className="flex items-center gap-2 bg-[#FAFAFA] text-sm shadow-none text-gray-neutral font-normal"
								>
									{t}
								</Button>
							))}
						</div>
					</div>
				</TabPanel>

				<TabPanel className="space-y-6">
					<h3 className="font-semibold mb-3">Inspiration for you</h3>
					<div className="flex flex-wrap gap-3 mb-6">
						{inspirations?.map((inspiration) => (
							<Button
								key={inspiration}
								size="sm"
								className="flex items-center gap-2 bg-[#FAFAFA] text-sm shadow-none text-gray-neutral font-normal"
							>
								{inspiration}
							</Button>
						))}
					</div>
				</TabPanel>
				<TabPanel className="space-y-6">
					<h3 className="font-semibold mb-3">Trending categories</h3>
					<div className="flex flex-wrap gap-3 mb-6">
						{inspirations?.map((inspiration) => (
							<Button
								key={inspiration}
								size="sm"
								className="flex items-center gap-2 bg-[#FAFAFA] text-sm shadow-none text-gray-neutral font-normal"
							>
								{inspiration}
							</Button>
						))}
					</div>
				</TabPanel>
				<TabPanel className="space-y-6">
					<h3 className="font-semibold mb-3">Browse by all categories </h3>
					<div className="flex flex-wrap gap-3 mb-6">
						{inspirations?.map((inspiration) => (
							<Button
								key={inspiration}
								size="sm"
								className="flex items-center gap-2 bg-[#FAFAFA] text-sm shadow-none text-gray-neutral font-normal"
							>
								{inspiration}
							</Button>
						))}
					</div>
				</TabPanel>
			</TabPanels>
		</TabGroup>
	);
}

export default SearchDropdownTabs;
