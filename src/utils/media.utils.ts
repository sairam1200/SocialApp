import { Area } from "react-easy-crop";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { LocationData, SoundData } from "@/types/media.types";

export const ALLOWED_VIDEO_MIME_TYPES = [
	"video/mp4",
	"video/quicktime",
	"video/webm",
	"video/x-msvideo",
	"video/x-matroska",
	"video/x-ms-wmv",
	"video/mpeg",
] as const;

export const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".avi", ".mkv", ".wmv", ".mpeg", ".m4v", ".mpg"] as const;

export const VIDEO_ACCEPT_STRING = "image/jpeg,image/png,image/webp,image/gif,video/*";
export const MAX_VIDEO_UPLOAD_BYTES = 256 * 1024 * 1024;

export type VideoValidationResult = { valid: true } | { valid: false; error: string };

export function validateVideoFile(file: File): VideoValidationResult {
	if (file.size > MAX_VIDEO_UPLOAD_BYTES) {
		return { valid: false, error: "Video is larger than the 256 MB upload limit. Please trim or compress it before uploading." };
	}
	const extension = "." + file.name.split(".").pop()?.toLowerCase();
	if (!extension || !(ALLOWED_VIDEO_EXTENSIONS as readonly string[]).includes(extension)) {
		return {
			valid: false,
				error: "Unsupported video format. Please choose MP4, MOV, WebM, AVI, MKV, WMV, or MPEG.",
		};
	}

	if (!(ALLOWED_VIDEO_MIME_TYPES as readonly string[]).includes(file.type)) {
		if (file.type.startsWith("video/")) {
			return {
				valid: false,
				error: "Unsupported video format. Please choose MP4, MOV, WebM, AVI, MKV, WMV, or MPEG.",
			};
		}
	}

	return { valid: true };
}

export function canPlayVideo(mimeType: string, codec?: string): boolean {
	const video = document.createElement("video");
	if (codec) {
		return video.canPlayType(`${mimeType}; codecs="${codec}"`) !== "";
	}
	return video.canPlayType(mimeType) !== "";
}

export const getMediaType = (mimeType: string): "image" | "video" | null => {
	if (mimeType.startsWith("image/")) return "image";
	if (mimeType.startsWith("video/")) return "video";
	return null;
};

/**
 * Converts degrees to radians.
 */
const getRads = (degValue: number) => (degValue * Math.PI) / 180;

/**
 * Returns the new bounding box size after rotation.
 */
const rotateSize = (width: number, height: number, rotation: number) => {
	const rotRad = getRads(rotation);

	return {
		width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
		height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
	};
};

export const getCroppedImg = async (
	imageSrc: string,
	pixelCrop: Area | null,
	adjustments: { rotation: number; brightness: number; contrast: number; saturation: number }
): Promise<File> => {
	const image = new Image();
	image.src = imageSrc;
	image.crossOrigin = "anonymous";
	await new Promise((resolve, reject) => {
		image.onload = resolve;
		image.onerror = reject;
	});

	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	if (!ctx) throw new Error("No 2d context");

	const { rotation, brightness, contrast, saturation } = adjustments;

	const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

	canvas.width = pixelCrop ? pixelCrop.width : bBoxWidth;
	canvas.height = pixelCrop ? pixelCrop.height : bBoxHeight;

	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const b = 100 + brightness;
	const c = 100 + contrast;
	const s = 100 + saturation;
	ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;

	if (pixelCrop) {
		ctx.translate(-pixelCrop.x, -pixelCrop.y);
	}

	ctx.translate(bBoxWidth / 2, bBoxHeight / 2);

	ctx.rotate(getRads(rotation));

	ctx.translate(-image.width / 2, -image.height / 2);

	ctx.drawImage(image, 0, 0);

	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (!blob) {
					reject(new Error("Canvas is empty"));
					return;
				}
				resolve(new File([blob], "edited-image.jpg", { type: "image/jpeg" }));
			},
			"image/jpeg",
			0.95
		);
	});
};

export const extractVideoFrames = async (videoUrl: string, count: number): Promise<string[]> => {
	return new Promise((resolve) => {
		const video = document.createElement("video");
		video.src = videoUrl;
		video.crossOrigin = "anonymous";
		video.load();

		video.onloadedmetadata = async () => {
			const frames: string[] = [];
			const duration = video.duration;
			const interval = duration / count;
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			for (let i = 0; i < count; i++) {
				video.currentTime = i * interval;
				await new Promise((res) => (video.onseeked = res));
				canvas.width = 100; // Small width for performance
				canvas.height = (video.videoHeight / video.videoWidth) * 100;
				ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
				frames.push(canvas.toDataURL("image/jpeg", 0.5));
			}
			resolve(frames);
		};
	});
};

export const formatVideoTime = (seconds: number) => {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
};

let ffmpeg: FFmpeg | null = null;

