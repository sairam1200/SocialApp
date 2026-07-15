import React from "react";
import { Button } from "../ui/button";
import { platformMap, platforms } from "@/constants/platforms";
import { Textarea } from "../ui/textarea";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectGroup,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@/components/ui/multi-select";
import { Asterisk, MapPin, Music2, X } from "lucide-react";
import IconWand from "@/components/svg/icon_wand_pink.svg";
import { CreatePostFormValues } from "@/types/media.types";
import { FormikProps } from "formik";
import { cn } from "@/utils/cn.util";
import MediaUpload from "./MediaUpload";
import { PlatformId } from "@/constants/platforms";
type ComposeStepProps = {
	formik: FormikProps<CreatePostFormValues>;
	setActiveSearchModal: React.Dispatch<React.SetStateAction<"location" | "sound" | null>>;
	createdUrlsRef?: React.MutableRefObject<Set<string>>;
};

function ComposeStep({ formik, setActiveSearchModal, createdUrlsRef }: ComposeStepProps) {
	const baseContent = formik.values.baseContent;
	const facebookPlatform = platformMap["facebook"];

	const selectedLocation = baseContent.location;
	const selectedSound = baseContent.sound;
	const PLATFORM_CHARACTER_LIMITS: Record<PlatformId, number> = {
		facebook: 6300,
		instagram: 2200,
		twitter: 280,
		linkedin: 3000,
		youtube: 5000,
		reddit: 40000,
		pinterest: 2000,
		behance: 2200,
		tiktok: 2200,
		discord: 2000,
		spotify: 500,
	};

	const maxCaptionLength = formik.values.platforms.length > 0
		? Math.min(...formik.values.platforms.map((p) => PLATFORM_CHARACTER_LIMITS[p] ?? 2200))
		: 2200;
	return (
		<div className="space-y-5 text-black-default">
			<div>
				<label className="flex font-medium text-base mb-2">
					Select Platform <Asterisk className="text-[#E61301] size-4" />
				</label>
				<MultiSelect
					onValuesChange={(values) => {
						formik.setFieldValue("platforms", values);
					}}
					values={formik.values.platforms}
				>
					<MultiSelectTrigger className="w-full">
						<MultiSelectValue placeholder="Where do you want to post?" />
					</MultiSelectTrigger>
					<MultiSelectContent>
						<MultiSelectGroup>
							{platforms.map((platform) => (
								<MultiSelectItem key={platform.id} value={platform.id} className="px-5">
									<span className="flex items-center gap-1">
										{<platform.icon className="size-auto scale-80" />}
										{platform.name}
									</span>
								</MultiSelectItem>
							))}
						</MultiSelectGroup>
					</MultiSelectContent>
				</MultiSelect>

				{formik.touched.platforms && formik.errors.platforms && (
					<p className="text-sm text-destructive ml-1">{formik.errors.platforms}</p>
				)}
			</div>

			<div>
				<MediaUpload formik={formik} createdUrlsRef={createdUrlsRef} />
				{formik.touched.baseContent?.mediaFiles && typeof formik.errors.baseContent?.mediaFiles === "string" && (
					<p className="text-sm text-destructive ml-1">{formik.errors.baseContent?.mediaFiles}</p>
				)}
			</div>

			{/* Caption */}
			<div>
				<div className="flex justify-between items-center mb-2">
					<label className="font-medium text-base">Caption</label>
					<span className="flex items-center gap-1 font-medium cursor-pointer text-sm bg-[linear-gradient(60deg,#DC60EA_13.4%,#F94861_86.6%)] bg-clip-text text-transparent">
						<IconWand /> Writing Assistant
					</span>
				</div>

				<Textarea
					placeholder="Type your post or caption here..."
					rows={6}
					value={baseContent.caption}
					onChange={(e) => formik.setFieldValue("baseContent.caption", e.target.value)}
					onBlur={() => formik.setFieldTouched("baseContent.caption", true)}
					className="min-h-24"
				/>
				<div className="flex items-center justify-between gap-4 text-xs text-gray-neutral">
					<div className="flex items-center gap-2">
						<p>Character limits by platform:</p>

						<div className="flex items-center gap-3">
							{formik.values.platforms.map((platformId) => {
								const platform = platformMap[platformId];

								return (
									<span key={platformId} className="flex items-center gap-1">
										<platform.icon className="size-3" />
										{PLATFORM_CHARACTER_LIMITS[platformId]}
									</span>
								);
							})}
						</div>
					</div>
					<p className={baseContent.caption.length > maxCaptionLength ? "text-destructive" : ""}>{baseContent.caption.length}/{maxCaptionLength}</p>
				</div>

				{formik.touched.baseContent?.caption && formik.errors.baseContent?.caption && (
					<p className="text-sm text-destructive ml-1">{formik.errors.baseContent.caption}</p>
				)}
			</div>

			{/* Add Location / Add Sound */}
			<div className="flex items-center gap-2 border-y border-[#E6E6E6] py-3">
				{/* Location Button */}
				<Button
					type="button"
					variant={selectedLocation ? "secondary" : "text"}
					onClick={() => setActiveSearchModal("location")}
					className={cn("flex items-center gap-2 text-sm")}
				>
					<MapPin className="size-4" />
					{selectedLocation ? (
						<span className="flex items-center gap-2">
							{selectedLocation.name}
							<span
								className="ml-1 hover:text-destructive cursor-pointer"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									formik.setFieldValue("baseContent.location", null);
								}}
							>
								<X className="size-4" />
							</span>
						</span>
					) : (
						"Add Location"
					)}
				</Button>

				{/* Sound Button */}
				<Button
					type="button"
					variant={selectedSound ? "secondary" : "text"}
					onClick={() => setActiveSearchModal("sound")}
					className="flex items-center gap-2"
				>
					<Music2 className="size-4" />
					{selectedSound ? (
						<span className="flex items-center gap-2">
							{selectedSound.name} • {selectedSound.subtitle}
							<span
								className="ml-1 hover:text-destructive cursor-pointer"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									formik.setFieldValue("baseContent.sound", null);
								}}
							>
								<X className="size-4" />
							</span>
						</span>
					) : (
						"Add Sound"
					)}
				</Button>
			</div>
		</div>
	);
}

export default ComposeStep;
