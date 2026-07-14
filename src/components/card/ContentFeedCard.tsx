import React, { useState } from "react";
import Image from "next/image";
import { MoreVertical } from "lucide-react";
import CardStats from "./CardStats";
import { UserAvatar } from "@/components/ui/user-avatar";
import { StatItem } from "@/lib/card-helpers";
import { useEffect } from "react";
interface ContentFeedCardProps {
	imageSrc?: string;
	profilePicSrc: string | null;
	userName: string;
	userHandle?: string;
	platformIcon: React.ReactNode;
	textContent: React.ReactNode;
	date?: string;
	stats: StatItem[];
}

const ContentFeedCard: React.FC<ContentFeedCardProps> = ({
	imageSrc,
	profilePicSrc,
	userName,
	userHandle,
	platformIcon,
	textContent,
	date,
	stats,
}) => {
	const [currentStats, setCurrentStats] = useState<StatItem[]>(stats);
	const [isPostLiked, setIsPostLiked] = useState(false);
	const [imageError, setImageError] = useState(false);
	const isVideo =
		imageSrc?.toLowerCase().includes(".mp4") ||
		imageSrc?.includes("video_dashinit") ||
		imageSrc?.includes("/video");
	const handleLikeClick = () => {
		setCurrentStats((prev) =>
			prev.map((s) =>
				s.type === "likes"
					? { ...s, value: s.value + (isPostLiked ? -1 : 1) }
					: s
			)
		);
		setIsPostLiked((prev) => !prev);
	};

	// Change to only text if thumbnail does not exist
	const hasThumbnail = !!imageSrc;
	const textFontSize = hasThumbnail ? "text-sm" : "text-base";
	const textFontWeight = hasThumbnail ? "font-normal" : "font-semibold";
	const textLineHeight = hasThumbnail ? "leading-relaxed" : "leading-tight";
	const hasStats = currentStats.some((s) => s.value != null && s.value > 0);
	const cardClasses =
		"flex bg-white rounded-xl shadow-lg overflow-hidden flex-col min-w-[225px] h-[440px]";
    const [isPortrait, setIsPortrait] = useState(false);

useEffect(() => {
  if (!imageSrc) return;

  const img = new window.Image();

  img.onload = () => {
    setIsPortrait(img.height > img.width);
  };

  img.src = imageSrc;
}, [imageSrc]);
	return (
		<div className={cardClasses}>
			{/* Thumbnail */}
			{imageSrc && !imageError && (
				<div className="relative w-full h-[200px] bg-gray-100 flex items-center justify-center flex-shrink-0">
					{isVideo ? (
						<video
							src={imageSrc}
							className="w-full h-full object-cover"
							muted
							playsInline
							preload="metadata"
						/>
					) : (
						<Image
							src={imageSrc}
							alt="Content Visual"
							fill
							className={isPortrait ? "object-contain" : "object-cover"}
							unoptimized
							onError={() => setImageError(true)}
						/>
					)}
				</div>
			)}
			{imageError && (
				<div className="relative w-full h-[200px] bg-gray-200 flex items-center justify-center flex-shrink-0">
					<div className="text-gray-400 text-sm">Image unavailable</div>
				</div>
			)}

			<div className="p-4 flex flex-col flex-1 min-h-0">
				<div className="flex-1 min-h-0 overflow-hidden">
					{/* User Info */}
						<div className="flex items-start justify-between mb-3">
						<div className="flex items-center">
						{/* Profile Picture */}
							<div className="relative mr-3 w-12 h-10 flex-shrink-0 overflow-visible">
								<UserAvatar
									src={profilePicSrc}
									alt={userName}
									size="md"
								/>
								{/* Platform Icon Overlay */}
								<div className="absolute
		bottom-0
		right-0
		translate-x-1/4
		translate-y-1/4">
									{platformIcon}
								</div>
							</div>
							{/* Usernames */}
							<div>
								<p className="font-semibold text-gray-800 text-base leading-snug">{userName}</p>
								<p className="text-gray-500 text-sm">{userHandle}</p>
							</div>
						</div>
						{/* More Options Icon */}
						<MoreVertical size={20} className="text-gray-400" />
					</div>

					{/* Content Text */}
					{textContent && (
						<div className="flex-1 overflow-y-auto">
							<div className={`text-gray-700 ${textFontSize} ${textFontWeight} ${textLineHeight}`}>
								{textContent}
							</div>
						</div>
					)}
				</div>

				{/* Date and Stats */}
				<div className="pt-1 mt-auto ">
					<p className="text-gray-400 text-xs">{date}</p>

					{hasStats && (
						<CardStats
							stats={currentStats}
							isLiked={isPostLiked}
							onLikeClick={handleLikeClick}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default ContentFeedCard;
