import { PlatformId } from "@/constants/platforms";
import { Area, Point } from "react-easy-crop";

export type MediaFile = {
	file: File;
	previewUrl: string;
	type: "image" | "video";
	id: string;
};

export type BaseContentValues = {
	caption: string;
	mediaFiles: MediaFile[];
	location?: LocationData | null;
	sound?: SoundData | null;
};

export type PlatformOverrideValues = {
	caption?: string;
	mediaFiles?: MediaFile[];
	tags?: string[];
	location?: LocationData | null;
	sound?: SoundData | null;
	postType: string;
};

export type PlatformContentType = Record<PlatformId, PlatformOverrideValues>;

export type CreatePostFormValues = {
	platforms: PlatformId[];
	baseContent: BaseContentValues;
	platformOverrides: PlatformContentType | null;
	postSchedule: boolean;
	postScheduleDate: Date | null;
	privacy: "public" | "private" | "custom";
	platformPrivacy: Partial<Record<PlatformId, string>>;
};

export type AdjustmentState = {
	rotation: number;
	brightness: number;
	contrast: number;
	saturation: number;
};

export type ImageEditState = {
	adjustments: AdjustmentState;
	crop: Point;
	zoom: number;
	aspect: number | null;
	croppedAreaPixels: Area | null;
	muted: boolean;
	trimEnd: number | null;
	trimStart: number | null;
	duration: number | null;
};

export interface LocationData {
	id: string;
	name: string;
	subtitle: string;
}

export interface SoundData {
	id: string;
	name: string;
	subtitle: string;
	duration: string;
	previewUrl?: string;
}
