"use client";

import { Input } from "@/components/ui/input";
import SearchIcon from "@/components/svg/search.svg";
import MicIcon from "@/components/svg/mic.svg";
import ImageIcon from "@/components/svg/image.svg";
import { useState } from "react";

export function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
	const [value, setValue] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (value.trim()) onSearch(value.trim());
	};
	return (
		<form onSubmit={handleSubmit} className="w-full md:max-w-[654px] z-1">
			{/* Gradient border wrapper */}
			<div className="p-0.5 rounded-full bg-[linear-gradient(132deg,#6400BF_37.13%,#0F13B9_80.11%)]">
				{/* Inner background */}
				<div className="flex items-center gap-2 bg-[#FAFAFA] rounded-full h-12 md:h-[60px] px-4">
					<div className="w-6 h-6 flex items-center justify-center shrink-0">
						<SearchIcon className="scale-75 text-[#595959]" />
					</div>

					{/* INPUTS: mobile + desktop */}
					{/* Mobile */}
					<div className="w-full">
						<Input
							value={value}
							onChange={(e) => setValue(e.target.value)}
							placeholder="Search profiles, posts, reels, and more across the social universe..."
							className="flex-1 min-w-0 bg-transparent border-0 rounded-full shadow-none
                            text-base font-normal placeholder:text-input focus-visible:ring-0 focus-visible:ring-offset-0"
						/>
					</div>

					{/* Right icons */}
					<div className="flex items-center gap-4 pr-2">
						<MicIcon className="cursor-pointer" />
						<ImageIcon className="cursor-pointer" />
					</div>
				</div>
			</div>
		</form>
	);
}
