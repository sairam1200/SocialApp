"use client";

import { useEffect, useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Music2, RotateCcw, Scissors, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	fetchMusicSuggestions,
	formatVideoTime,
	getConvertedVideo,
	getCroppedImg,
	getTrimmedVideo,
} from "@/utils/media.utils";
import type { SoundData } from "@/types/media.types";

export interface CommunityMediaDraft {
	id: string;
	file: File;
	previewUrl: string;
	kind: "image" | "video";
	altText: string;
	duration?: number;
	width?: number;
	height?: number;
}

export interface CommunityMusicSelection {
	id: string;
	name: string;
	artist?: string;
	previewUrl?: string;
}

interface CommunityMediaEditorProps {
	draft: CommunityMediaDraft;
	onClose: () => void;
	onSave: (
	file: File,
	meta: {
		altText: string;
		duration?: number;
		width?: number;
		height?: number;
		music?: CommunityMusicSelection;
		previewUrl: string;
	},
	) => void;
}

const FILTERS = [
	{ label: "Original", brightness: 0, contrast: 0, saturation: 0 },
	{ label: "Vivid", brightness: 5, contrast: 10, saturation: 30 },
	{ label: "Soft", brightness: 8, contrast: -8, saturation: -10 },
	{ label: "Mono", brightness: 0, contrast: 12, saturation: -100 },
] as const;

const CROP_RATIOS = [
	{ label: "Free", value: undefined },
	{ label: "1:1", value: 1 },
	{ label: "4:5", value: 4 / 5 },
	{ label: "16:9", value: 16 / 9 },
] as const;

