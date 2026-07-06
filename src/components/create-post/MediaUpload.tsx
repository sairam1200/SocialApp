import { Plus, X, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import ImageIcon from "@/components/svg/image.svg";
import VideoIcon from "@/components/svg/video.svg";
import EditIcon from "@/components/svg/edit.svg";
import Image from "next/image";
import { FormikProps } from "formik";
import { CreatePostFormValues, MediaFile } from "@/types/media.types";
import { ChangeEvent, DragEvent, useCallback, useEffect, useRef, useState } from "react";
import { getMediaType, validateVideoFile, VIDEO_ACCEPT_STRING } from "@/utils/media.utils";
import { uploadVideo } from "@/services/api/upload-video.service";
import EditMediaModal from "./EditMediaModal";
import { cn } from "@/utils/cn.util";
import { Button } from "../ui/button";
import { PlatformId } from "@/constants/platforms";

type MediaUploadProps = {
	isEditModal?: boolean;
	formik: FormikProps<CreatePostFormValues>;
	mediaToEdit?: MediaFile | null;
	setMediaToEdit?: (media: MediaFile | null) => void;
	imageStyles?: string;
	uploadBoxStyles?: string;
	uploadUI?: "box" | "button";
	iconScale?: string;
	overrideId?: PlatformId;
};

const statusLabels: Record<string, string> = {
	uploading: "Uploading video...",
	checking: "Checking video compatibility...",
	converting: "Converting video format...",
};

function MediaUpload({
	isEditModal = false,
	formik,
	mediaToEdit,
	setMediaToEdit,
	imageStyles = "",
	uploadBoxStyles = "",
	uploadUI = "box",
	iconScale = "scale-70",
	overrideId,
}: MediaUploadProps) {
	const fieldPath = overrideId ? `platformOverrides.${overrideId}.mediaFiles` : "baseContent.mediaFiles";
	const mediaFiles =
		(overrideId && formik.values.platformOverrides?.[overrideId]?.mediaFiles) || formik.values.baseContent.mediaFiles;
	const [isDragging, setIsDragging] = useState(false);
	const [isEditMediaModal, setIsEditMediaModal] = useState({
		open: false,
		activeMedia: null as MediaFile | null,
	});
	const [videoError, setVideoError] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const createdUrlsRef = useRef<Set<string>>(new Set());
	const uploadAbortMapRef = useRef<Map<string, AbortController>>(new Map());

	const updateMedia = useCallback(
		(id: string, updates: Partial<MediaFile>) => {
			const updated = mediaFiles.map((m) => (m.id === id ? { ...m, ...updates } : m));
			formik.setFieldValue(fieldPath, updated);
		},
		[fieldPath, formik, mediaFiles]
	);

	const revokePreviewUrl = useCallback((url: string) => {
		if (url?.startsWith("blob:") && createdUrlsRef.current.has(url)) {
			createdUrlsRef.current.delete(url);
			URL.revokeObjectURL(url);
		}
	}, []);

	const uploadVideoFile = useCallback(
		async (media: MediaFile) => {
			if (media.type !== "video") return;

			const abortController = new AbortController();
			uploadAbortMapRef.current.set(media.id, abortController);
			updateMedia(media.id, { uploadStatus: "uploading", uploadProgress: 0 });

			try {
				const result = await uploadVideo(media.file, (progress) => {
					updateMedia(media.id, { uploadProgress: progress });
				}, abortController.signal);

				updateMedia(media.id, {
					serverUrl: result.url,
					uploadStatus: "completed",
					uploadProgress: 100,
				});

				revokePreviewUrl(media.previewUrl);
			} catch (err) {
				if ((err as Error).name === "AbortError") return;
				updateMedia(media.id, {
					uploadStatus: "error",
					uploadError: (err as Error).message || "Upload failed",
				});
			} finally {
				uploadAbortMapRef.current.delete(media.id);
			}
		},
		[updateMedia, revokePreviewUrl]
	);

	const processFiles = useCallback(
		(files: FileList | null) => {
			if (!files || files.length === 0) return;
			setVideoError("");

			const newMedia: MediaFile[] = [];
			const errors: string[] = [];

			Array.from(files).forEach((file) => {
				const type = getMediaType(file.type);
				if (!type) return;

				if (type === "video") {
					const validation = validateVideoFile(file);
					if (!validation.valid) {
						errors.push(validation.error);
						return;
					}
				}

				const previewUrl = URL.createObjectURL(file);
				createdUrlsRef.current.add(previewUrl);
				newMedia.push({
					file,
					previewUrl,
					type,
					id: `${file.name}-${Date.now()}-${Math.random()}`,
					serverUrl: undefined,
					uploadStatus: type === "video" ? "uploading" : undefined,
					uploadProgress: 0,
				});
			});

			if (errors.length > 0) {
				setVideoError(errors[0]);
			}

			if (newMedia.length > 0) {
				const updatedFiles = [...mediaFiles, ...newMedia];
				formik.setFieldValue(fieldPath, updatedFiles);

				newMedia.forEach((media) => {
					if (media.type === "video") {
						uploadVideoFile(media);
					}
				});
			}
		},
		[fieldPath, formik, mediaFiles, uploadVideoFile]
	);

	const handleFileSelect = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			processFiles(e.target.files);
			if (e.target.value) {
				e.target.value = "";
			}
		},
		[processFiles]
	);

	const handleSelectFileClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.currentTarget.contains(e.relatedTarget as Node) === false) {
			setIsDragging(false);
		}
	}, []);

	const handleDrop = useCallback(
		(e: DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);
			if (e.dataTransfer.files) {
				processFiles(e.dataTransfer.files);
			}
		},
		[processFiles]
	);

	const handleRemoveMedia = (id: string) => {
		const abortController = uploadAbortMapRef.current.get(id);
		if (abortController) {
			abortController.abort();
			uploadAbortMapRef.current.delete(id);
		}
		const removed = mediaFiles.find((m) => m.id === id);
		if (removed) revokePreviewUrl(removed.previewUrl);
		const updated = [...mediaFiles].filter((media) => media.id !== id);
		formik.setFieldValue(fieldPath, updated);
	};

	const handleRetryUpload = useCallback(
		(media: MediaFile) => {
			updateMedia(media.id, { uploadStatus: "uploading", uploadProgress: 0, uploadError: undefined });
			uploadVideoFile(media);
		},
		[updateMedia, uploadVideoFile]
	);

	useEffect(() => {
		const urls = createdUrlsRef.current;
		const abortMap = uploadAbortMapRef.current;
		return () => {
			abortMap.forEach((controller) => controller.abort());
			abortMap.clear();
			urls.forEach((url) => URL.revokeObjectURL(url));
			urls.clear();
		};
	}, []);

	const videoSrc = (media: MediaFile): string => {
		if (media.serverUrl) return media.serverUrl;
		return media.previewUrl;
	};

	return (
		<div className={cn("flex gap-2", uploadUI === "box" ? "flex-row" : "flex-col")}>
			{mediaFiles.length > 0 && (
				<div className="flex flex-row gap-2 overflow-x-auto">
					{mediaFiles.map((media) => {
						const MediaIcon = media.type === "video" ? VideoIcon : ImageIcon;
						const objectFitStyle: React.CSSProperties =
							media.type === "image" ? { objectFit: "cover" } : { objectFit: "contain" };

						return (
							<div
								key={media.id}
								className={cn(
									`relative rounded-lg overflow-hidden shrink-0 group size-30`,
									imageStyles,
									(isEditModal || overrideId) && mediaToEdit?.id === media.id ? "border-3 border-primary" : "",
									(isEditModal || overrideId) && "cursor-pointer"
								)}
								onClick={() => {
									if ((isEditModal || overrideId) && setMediaToEdit) {
										setMediaToEdit(media);
									}
								}}
							>
								{media.type === "image" ? (
									<Image
										src={media.previewUrl}
										alt={media.file.name || "Media Preview"}
										className="w-full h-full"
										fill
										style={objectFitStyle}
									/>
								) : media.uploadStatus === "completed" || !media.uploadStatus ? (
									<div className="w-full h-full bg-black flex items-center justify-center">
										<video
											controls
											preload="metadata"
											playsInline
											className="w-full h-full object-contain"
										>
											<source src={videoSrc(media)} type="video/mp4" />
										</video>
									</div>
								) : media.uploadStatus === "error" ? (
									<div className="w-full h-full bg-black flex flex-col items-center justify-center gap-2 text-white text-xs p-2 text-center">
										<AlertCircle className="size-6 text-red-400" />
										<span>Upload failed</span>
										<button
											onClick={(e) => { e.stopPropagation(); handleRetryUpload(media); }}
											className="underline text-primary cursor-pointer"
										>
											Retry
										</button>
									</div>
								) : (
									<div className="w-full h-full bg-black flex flex-col items-center justify-center gap-2 text-white text-xs p-2 text-center">
										<Loader2 className="size-6 animate-spin" />
										<span>{statusLabels[media.uploadStatus || ""] || "Processing..."}</span>
										{media.uploadProgress !== undefined && media.uploadProgress > 0 && (
											<div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
												<div
													className="h-full bg-primary transition-all duration-300"
													style={{ width: `${media.uploadProgress}%` }}
												/>
											</div>
										)}
									</div>
								)}

								{!isEditModal && (
									<button
										onClick={() => handleRemoveMedia(media.id)}
										className="absolute top-1 right-1 size-5 bg-[#E61301] border border-[#BC0E01] rounded-full hidden group-hover:flex items-center justify-center cursor-pointer z-10"
										aria-label="Remove media"
										title="Remove media"
									>
										<X className="size-3 text-white" />
									</button>
								)}

								<div
									className={cn(
										"absolute bottom-1 right-1 bg-white p-1 rounded-full cursor-pointer",
										!isEditModal && "group-hover:hidden"
									)}
								>
									<MediaIcon className={cn(iconScale)} />
								</div>

								{!isEditModal && (
									<div
										className="absolute bottom-1 right-1 bg-white p-0.5 rounded-full cursor-pointer hidden group-hover:flex"
										aria-label="Edit media"
										title="Edit media"
										onClick={() => setIsEditMediaModal({ open: true, activeMedia: media })}
									>
										<EditIcon className={cn(iconScale)} />
									</div>
								)}

								{media.uploadStatus === "completed" && (
									<div className="absolute top-1 left-1 size-5 bg-green-500 rounded-full flex items-center justify-center">
										<CheckCircle2 className="size-3 text-white" />
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}

			{videoError && (
				<div className="flex items-start gap-2 text-sm text-destructive bg-destructive/5 p-2 rounded-md">
					<AlertCircle className="size-4 mt-0.5 shrink-0" />
					<span>{videoError}</span>
				</div>
			)}

			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileSelect}
				multiple
				accept={VIDEO_ACCEPT_STRING}
				style={{ display: "none" }}
			/>
			{uploadUI === "box" ? (
				<div
					className={cn(
						`min-w-34 h-30 border border-dashed rounded-lg py-8 px-3 flex-1 flex flex-col items-center justify-center cursor-pointer text-[#0D0D0D] transition-colors`,
						uploadBoxStyles,
						isDragging ? "border-primary bg-primary/10" : "border-gray-neutral bg-[#FAFAFA]"
					)}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onClick={handleSelectFileClick}
				>
					<div className="">
						<Plus className="size-6" />
					</div>
					<p className="text-sm">Drag and drop or</p>
					<span className="text-primary underline font-medium text-sm">select a file</span>
				</div>
			) : (
				<Button
					variant="secondary"
					className="w-full"
					icon={<Plus className="size-4" />}
					onClick={handleSelectFileClick}
				>
					Add Media
				</Button>
			)}

			{isEditMediaModal.open && (
				<EditMediaModal
					isEditMediaModal={isEditMediaModal}
					close={() => setIsEditMediaModal({ open: false, activeMedia: null })}
					formik={formik}
					overrideId={overrideId}
				/>
			)}
		</div>
	);
}

export default MediaUpload;