export const getTrimmedVideo = async (file: File, start: number, end: number, muted: boolean): Promise<File> => {
	if (!ffmpeg) {
		ffmpeg = new FFmpeg();
	}

	if (!ffmpeg.loaded) {
		const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
		await ffmpeg.load({
			coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
			wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
		});
	}

	const inputName = "input.mp4";
	const outputName = "output.mp4";

	// Write the original file to FFmpeg's virtual memory
	await ffmpeg.writeFile(inputName, await fetchFile(file));

	const audioCommand = muted ? ["-an"] : ["-c", "copy"];

	await ffmpeg.exec([
		"-ss",
		start.toString(),
		"-i",
		inputName,
		"-to",
		(end - start).toString(),
		...audioCommand,
		"-map_metadata",
		"0",
		outputName,
	]);

	const data = await ffmpeg.readFile(outputName);
	const blob = new Blob([data as BlobPart], { type: "video/mp4" });

	return new File([blob], file.name, { type: "video/mp4" });
};

export const createVideoThumbnail = async (videoUrl: string): Promise<File> => {
	return new Promise((resolve, reject) => {
		const video = document.createElement("video");
		video.src = videoUrl;
		video.crossOrigin = "anonymous";
		video.muted = true;
		video.preload = "metadata";
		video.onloadeddata = () => {
			video.currentTime = Math.min(0.1, Math.max(0, video.duration / 10));
		};
		video.onseeked = () => {
			const canvas = document.createElement("canvas");
			canvas.width = video.videoWidth || 1280;
			canvas.height = video.videoHeight || 720;
			const context = canvas.getContext("2d");
			if (!context) return reject(new Error("Could not create video thumbnail"));
			context.drawImage(video, 0, 0, canvas.width, canvas.height);
			canvas.toBlob((blob) => {
				if (!blob) return reject(new Error("Could not create video thumbnail"));
				resolve(new File([blob], "video-cover.jpg", { type: "image/jpeg" }));
			}, "image/jpeg", 0.88);
		};
		video.onerror = () => reject(new Error("Could not read the video for a thumbnail"));
		video.load();
	});
};

/**
 * Normalize a video for the social publishing APIs. MOV files and videos
 * exported with an unsupported codec are rewritten to an H.264/AAC MP4 with
 * a web-optimized header. The caller can surface the conversion state while
 * this runs because loading the WASM encoder can take a few seconds.
 */
export const getConvertedVideo = async (file: File): Promise<File> => {
	if (!ffmpeg) {
		ffmpeg = new FFmpeg();
	}

	if (!ffmpeg.loaded) {
		const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
		await ffmpeg.load({
			coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
			wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
		});
	}

	const inputName = `convert-input-${Date.now()}.${file.name.split(".").pop() || "mp4"}`;
	const outputName = `convert-output-${Date.now()}.mp4`;
	await ffmpeg.writeFile(inputName, await fetchFile(file));
	await ffmpeg.exec([
		"-i",
		inputName,
		"-c:v",
		"libx264",
		"-preset",
		"veryfast",
		"-crf",
		"23",
		"-c:a",
		"aac",
		"-b:a",
		"128k",
		"-movflags",
		"+faststart",
		outputName,
	]);

	const data = await ffmpeg.readFile(outputName);
	const blob = new Blob([data as BlobPart], { type: "video/mp4" });
	return new File([blob], file.name.replace(/\.[^.]+$/u, "") + ".mp4", { type: "video/mp4" });
};

// export const fetchLocationSuggestions = async (query: string): Promise<LocationData[]> => {
//   if (!query) return [];

//   const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
//   const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
//     query
//   )}&types=geocode|establishment&key=${apiKey}`;

//   try {
//     const response = await fetch(url);
//     const data = await response.json();

//     if (data.status !== "OK") return [];

//     return data.predictions.map((p: { place_id: string; structured_formatting: { main_text: string; secondary_text: string; }; }) => ({
//       id: p.place_id,
//       name: p.structured_formatting.main_text,
//       subtitle: p.structured_formatting.secondary_text || "Landmark",
//     }));
//   } catch (error) {
//     console.error("Google Places Error:", error);
//     return [];
//   }
// };

export const fetchLocationSuggestions = async (query: string): Promise<LocationData[]> => {
	if (!query || query.length < 3) return [];

	const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
		query
	)}&format=json&addressdetails=1&limit=5`;

	try {
		const response = await fetch(url, {
			headers: {
				"User-Agent": "YourAppName/1.0",
			},
		});
		const data = await response.json();

		return data.map(
			(item: { place_id: { toString: () => string }; display_name: string }): LocationData => ({
				id: item.place_id?.toString(),
				name: item.display_name?.split(",")[0],
				subtitle: item.display_name?.split(",").slice(1).join(",").trim(),
			})
		);
	} catch {
		return [];
	}
};

export const fetchMusicSuggestions = async (query: string): Promise<SoundData[]> => {
	if (!query || query.length < 2) return [];

	const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=10`;

	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error("Network response was not ok");

		const data = await response.json();

		return data.results.map(
			(item: {
				trackTimeMillis: number;
				trackId: { toString: () => string };
				trackName: string;
				artistName: string;
				previewUrl: string;
			}): SoundData => {
				// Convert milliseconds to M:SS format
				const minutes = Math.floor(item.trackTimeMillis / 60000);
				const seconds = Math.floor((item.trackTimeMillis % 60000) / 1000);
				const durationStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

				return {
					id: item.trackId.toString(),
					name: item.trackName,
					subtitle: item.artistName,
					duration: durationStr,
					previewUrl: item.previewUrl,
				};
			}
		);
	} catch {
		return [];
	}
};
