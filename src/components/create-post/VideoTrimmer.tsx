import React, { useEffect, useState, useRef } from "react";
import { extractVideoFrames } from "@/utils/media.utils";
import Image from "next/image";

type Props = {
	videoUrl: string;
	duration: number;
	trimStart: number;
	trimEnd: number;
	onChange: (start: number, end: number) => void;
	onRevert: () => void;
	onTrim: () => void;
};

export const VideoTrimmer = ({ videoUrl, duration, trimStart, trimEnd, onChange, onRevert, onTrim }: Props) => {
	const [frames, setFrames] = useState<string[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (videoUrl) {
			extractVideoFrames(videoUrl, 12).then(setFrames);
		}
	}, [videoUrl]);

	const handleDrag = (e: React.MouseEvent, type: "start" | "end") => {
		if (!containerRef.current || duration <= 0) return;
		const rect = containerRef.current.getBoundingClientRect();

		const onMouseMove = (moveEvent: MouseEvent) => {
			const rawPos = (moveEvent.clientX - rect.left) / rect.width;
			const clampedPos = Math.max(0, Math.min(1, rawPos));
			const time = clampedPos * duration;

			if (type === "start") {
				onChange(Math.min(time, trimEnd - 0.5), trimEnd);
			} else {
				onChange(trimStart, Math.max(time, trimStart + 0.5));
			}
		};

		const onMouseUp = () => {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		};

		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);
	};

	const leftPercent = Math.min(100, Math.max(0, (trimStart / (duration || 1)) * 100));
	const rightPercent = Math.min(100, Math.max(0, 100 - (trimEnd / (duration || 1)) * 100));

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-4 w-full">
				<div
					ref={containerRef}
					className="relative h-14 flex-1 rounded-lg overflow-hidden bg-gray-100 flex items-center border border-gray-200"
				>
					<div className="flex w-full h-full absolute inset-0 bg-transparent pointer-events-none">
						{frames.map((src, i) => (
							<div key={i} className="relative flex-1 h-full border-r border-white/10">
								<Image src={src} fill className="w-full h-full object-cover grayscale opacity-60" alt="" />
							</div>
						))}
					</div>

					<div
						className="absolute h-full bg-primary/20 border-y-2 border-primary z-10"
						style={{
							left: `${leftPercent}%`,
							right: `${rightPercent}%`,
						}}
					>
						{/* Draggable Handles */}
						<div
							onMouseDown={(e) => handleDrag(e, "start")}
							className="absolute -left-0.5 top-0 bottom-0 w-3 bg-primary cursor-ew-resize flex items-center justify-center rounded-l-sm"
						>
							<div className="w-0.5 h-4 bg-white rounded-full" />
						</div>
						<div
							onMouseDown={(e) => handleDrag(e, "end")}
							className="absolute -right-0.5 top-0 bottom-0 w-3 bg-primary cursor-ew-resize flex items-center justify-center rounded-r-sm"
						>
							<div className="w-0.5 h-4 bg-white rounded-full" />
						</div>
					</div>
				</div>

				<div className="flex gap-2">
					<button
						onClick={onRevert}
						className="px-4 py-2 text-xs font-bold bg-gray-100 rounded-md text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
					>
						Revert
					</button>
					<button
						onClick={onTrim}
						className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
					>
						Trim
					</button>
				</div>
			</div>
		</div>
	);
};