export function CommunityMediaEditor({
	draft,
	onClose,
	onSave,
}: CommunityMediaEditorProps) {
	const isImage = draft.kind === "image";
	const [tab, setTab] = useState<"adjust" | "crop" | "trim" | "music">(
		isImage ? "adjust" : "trim",
	);
	const [brightness, setBrightness] = useState(0);
	const [contrast, setContrast] = useState(0);
	const [saturation, setSaturation] = useState(0);
	const [rotation, setRotation] = useState(0);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [aspect, setAspect] = useState<number | undefined>(undefined);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
	const [duration, setDuration] = useState(draft.duration ?? 0);
	const [trimStart, setTrimStart] = useState(0);
	const [trimEnd, setTrimEnd] = useState(draft.duration ?? 0);
	const [muted, setMuted] = useState(false);
	const [convertVideo, setConvertVideo] = useState(false);
	const [musicQuery, setMusicQuery] = useState("");
	const [music, setMusic] = useState<CommunityMusicSelection | undefined>();
	const [musicResults, setMusicResults] = useState<SoundData[]>([]);
	const [processing, setProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const filterStyle = useMemo(
		() =>
			`brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%)`,
		[brightness, contrast, saturation],
	);

	useEffect(() => {
		if (isImage || musicQuery.trim().length < 2) {
			setMusicResults([]);
			return;
		}
		let cancelled = false;
		const timer = window.setTimeout(() => {
			fetchMusicSuggestions(musicQuery.trim()).then((items) => {
				if (!cancelled) setMusicResults(items);
			});
		}, 250);
		return () => {
			cancelled = true;
			window.clearTimeout(timer);
		};
	}, [isImage, musicQuery]);

	const handleSave = async () => {
		setProcessing(true);
		setError(null);
		try {
			let file = draft.file;
			if (isImage) {
				file = await getCroppedImg(draft.previewUrl, croppedAreaPixels, {
					rotation,
					brightness,
					contrast,
					saturation,
				});
			} else {
				const shouldTrim = trimStart > 0 || trimEnd < duration || muted;
				if (shouldTrim) {
					file = await getTrimmedVideo(file, trimStart, trimEnd || duration, muted);
				}
				if (convertVideo || file.type !== "video/mp4") {
					file = await getConvertedVideo(file);
				}
			}

			const previewUrl = URL.createObjectURL(file);
			onSave(file, {
				altText: draft.altText,
				duration: isImage ? undefined : Math.max(0, trimEnd - trimStart || duration),
				width: draft.width,
				height: draft.height,
				music,
				previewUrl,
			});
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Could not process this media");
		} finally {
			setProcessing(false);
		}
	};

	const chooseFilter = (value: (typeof FILTERS)[number]) => {
		setBrightness(value.brightness);
		setContrast(value.contrast);
		setSaturation(value.saturation);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" role="dialog" aria-modal="true" aria-label="Edit media">
		<div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-background shadow-2xl">
			<div className="flex items-center justify-between border-b border-border px-5 py-4">
				<div>
					<h2 className="text-base font-semibold">Edit {isImage ? "photo" : "video"}</h2>
					<p className="text-xs text-muted-foreground">Changes are processed in your browser before upload.</p>
				</div>
				<button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-muted" aria-label="Close editor">
					<X className="size-5" />
				</button>
			</div>

			<div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 md:grid-cols-[minmax(0,1fr)_19rem]">
				<div className="relative flex min-h-[18rem] items-center justify-center overflow-hidden rounded-xl bg-black">
					{isImage ? (
						<div className="relative h-full min-h-[18rem] w-full">
							{tab === "crop" && aspect ? (
								<Cropper
									image={draft.previewUrl}
									crop={crop}
									zoom={zoom}
									aspect={aspect}
									rotation={rotation}
									onCropChange={setCrop}
									onZoomChange={setZoom}
									onCropComplete={(_area, pixels) => setCroppedAreaPixels(pixels)}
									style={{ containerStyle: { filter: filterStyle } }}
								/>
							) : (
								<img src={draft.previewUrl} alt={draft.altText || "Photo preview"} className="h-full w-full object-contain" style={{ filter: filterStyle, transform: `rotate(${rotation}deg)` }} />
							)}
						</div>
					) : (
						<video src={draft.previewUrl} controls playsInline className="max-h-[28rem] w-full object-contain" muted={muted} onLoadedMetadata={(event) => { const value = event.currentTarget.duration; setDuration(value); setTrimEnd((current) => current || value); }} />
					)}
				</div>

				<div className="space-y-4">
					<div className="flex gap-1 rounded-lg bg-muted p-1">
						{(isImage ? (["adjust", "crop"] as const) : (["trim", "music"] as const)).map((item) => (
							<button key={item} type="button" onClick={() => setTab(item)} className={`flex-1 rounded-md px-2 py-1.5 text-xs capitalize ${tab === item ? "bg-background font-medium shadow-sm" : "text-muted-foreground"}`}>
								{item === "trim" ? <Scissors className="mr-1 inline size-3" /> : item === "music" ? <Music2 className="mr-1 inline size-3" /> : null}{item}
							</button>
						))}
					</div>

					{isImage && tab === "adjust" && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-2">
								{FILTERS.map((item) => <button key={item.label} type="button" onClick={() => chooseFilter(item)} className="rounded-lg border border-border px-2 py-2 text-xs hover:border-primary">{item.label}</button>)}
							</div>
							{([ ["Brightness", brightness, setBrightness], ["Contrast", contrast, setContrast], ["Saturation", saturation, setSaturation] ] as const).map(([label, value, setter]) => (
								<label key={label} className="block text-xs"><span className="mb-1 flex justify-between"><span>{label}</span><span className="text-muted-foreground">{value}</span></span><input type="range" min={-100} max={100} value={value} onChange={(event) => setter(Number(event.target.value))} className="w-full accent-primary" /></label>
							))}
							<label className="block text-xs"><span className="mb-1 flex justify-between"><span>Rotation</span><span className="text-muted-foreground">{rotation}°</span></span><input type="range" min={-180} max={180} value={rotation} onChange={(event) => setRotation(Number(event.target.value))} className="w-full accent-primary" /></label>
							<button type="button" onClick={() => { setBrightness(0); setContrast(0); setSaturation(0); setRotation(0); }} className="text-xs text-primary hover:underline"><RotateCcw className="mr-1 inline size-3" />Reset adjustments</button>
						</div>
					)}

					{isImage && tab === "crop" && (
						<div className="space-y-3"><p className="text-xs text-muted-foreground">Choose an aspect ratio, then drag the image to frame it.</p><div className="grid grid-cols-4 gap-1">{CROP_RATIOS.map((item) => <button key={item.label} type="button" onClick={() => { setAspect(item.value); setCroppedAreaPixels(null); }} className={`rounded border px-1 py-2 text-xs ${aspect === item.value ? "border-primary text-primary" : "border-border"}`}>{item.label}</button>)}</div>{aspect && <label className="block text-xs">Zoom<input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="mt-2 w-full accent-primary" /></label>}</div>
					)}

					{!isImage && tab === "trim" && (
						<div className="space-y-4"><p className="text-xs text-muted-foreground">Keep the important part of the video and normalize it to MP4 for platform compatibility.</p><label className="block text-xs">Start: {formatVideoTime(trimStart)}<input type="range" min={0} max={duration || 1} step={0.1} value={trimStart} onChange={(event) => { const value = Number(event.target.value); setTrimStart(Math.min(value, Math.max(0, trimEnd - 0.1))); }} className="mt-2 w-full accent-primary" /></label><label className="block text-xs">End: {formatVideoTime(trimEnd)}<input type="range" min={0} max={duration || 1} step={0.1} value={trimEnd} onChange={(event) => { const value = Number(event.target.value); setTrimEnd(Math.max(value, trimStart + 0.1)); }} className="mt-2 w-full accent-primary" /></label><button type="button" onClick={() => setMuted((value) => !value)} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs">{muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />} {muted ? "Muted" : "Keep audio"}</button><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={convertVideo} onChange={(event) => setConvertVideo(event.target.checked)} /> Convert to MP4 (H.264/AAC)</label></div>
					)}

					{!isImage && tab === "music" && (
						<div className="space-y-3"><p className="text-xs text-muted-foreground">Search the free iTunes preview catalog and attach a soundtrack credit to this post.</p><input value={musicQuery} onChange={(event) => setMusicQuery(event.target.value)} placeholder="Search music" className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary" />{music && <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2 text-xs"><span className="truncate">{music.name} · {music.artist}</span><button type="button" onClick={() => setMusic(undefined)} aria-label="Remove music"><X className="size-3" /></button></div>}<div className="max-h-48 space-y-1 overflow-y-auto">{musicResults.map((item) => <button key={item.id} type="button" onClick={() => setMusic({ id: item.id, name: item.name, artist: item.subtitle, previewUrl: item.previewUrl })} className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left text-xs hover:border-primary"><span className="truncate"><span className="font-medium">{item.name}</span><span className="ml-1 text-muted-foreground">{item.subtitle}</span></span>{item.previewUrl && <audio controls src={item.previewUrl} className="h-6 w-24" onClick={(event) => event.stopPropagation()} />}</button>)}</div></div>
					)}
				</div>
			</div>

			{error && <p className="border-t border-destructive/20 bg-destructive/10 px-5 py-3 text-xs text-destructive">{error}</p>}
			<div className="flex justify-end gap-2 border-t border-border px-5 py-4"><Button type="button" variant="secondary" label="Cancel" onClick={onClose} /><Button type="button" label={processing ? "Processing…" : "Save changes"} loading={processing} onClick={handleSave} /></div>
		</div>
		</div>
	);
}
