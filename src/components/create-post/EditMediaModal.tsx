import React, { useEffect, useMemo, useRef, useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Button } from "../ui/button";
import DialogContainer from "../dialog/DialogContainer";
import Image from "next/image";
import {
	ZoomIn,
	ZoomOut,
	Volume2,
	Play,
	Square,
	RectangleHorizontal,
	RectangleVertical,
	VolumeX,
	Pause,
} from "lucide-react";
import { FormikProps } from "formik";
import { cn } from "@/utils/cn.util";
import { CreatePostFormValues, ImageEditState, MediaFile } from "@/types/media.types";
import MediaUpload from "./MediaUpload";
import { AdjustmentSlider } from "./AdjustmentSlider";
import Cropper from "react-easy-crop";
import { formatVideoTime, getConvertedVideo, getCroppedImg, getTrimmedVideo } from "@/utils/media.utils";
import toast from "react-hot-toast";
import { VideoTrimmer } from "./VideoTrimmer";
import { PlatformId } from "@/constants/platforms";

const ADJUSTMENT_CONTROLS = [
	{ id: "rotation", label: "Rotation", min: -180, max: 180 },
	{ id: "brightness", label: "Brightness", min: -100, max: 100 },
	{ id: "contrast", label: "Contrast", min: -100, max: 100 },
	{ id: "saturation", label: "Saturation", min: -100, max: 100 },
] as const;

const CROP_RATIOS = [
	{ id: "1:1", label: "1:1", value: 1 / 1, icon: Square },
	{ id: "9:16", label: "9:16", value: 9 / 16, icon: RectangleVertical },
	{ id: "16:9", label: "16:9", value: 16 / 9, icon: RectangleHorizontal },
	{ id: "4:5", label: "4:5", value: 4 / 5, icon: RectangleVertical },
];

type EditMediaModalProps = {
	close: () => void;
	isEditMediaModal: { open: boolean; activeMedia: MediaFile | null };
	formik: FormikProps<CreatePostFormValues>;
	overrideId?: PlatformId;
};

