import DialogContainer from "../dialog/DialogContainer";
import { Search, MapPin, Play, X, Pause } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { LocationData, SoundData } from "@/types/media.types";
import { fetchLocationSuggestions, fetchMusicSuggestions } from "@/utils/media.utils";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchModalProps {
	isOpen: boolean;
	onClose: () => void;
	type: "location" | "sound";
	onSelect: (data: LocationData | SoundData) => void;
}
export function SearchSelectionModal({ isOpen, onClose, type, onSelect }: SearchModalProps) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Array<LocationData | SoundData>>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [playingId, setPlayingId] = useState<string | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const debouncedQuery = useDebounce(query, 300);

	useEffect(() => {
		if (!debouncedQuery.trim()) {
			setResults([]);
			return;
		}

		const loadSearchData = async () => {
			setIsLoading(true);
			try {
				const suggestions =
					type === "location"
						? await fetchLocationSuggestions(debouncedQuery)
						: await fetchMusicSuggestions(debouncedQuery);

				setResults(suggestions);
			} catch {
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		};

		loadSearchData();
	}, [debouncedQuery, type]);

	const handleSelectItem = (item: LocationData | SoundData) => {
		onSelect(item);
		onClose();
		setQuery("");
	};

	const stopAudio = () => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current = null;
		}
		setPlayingId(null);
	};

	const handleTogglePlay = (e: React.MouseEvent, item: SoundData) => {
		e.stopPropagation();

		if (playingId === item.id) {
			stopAudio();
			return;
		}
		stopAudio();
		if (!item.previewUrl) {
			return;
		}

		try {
			const audio = new Audio(item.previewUrl);
			audio.preload = "auto";
			audio.crossOrigin = "anonymous";

			audioRef.current = audio;
			setPlayingId(item.id);
			audio.play().catch(() => {
				setPlayingId(null);
			});

			audio.onended = () => setPlayingId(null);
			audio.onerror = () => {
				setPlayingId(null);
				audioRef.current = null;
			};
		} catch {
			setPlayingId(null);
			audioRef.current = null;
		}
	};

	useEffect(() => {
		return () => {
			stopAudio();
		};
	}, []);

	return (
		<DialogContainer
			open={isOpen}
			onClose={onClose}
			title={type === "location" ? "Add Location" : "Add Sound"}
			maxWidthClass="max-w-md"
		>
			<div className="">
				{/* Search Input */}
				<div className="relative mb-2">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-neutral size-4" />
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={type === "location" ? "Search locations" : "Search sounds"}
						className="pl-10"
						autoFocus
					/>
					{query && (
						<X
							className="absolute right-3 top-1/2 -translate-y-1/2 size-4 cursor-pointer"
							onClick={() => setQuery("")}
						/>
					)}
				</div>

				<div className="max-h-[400px] overflow-y-auto">
					<p className="text-xs font-bold text-gray-neutral uppercase tracking-wider">Suggested</p>

					{isLoading ? (
						<div className="p-4 text-center text-sm text-gray-neutral">Searching...</div>
					) : (
						results.map((item) => (
							<button
								key={item.id}
								onClick={() => handleSelectItem(item)}
								className="w-full flex items-center justify-between gap-3 p-3 hover:bg-gray-50 transition-colors rounded-lg group cursor-pointer"
							>
								<div className="flex items-center gap-3">
									{type === "location" ? (
										<div>
											<MapPin className="size-4" />
										</div>
									) : (
										<div onClick={(e) => handleTogglePlay(e, item as SoundData)}>
											{playingId === item.id ? (
												<Pause className="size-4 fill-black-default" />
											) : (
												<Play className="size-4 fill-black-default" />
											)}
										</div>
									)}

									<div className="text-left">
										<p className="text-sm font-medium text-black-default">{item.name}</p>
										<p className="text-xs text-gray-neutral line-clamp-1">{item.subtitle}</p>
									</div>
								</div>

								{type === "sound" && "duration" in item && (
									<span className="text-xs text-gray-neutral">{item.duration}</span>
								)}
							</button>
						))
					)}

					{!isLoading && query && results.length === 0 && (
						<div className="p-8 text-center text-sm text-gray-neutral">No results found</div>
					)}
				</div>
			</div>
		</DialogContainer>
	);
}
