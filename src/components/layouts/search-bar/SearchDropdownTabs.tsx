import React from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import SearchIcon from "@/components/svg/search.svg";
import PersonIcon from "@/components/svg/person.svg";
import { GlobalSearchSuggestion } from "@/types/search.types";

const searchTabs = ["Profiles & Contents", "Inspiration", "Trending", "By Category"];

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

interface SearchDropdownTabsProps {
	suggestions: GlobalSearchSuggestion[];
	isLoading: boolean;
	showSuggestions: boolean;
	onSuggestionClick: (suggestion: GlobalSearchSuggestion) => void;
}

function SearchDropdownTabs({
	suggestions,
	isLoading,
	showSuggestions,
	onSuggestionClick,
}: SearchDropdownTabsProps) {
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
						{!showSuggestions && (
							<p className="py-6 text-center text-gray-neutral">Type at least 3 characters to search.</p>
						)}
						{showSuggestions && isLoading && (
							<div className="flex items-center justify-center gap-2 py-6">
								<div className="h-4 w-4 border-2 border-gray-neutral border-t-transparent rounded-full animate-spin"></div> Searching...
							</div>
						)}
						{showSuggestions && !isLoading && suggestions.length === 0 && (
							<p className="py-6 text-center text-gray-neutral">
								No matching profiles or content found.
							</p>
						)}
						{showSuggestions && !isLoading && suggestions.map((suggestion) => (
							<button
								key={`${suggestion.type}-${suggestion.id}`}
								type="button"
								onClick={() => onSuggestionClick(suggestion)}
								className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-[#FAFAFA]"
							>
						{suggestion.type === "user"
								? <PersonIcon className="h-5 w-5 shrink-0" />
								: <SearchIcon className="h-5 w-5 shrink-0" />}
								<span className="min-w-0">
									<span className="block truncate font-medium text-[#0D0D0D]">{suggestion.label}</span>
									<span className="block truncate text-xs text-gray-neutral">
										{suggestion.type === "user"
											? suggestion.userName && `@${suggestion.userName}`
											: suggestion.type === "project"
											? "Project"
											: suggestion.creatorName || "Content"}
									</span>
								</span>
							</button>
						))}
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
