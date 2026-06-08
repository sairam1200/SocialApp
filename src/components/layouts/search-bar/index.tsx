"use client";

import React, { useState } from "react";
import ImageIcon from "@/components/svg/image.svg";
import MicIcon from "@/components/svg/mic.svg";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import SearchDropdownTabs from "./SearchDropdownTabs";
import { X } from "lucide-react";
import { SearchInput } from "@/components/search";


const aiSuggestions = [
	{ label: "Hidden Gems in Turkey", gradient: "from-[#437BD7] to-[#5629BD]" },
	{ label: "Smart Travel", gradient: "from-[#3E34EF] to-[#E8177E]" },
	{ label: "Monetize your Instagram", gradient: "from-[#D83D8C] to-[#FF9C58]" },
	{ label: "Beach Getaways", gradient: "from-[#DC60EA] to-[#F94861]" },
	{ label: "AI-Optimize your Business", gradient: "from-[#A113C4] to-[#76C9ED]" },
];
const related = ["Kittens", "Funny dogs", "Exotic animals", "Marine life", "Wildlife", "Horses", "Dangerous animals"];

const SearchBar = () => {
	const searchParams = useSearchParams();
	const searchQuery = searchParams.get("q") ?? "";
	const pathname = usePathname();
	const router = useRouter();
	const [query, setQuery] = useState(searchQuery);
	const [openDropdown, setOpenDropdown] = useState(false);

	const handleSearch = (searchQuery: string) => {
		if (!searchQuery.trim()) return;
		router.push(`/discover?q=${encodeURIComponent(searchQuery)}`);
		setOpenDropdown(false);
	};

	const handleSuggestionClick = (label: string) => {
		setQuery(label);
	};

	const isTyping = query.trim().length > 0;

	return (
		<div>
			<Popover open={openDropdown} onOpenChange={setOpenDropdown}>
				<PopoverTrigger asChild>
					<div className="relative mb-5 sm:mb-8">
						<SearchInput
							value={query}
							onChange={setQuery}
							onSearch={handleSearch}
							placeholder="Search All Socials with AI-Powered Gaddr"
							className="w-full"
						/>
						<div className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-2">
							<ImageIcon
								className="cursor-pointer"
								onClick={(e: React.MouseEvent<SVGSVGElement>) => {
									e.stopPropagation();
								}}
							/>
							<MicIcon
								className="cursor-pointer"
								onClick={(e: React.MouseEvent<SVGSVGElement>) => {
									e.stopPropagation();
								}}
							/>
						</div>
					</div>
				</PopoverTrigger>
				<PopoverContent
					side="bottom"
					align="start"
					className="w-(--radix-popover-trigger-width) max-h-[60vh] p-6 md:px-10 border-primary rounded-lg border-[0.5px] shadow-[0px_8px_9px_0px_#6136FF40] overflow-y-auto"
				>
					<button onClick={() => setOpenDropdown(false)} className="absolute right-5 top-3 scale-80 cursor-pointer">
						<X className="scale-80" />
					</button>
					<SearchDropdownTabs />
				</PopoverContent>
			</Popover>

			{/* AI Suggestions */}
			{pathname === "/discover" && !isTyping && (
				<div className="flex flex-wrap items-center gap-3">
					<span className="font-semibold text-sm">AI Suggestions : </span>
					{aiSuggestions.map((item) => (
						<Button
							key={item.label}
							onClick={() => handleSuggestionClick(item.label)}
							className={`bg-linear-to-r ${item.gradient} whitespace-nowrap transition`}
						>
							{item.label}
						</Button>
					))}
				</div>
			)}

			{/* Related search suggestions */}
			{pathname === "/discover" && isTyping && (
				<div className="flex flex-wrap items-center gap-3">
					<span className="font-semibold text-sm">Related : </span>
					{related?.map((item) => (
						<Button
							key={item}
							onClick={() => handleSuggestionClick(item)}
							className={`whitespace-nowrap transition bg-white border border-[#A1A1A1] shadow-none text-black-default`}
						>
							{item}
						</Button>
					))}
				</div>
			)}
		</div>
	);
};

export default SearchBar;
