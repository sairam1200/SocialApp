import { Play, Plus, X } from "lucide-react";
import ImageIcon from "@/components/svg/image.svg";
import VideoIcon from "@/components/svg/video.svg";
import EditIcon from "@/components/svg/edit.svg";
import Image from "next/image";
import { FormikProps } from "formik";
import { CreatePostFormValues, MediaFile } from "@/types/media.types";
import { ChangeEvent, DragEvent, useCallback, useRef, useState } from "react";
import { getMediaType } from "@/utils/media.utils";
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
	uploadUI?: "button" | "box";
	iconScale?: string;
	overrideId?: PlatformId;
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
	const fileInputRef = useRef<HTMLInputElement>(null);

	const processFiles = useCallback(
		(files: FileList | null) => {
			if (!files || files.length === 0) return;
			const newMedia: MediaFile[] = Array.from(files)
				.map((file) => {
					const type = getMediaType(file.type);
					if (!type) return null;

					return {
						file,
						previewUrl: URL.createObjectURL(file),
						type,
						id: `${file.name}-${Date.now()}-${Math.random()}`,
					};
				})
				.filter(Boolean) as MediaFile[];

			const updatedFiles = [...mediaFiles, ...newMedia];

			formik.setFieldValue(fieldPath, updatedFiles);
		},
		[fieldPath, formik, mediaFiles]
	);

	// --- Event Handlers ---

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
		const updated = [...mediaFiles].filter((media) => media.id !== id);
		formik.setFieldValue(fieldPath, updated);
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
								) : (
									<div className="w-full h-full bg-black flex items-center justify-center">
										<video controls={false} preload="metadata" playsInline muted className="w-full h-full">
											<source src={media.previewUrl} type={media.file.type || "video/mp4"} />
											<span className="text-white">
												<Play />
											</span>
										</video>
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
							</div>
						);
					})}
				</div>
			)}

			{/* Media Upload Box */}
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileSelect}
				multiple
				accept="image/*,video/*"
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