function EditMediaModal({ isEditMediaModal, close, formik, overrideId }: EditMediaModalProps) {
	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [activeMedia, setActiveMedia] = useState(isEditMediaModal.activeMedia);
	const isImage = activeMedia?.type === "image";
	const [allEdits, setAllEdits] = useState<Record<string, ImageEditState>>({});
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [isProcessing, setIsProcessing] = useState(false);
	const [convertForPlatforms, setConvertForPlatforms] = useState(false);
	const fieldPath = overrideId ? `platformOverrides.${overrideId}.mediaFiles` : "baseContent.mediaFiles";
	const mediaFiles =
		(overrideId && formik.values.platformOverrides?.[overrideId]?.mediaFiles) || formik.values.baseContent.mediaFiles;

	// Default state for an image that hasn't been edited yet
	const defaultEditState: ImageEditState = useMemo(
		() => ({
			adjustments: { rotation: 0, brightness: 0, contrast: 0, saturation: 0 },
			crop: { x: 0, y: 0 },
			zoom: 1,
			aspect: null,
			croppedAreaPixels: null,
			muted: false,
			trimStart: null,
			trimEnd: null,
			duration: null,
		}),
		[]
	);

	const currentEdit = activeMedia ? allEdits[activeMedia.id] || defaultEditState : defaultEditState;

	const videoDuration = currentEdit.duration || 0;

	const start = currentEdit.trimStart ?? 0;
	const end = currentEdit.trimEnd ?? videoDuration;

	useEffect(() => {
		if (isEditMediaModal.open) {
			const initialEdits: Record<string, ImageEditState> = {};
			mediaFiles.forEach((file) => {
				initialEdits[file.id] = defaultEditState;
			});
			setAllEdits(initialEdits);
			setActiveMedia(isEditMediaModal.activeMedia);
		}
	}, [isEditMediaModal.open, mediaFiles, defaultEditState, isEditMediaModal.activeMedia]);

	const updateActiveEdit = (updates: Partial<ImageEditState>) => {
		if (!activeMedia) return;
		setAllEdits((prev) => ({
			...prev,
			[activeMedia.id]: { ...prev[activeMedia.id], ...updates },
		}));
	};

	const getFilterStyle = () => {
		const { brightness, contrast, saturation } = currentEdit.adjustments;
		const b = 100 + brightness;
		const c = 100 + contrast;
		const s = 100 + saturation;
		return `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
	};

	const handleDone = async () => {
		setIsProcessing(true);

		try {
			const updatedFiles = await Promise.all(
				mediaFiles.map(async (file) => {
					const edit = allEdits[file.id];
					if (!edit) return file;

					if (file.type === "image") {
						const processedImage = await getCroppedImg(
							file.previewUrl,
							edit.aspect ? edit.croppedAreaPixels : null,
							edit.adjustments
						);
						return {
							...file,
							file: processedImage,
							previewUrl: URL.createObjectURL(processedImage),
						};
					}

					if (file.type === "video") {
						const isTrimmed = edit.trimStart !== null || edit.trimEnd !== null;
						const isMutedChanged = edit.muted !== false;

						if (isTrimmed || isMutedChanged || convertForPlatforms) {
							let processedVideo = file.file;
							if (isTrimmed || isMutedChanged) {
								processedVideo = await getTrimmedVideo(
									processedVideo,
									edit.trimStart || 0,
									edit.trimEnd || edit.duration || 0,
									edit.muted
								);
							}
							if (convertForPlatforms) {
								processedVideo = await getConvertedVideo(processedVideo);
							}

							return {
								...file,
								file: processedVideo,
								previewUrl: URL.createObjectURL(processedVideo),
								serverUrl: undefined,
								uploadId: undefined,
								r2Key: undefined,
								fileSize: undefined,
								uploadStatus: "local",
								uploadProgress: 0,
								uploadError: undefined,
							};
						}
					}

					return file;
				})
			);

			formik.setFieldValue(fieldPath, updatedFiles);
			toast.success("Media updated successfully");
			close();
		} catch {
			toast.error("Failed to process media");
		} finally {
			setIsProcessing(false);
		}
	};

	const toggleMute = () => {
		const currentMuted = currentEdit.muted || false;
		updateActiveEdit({ muted: !currentMuted });
	};

	const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
		const video = e.currentTarget;
		const dur = video.duration;
		updateActiveEdit({
			duration: dur,
			trimEnd: currentEdit.trimEnd ?? dur,
			trimStart: currentEdit.trimStart ?? 0,
		});
		video.currentTime = start;
	};

	const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
		const video = e.currentTarget;
		const current = video.currentTime;

		if (current < start || current >= end) {
			video.currentTime = start;
			setCurrentTime(start);
		} else {
			setCurrentTime(current);
		}
	};

	const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
		const seekPercent = parseFloat(e.target.value);
		const trimmedDuration = end - start;
		const newTime = start + (seekPercent / 100) * trimmedDuration;

		if (videoRef.current) {
			videoRef.current.currentTime = newTime;
			setCurrentTime(newTime);
		}
	};

	const handleTrimAction = () => {
		if (videoRef.current) {
			videoRef.current.currentTime = start;
			videoRef.current.play();
			setIsPlaying(true);
		}
	};

	const handleRevertAction = () => {
		updateActiveEdit({ trimStart: 0, trimEnd: videoDuration });
		if (videoRef.current) videoRef.current.currentTime = 0;
	};

	const isCropperActive = selectedTabIndex === 1 && currentEdit.aspect !== null;

	const trimmedDuration = end - start || 1;
	const rawProgress = ((currentTime - start) / trimmedDuration) * 100;
	const clampedProgress = Math.min(100, Math.max(0, rawProgress));

	return (
		<DialogContainer
			open={isEditMediaModal.open}
			onClose={close}
			title="Edit Media"
			closeOnOverlayClick={false}
			maxWidthClass="max-w-4xl"
			footer={
				<div className="flex justify-end gap-4">
					<Button label="Cancel" variant="secondary" onClick={close} />
					<Button label="Done" onClick={handleDone} loading={isProcessing} />
				</div>
			}
		>
			<div className="mt-3 flex gap-6">
				{/* LEFT: Media Preview */}
				<div className="flex-1 rounded-lg overflow-hidden">
					<div className="relative h-80 w-full rounded-lg">
						{activeMedia?.type === "image" ? (
							isCropperActive ? (
								<Cropper
									image={activeMedia?.previewUrl}
									crop={currentEdit.crop}
									zoom={currentEdit.zoom}
									aspect={currentEdit.aspect!}
									rotation={currentEdit.adjustments.rotation}
									onCropChange={(c) => updateActiveEdit({ crop: c })}
									onZoomChange={(z) => updateActiveEdit({ zoom: z })}
									onCropComplete={(_area, pixels) => updateActiveEdit({ croppedAreaPixels: pixels })}
									style={{ containerStyle: { filter: getFilterStyle() } }}
								/>
							) : (
								<div className="relative h-full w-full flex items-center justify-center">
									<Image
										src={activeMedia?.previewUrl ?? ""}
										alt={activeMedia?.file.name || "Preview"}
										fill
										className="object-contain transition-all"
										style={{
											filter: getFilterStyle(),
											transform: `rotate(${currentEdit.adjustments.rotation}deg) scale(${currentEdit.zoom})`,
										}}
									/>
								</div>
							)
						) : (
							<video
								ref={videoRef}
								src={activeMedia?.previewUrl ?? ""}
								className="w-full h-full object-contain"
								muted={currentEdit.muted}
								preload="metadata"
								playsInline
								onLoadedMetadata={handleLoadedMetadata}
								onTimeUpdate={handleTimeUpdate}
							/>
						)}

						{/* Preview Controls */}
						{isImage ? (
							<div className="absolute py-2 px-3 right-2 top-2 flex gap-2 bg-white rounded-full shadow">
								<button
									className="cursor-pointer"
									onClick={() => updateActiveEdit({ zoom: Math.min(currentEdit.zoom + 0.2, 3) })}
								>
									<ZoomIn className="size-4" />
								</button>
								<div className="h-4 w-px bg-[#D9D9D9]" />
								<button
									className="cursor-pointer"
									onClick={() => updateActiveEdit({ zoom: Math.max(currentEdit.zoom - 0.2, 1) })}
								>
									<ZoomOut className="size-4" />
								</button>
							</div>
						) : (
							<>
								<button
									onClick={toggleMute}
									className="absolute left-4 top-4 rounded-md bg-white p-2 cursor-pointer shadow-md z-20"
								>
									{currentEdit.muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
								</button>

								<div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[75%] bg-white rounded-full px-4 py-2 flex items-center gap-3 shadow-lg z-20">
									<button
										onClick={() => {
											if (videoRef.current?.paused) {
												videoRef.current.play();
												setIsPlaying(true);
											} else {
												videoRef.current?.pause();
												setIsPlaying(false);
											}
										}}
										className="cursor-pointer"
									>
										{isPlaying ? (
											<Pause className="size-4 fill-black-default" />
										) : (
											<Play className="size-4 fill-black-default" />
										)}
									</button>

									<div className="relative flex-1 h-4 flex items-center group">
										<div className="h-0.5 w-full bg-[#A1A1A1] rounded-full overflow-hidden">
											<div
												className="h-full bg-primary"
												style={{
													width: `${((currentTime - start) / (end - start || 1)) * 100}%`,
												}}
											/>
										</div>
										<input
											type="range"
											min="0"
											max="100"
											step="0.1"
											value={((currentTime - start) / (end - start || 1)) * 100 || 0}
											onChange={handleSeek}
											className="absolute w-full h-full opacity-0 cursor-pointer z-10"
										/>
										<div
											className="absolute size-3 bg-primary rounded-full pointer-events-none"
											style={{ left: `calc(${clampedProgress}% - 6px)` }}
										/>
									</div>

									<span className="text-[10px] text-black-default font-medium tabular-nums">
										{formatVideoTime(Math.max(0, currentTime - start))} / {formatVideoTime(end - start)}
									</span>
								</div>
							</>
						)}
					</div>
				</div>

				{/* RIGHT: Tabs & Controls for Images */}
				{isImage && (
					<div className="w-[340px]">
						<TabGroup selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex}>
							<TabList className="mb-6 flex justify-center gap-10">
								{["Adjustments", "Crop"].map((tab) => (
									<Tab
										key={tab}
										className={({ selected }) =>
											cn(
												"px-2 pb-1 text-sm cursor-pointer text-black-default",
												selected
													? "border-b-2 border-primary text-primary font-semibold"
													: "border-b-2 border-transparent font-medium"
											)
										}
									>
										{tab}
									</Tab>
								))}
							</TabList>

							<TabPanels>
								{/* Adjustments */}
								<TabPanel className="space-y-6">
									{ADJUSTMENT_CONTROLS.map((control) => (
										<AdjustmentSlider
											key={control.id}
											label={control.label}
											min={control.min}
											max={control.max}
											value={currentEdit.adjustments[control.id]}
											onChange={(v) =>
												updateActiveEdit({
													adjustments: { ...currentEdit.adjustments, [control.id]: v },
												})
											}
										/>
									))}
								</TabPanel>

								{/* Crop */}
								<TabPanel className="space-y-3">
									{CROP_RATIOS.map((ratio) => (
										<button
											key={ratio.id}
											onClick={() => updateActiveEdit({ aspect: ratio.value })}
											className={cn(
												"flex w-full items-center justify-between rounded-lg border p-3 transition-all cursor-pointer",
												currentEdit.aspect === ratio.value ? "border-primary bg-primary/5" : "border-border"
											)}
										>
											<div className="flex items-center gap-3">
												<ratio.icon
													className={cn(
														"size-5",
														currentEdit.aspect === ratio.value ? "text-primary" : "text-black-default"
													)}
												/>
												<span className="text-sm font-medium">{ratio.label}</span>
											</div>
											<div
												className={cn(
													"size-3 rounded-full border flex items-center justify-center",
													currentEdit.aspect === ratio.value ? "border-primary" : "border-border"
												)}
											>
												{currentEdit.aspect === ratio.value && <div className="size-2.5 rounded-full bg-primary" />}
											</div>
										</button>
									))}
								</TabPanel>
							</TabPanels>
						</TabGroup>
					</div>
				)}
			</div>

			{!isImage && (
				<div className="mt-6 border-t border-border pt-4">
					<button
						type="button"
						className={cn(
							"mb-4 rounded-md border px-3 py-2 text-sm transition-colors",
							convertForPlatforms ? "border-primary bg-primary/10 text-primary" : "border-border"
						)}
						onClick={() => setConvertForPlatforms((value) => !value)}
					>
						{convertForPlatforms ? "Will convert to MP4 (H.264/AAC)" : "Convert to MP4 for all platforms"}
					</button>
					<VideoTrimmer
						videoUrl={activeMedia?.previewUrl ?? ""}
						duration={videoDuration}
						trimStart={start}
						trimEnd={end}
						onChange={(s, e) => updateActiveEdit({ trimStart: s, trimEnd: e })}
						onRevert={handleRevertAction}
						onTrim={handleTrimAction}
					/>
				</div>
			)}

			<div className="mt-6">
				<MediaUpload
					formik={formik}
					isEditModal={true}
					mediaToEdit={activeMedia}
					setMediaToEdit={setActiveMedia}
					overrideId={overrideId}
				/>
			</div>
		</DialogContainer>
	);
}

export default EditMediaModal;
