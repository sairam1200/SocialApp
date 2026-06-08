import React, { useEffect, useState } from "react";
import { FormikProps, getIn } from "formik";
import { CreatePostFormValues, PlatformOverrideValues } from "@/types/media.types";
import { PlatformId, platformMap } from "@/constants/platforms";
import { cn } from "@/utils/cn.util";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { BookmarkIcon, Ellipsis, Heart, MessageCircle, Send, X } from "lucide-react";
import IconWand from "@/components/svg/icon_wand_pink.svg";
import Image from "next/image";
import { Tab, TabGroup, TabList } from "@headlessui/react";
import MediaUpload from "./MediaUpload";

type CustomizeStepProps = {
	formik: FormikProps<CreatePostFormValues>;
	setActiveSearchModal: React.Dispatch<React.SetStateAction<"location" | "sound" | null>>;
	customizePlatformId: PlatformId | null;
	setCustomizePlatformId: React.Dispatch<React.SetStateAction<PlatformId | null>>;
};

const normalizeTag = (value: string) => {
	const cleaned = value.trim().replace(/,+$/, "");
	if (!cleaned) return null;
	return cleaned.startsWith("@") ? cleaned : `@${cleaned}`;
};

function CustomizeStep({
	formik,
	setActiveSearchModal,
	customizePlatformId,
	setCustomizePlatformId,
}: CustomizeStepProps) {
	const selectedPlatforms = formik.values.platforms;
	const [tagInputValue, setTagInputValue] = useState("");

	const activePlatformId = customizePlatformId ?? selectedPlatforms[0];
	const base = formik.values.baseContent;
	const activeOverride = formik.values.platformOverrides?.[activePlatformId];

	const effectiveValues = {
		caption: activeOverride?.caption ?? base.caption,
		mediaFiles: activeOverride?.mediaFiles ?? base.mediaFiles,
		tags: activeOverride?.tags ?? [],
		location: activeOverride?.location ?? base.location,
		sound: activeOverride?.sound ?? base.sound,
		postType: activeOverride?.postType ?? "",
	};
	const [mediaToPreview, setMediaToPreview] = useState(effectiveValues.mediaFiles[0]);

	const addTag = (raw?: string) => {
		const tag = normalizeTag(raw ?? tagInputValue);
		if (!tag) return;

		const tags = effectiveValues?.tags ?? [];

		if (!tags.includes(tag)) {
			formik.setFieldValue(`platformOverrides.${activePlatformId}.tags`, [...tags, tag]);
		}
		setTagInputValue("");
	};

	const removeTag = (tagToRemove: string) => {
		const tags = effectiveValues?.tags ?? [];
		formik.setFieldValue(
			`platformOverrides.${activePlatformId}.tags`,
			tags.filter((tag) => tag !== tagToRemove)
		);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			addTag();
		}

		if (e.key === "Backspace" && !tagInputValue && (effectiveValues?.tags?.length ?? 0) > 0) {
			removeTag(effectiveValues?.tags![effectiveValues?.tags!.length - 1] ?? "");
		}
	};

	useEffect(() => {
		setCustomizePlatformId(selectedPlatforms[0]);
	}, [selectedPlatforms, setCustomizePlatformId]);

	useEffect(() => {
		if (effectiveValues?.mediaFiles?.length) {
			setMediaToPreview(effectiveValues.mediaFiles[0]);
		}
	}, [effectiveValues?.mediaFiles]);

	useEffect(() => {
		if (!formik.values.platformOverrides && selectedPlatforms.length > 0) {
			const overrides = selectedPlatforms.reduce<Record<PlatformId, PlatformOverrideValues>>((acc, platform) => {
				acc[platform] = {
					postType: "",
					tags: [],
				};
				return acc;
			}, {} as Record<PlatformId, PlatformOverrideValues>);
			formik.setFieldValue("platformOverrides", overrides);
		}
	}, [selectedPlatforms, formik]);

	return (
		<div>
			<div>
				<TabGroup
					selectedIndex={selectedPlatforms.indexOf(activePlatformId)}
					onChange={(index) => setCustomizePlatformId(selectedPlatforms[index])}
				>
					<TabList className="mb-6 flex gap-5 overflow-auto border-b border-[#E6E6E6]">
						{selectedPlatforms.map((id) => {
							const platform = platformMap[id];
							if (!platform) return null;
							return (
								<Tab
									key={id}
									className={({ selected }) =>
										cn(
											"pb-2 text-sm cursor-pointer text-black-default flex items-center gap-2",
											selected
												? "border-b-2 border-primary text-primary font-semibold"
												: "border-b-2 border-transparent font-medium"
										)
									}
								>
									<platform.icon className="size-4" />
									{platform.name}
								</Tab>
							);
						})}
					</TabList>
				</TabGroup>

				<div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-3 text-black-default">
					<div className="space-y-3 overflow-y-auto pr-2 max-h-[450px]">
						{/* Media Selection Area */}
						<div className="space-y-2">
							<label className="font-bold text-sm block">Media</label>
							<div className="border border-[#E6E6E6] bg-[#FAFAFA] rounded-md p-1">
								{(effectiveValues?.mediaFiles?.length ?? 0) < 1 && (
									<div className="bg-[#E6E6E6] text-center p-3 rounded-md mb-2 text-sm text-black-default">
										<p>No pictures or videos added</p>
									</div>
								)}
								<MediaUpload
									formik={formik}
									isEditModal={false}
									imageStyles="size-16"
									uploadUI="button"
									iconScale="scale-60"
									overrideId={activePlatformId}
									mediaToEdit={mediaToPreview}
									setMediaToEdit={(media) => media && setMediaToPreview(media)}
								/>
							</div>
							{getIn(formik.errors, `platformOverrides.${activePlatformId}.mediaFiles`) && (
								<p className="text-sm text-destructive ml-1">
									{getIn(formik.errors, `platformOverrides.${activePlatformId}.mediaFiles`)}
								</p>
							)}
						</div>

						{/* Post Type Dropdown */}
						<div className="space-y-2">
							<label className="font-bold text-sm block">
								Post Type <span className="text-destructive">*</span>
							</label>
							<Select
								placeholder="Select post type"
								name="postType"
								value={effectiveValues?.postType || ""}
								onValueChange={(value) => formik.setFieldValue(`platformOverrides.${activePlatformId}.postType`, value)}
								error={
									getIn(formik.touched, `platformOverrides.${activePlatformId}.postType`) &&
									getIn(formik.errors, `platformOverrides.${activePlatformId}.postType`)
										? getIn(formik.errors, `platformOverrides.${activePlatformId}.postType`)
										: ""
								}
								options={[
									{ value: "feed", label: "Feed" },
									{ value: "story", label: "Story" },
									{ value: "reel", label: "Reel" },
								]}
							/>
						</div>

						{/* Caption Area */}
						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<label className="font-bold text-sm">Caption</label>
								<span className="flex items-center gap-1 font-medium cursor-pointer text-xs bg-[linear-gradient(60deg,#DC60EA_13.4%,#F94861_86.6%)] bg-clip-text text-transparent">
									<IconWand /> Writing Assistant
								</span>
							</div>
							<Textarea
								placeholder="Write your caption..."
								value={effectiveValues?.caption ?? ""}
								onChange={(e) => formik.setFieldValue(`platformOverrides.${activePlatformId}.caption`, e.target.value)}
								className="min-h-24 resize-none"
								error={
									getIn(formik.touched, `platformOverrides.${activePlatformId}.caption`) &&
									getIn(formik.errors, `platformOverrides.${activePlatformId}.caption`)
										? getIn(formik.errors, `platformOverrides.${activePlatformId}.caption`)
										: ""
								}
							/>
							<div className="text-right text-xs text-gray-neutral">{effectiveValues?.caption?.length}/2200</div>
						</div>

						{/* Tags & Mentions */}
						<div className="space-y-2">
							<label className="font-bold text-sm">Tag & Mentions</label>

							<div className="flex flex-wrap items-center rounded-md px-2 border border-input">
								{effectiveValues?.tags?.map((tag) => (
									<span key={tag} className="flex items-center gap-1 text-sm px-1 rounded-full">
										{tag}
										<X
											className="size-3 cursor-pointer text-gray-neutral hover:text-black"
											onClick={() => removeTag(tag)}
										/>
									</span>
								))}

								<Input
									value={tagInputValue}
									onChange={(e) => setTagInputValue(e.target.value)}
									onKeyDown={handleKeyDown}
									onBlur={() => {
										if (tagInputValue.trim()) addTag();
									}}
									placeholder="@arcaa1, @eureka"
									className="flex-1 min-w-[120px] border-none outline-none shadow-none text-sm"
								/>
							</div>
						</div>

						{/* Metadata Overrides (Location/Sound) */}
						<div className="space-y-1">
							<label className="text-sm font-bold">Location</label>
							<div className="relative group">
								<Input
									value={effectiveValues?.location?.name || ""}
									readOnly
									className="pr-5 cursor-pointer"
									placeholder="Add Location"
									onClick={() => setActiveSearchModal("location")}
								/>
								{effectiveValues?.location && (
									<X
										className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-neutral cursor-pointer hover:text-black"
										onClick={() => formik.setFieldValue(`platformOverrides.${activePlatformId}.location`, null)}
									/>
								)}
							</div>
						</div>

						<div className="space-y-1">
							<label className="text-sm font-bold">Sound</label>
							<div className="relative group">
								<Input
									value={
										effectiveValues?.sound ? `${effectiveValues.sound.name} • ${effectiveValues.sound.subtitle}` : ""
									}
									readOnly
									className="pr-5 cursor-pointer"
									placeholder="Add Sound"
									onClick={() => setActiveSearchModal("sound")}
								/>
								{effectiveValues?.sound && (
									<X
										className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-neutral cursor-pointer hover:text-black"
										onClick={() => formik.setFieldValue(`platformOverrides.${activePlatformId}.sound`, null)}
									/>
								)}
							</div>
						</div>
					</div>

					{/* RIGHT: PREVIEW SECTION */}

					<div className="bg-[#D4D4D6] rounded-lg p-3 flex items-start justify-center border border-[#D4D4D4] w-full">
						<div className="bg-white rounded-lg overflow-hidden shadow-sm w-full flex flex-col text-[#101828]">
							{/* Header */}
							<div className="p-3 flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="size-6 rounded-full bg-linear-to-tr from-[#C27AFF] to-[#FB64B6]" />
									<div className="flex flex-col">
										<span className="text-xs font-semibold">Username</span>
										<span className="text-[10px] text-[#6A7282]">Just now</span>
									</div>
								</div>
								<Ellipsis className="size-5" />
							</div>

							{/* Media Container */}
							<div className="relative aspect-square w-full bg-gray-100 flex items-center justify-center">
								{effectiveValues?.mediaFiles?.length ? (
									<>
										{mediaToPreview.type === "image" ? (
											<Image src={mediaToPreview.previewUrl} alt="Post preview" fill className="object-cover" />
										) : (
											<video controls={true} preload="metadata" className="h-full w-full object-cover">
												<source src={mediaToPreview.previewUrl} type={mediaToPreview.file.type || "video/mp4"} />
											</video>
										)}
									</>
								) : (
									<div className="text-gray-400 text-xs">No media selected</div>
								)}
							</div>

							{/* Footer / Actions */}
							<div className="p-4 flex flex-col gap-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<Heart className="size-5" />
										<MessageCircle className="size-5" />
										<Send className="size-5" />
									</div>
									<BookmarkIcon className="size-5" />
								</div>

								<div className="flex flex-col gap-1">
									<span className="text-xs text-[#364153]">1,234 likes</span>
									<div className="text-xs flex gap-2">
										<span className="font-semibold">Username</span>
										<span className="text-[#364153] line-clamp-2">{effectiveValues?.caption || "Something here"}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default CustomizeStep;
