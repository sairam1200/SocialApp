import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { Mic, Search } from "lucide-react";

export function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
	const [value, setValue] = useState("");
	const handleVoiceResult = useCallback((transcript: string) => {
		setValue(transcript);
	}, []);
	const voiceSearch = useVoiceSearch(handleVoiceResult);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (value.trim()) onSearch(value.trim());
	};
	return (
		<form onSubmit={handleSubmit} className="w-full md:max-w-[654px] z-1">
			{/* Gradient border wrapper */}
			<div className="gradient-bg-primary rounded-full p-0.5 transition-all hover:-translate-y-0.5 hover:brightness-105 hover:shadow-lg hover:shadow-primary/25 focus-within:shadow-lg focus-within:shadow-primary/30">
				{/* Inner background */}
				<div className="flex items-center gap-2 bg-card text-card-foreground rounded-full h-12 md:h-[60px] px-4">
					<button type="submit" aria-label="Search" className="group flex size-8 shrink-0 items-center justify-center rounded-full bg-primary p-0 text-primary-foreground transition-all hover:scale-105 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
						<Search className="h-3.5 w-3.5 stroke-[2.5] text-primary-foreground transition-colors group-hover:text-accent-foreground" aria-hidden="true" />
					</button>

					{/* INPUTS: mobile + desktop */}
					{/* Mobile */}
					<div className="w-full">
						<Input
							value={value}
							onChange={(e) => setValue(e.target.value)}
							placeholder="Search profiles, posts, reels, and more across the social universe..."
							className="flex-1 min-w-0 bg-transparent border-0 rounded-full shadow-none
							text-base font-normal placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						/>
					</div>

					{/* Right icons */}
					<div className="flex items-center gap-2 pr-1">
						<button type="button" onClick={voiceSearch.start} aria-label="Search by voice" className="group flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/85 p-0 text-primary transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
							<Mic className="h-3.5 w-3.5 shrink-0 stroke-[2.5] text-primary group-hover:text-accent-foreground" aria-hidden="true" />
						</button>
					</div>
				</div>
			</div>
			{voiceSearch.error && <p className="mt-2 px-4 text-sm text-primary-foreground">{voiceSearch.error}</p>}
		</form>
	);
}
