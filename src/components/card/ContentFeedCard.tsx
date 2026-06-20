import React, { useState } from "react";
import Image from "next/image";
import { MoreVertical } from "lucide-react";
import CardStats from "./CardStats";

interface ContentFeedCardProps {
	imageSrc?: string;
	profilePicSrc: string;
	userName: string;
	userHandle?: string;
	platformIcon: React.ReactNode;
	textContent: React.ReactNode;
	date?: string;
	views?: number;
	likes: number;
	comments?: number;
}

const ContentFeedCard: React.FC<ContentFeedCardProps> = ({
	imageSrc,
	profilePicSrc,
	userName,
	userHandle,
	platformIcon,
	textContent,
	date,
	views,
	likes,
	comments,
}) => {
	const [currentLikes, setCurrentLikes] = useState(likes);
	const [isPostLiked, setIsPostLiked] = useState(false);
 const isVideo =
    imageSrc?.toLowerCase().includes(".mp4") ||
    imageSrc?.includes("video_dashinit") ||
    imageSrc?.includes("/video");
	const handleLikeClick = () => {
		if (isPostLiked) {
			setCurrentLikes((prevCount) => prevCount - 1);
		} else {
			setCurrentLikes((prevCount) => prevCount + 1);
		}
		setIsPostLiked((prevIsLiked) => !prevIsLiked);
	};

	// Change to only text if thumbnail does not exist
	const hasThumbnail = !!imageSrc;
	const textFontSize = hasThumbnail ? "text-sm" : "text-base";
	const textFontWeight = hasThumbnail ? "font-normal" : "font-semibold";
	const textLineHeight = hasThumbnail ? "leading-relaxed" : "leading-tight";

	const cardClasses = "flex bg-white rounded-xl shadow-lg overflow-hidden flex-col min-w-[225px] min-h-[400px] max-h-[400px]";

	return (
		<div className={cardClasses}>
			{/* Thumbnail */}
			{imageSrc && (
				<div className="relative w-full h-[200px]">
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
							sizes="(max-width: 768px) 100vw, 33vw"
							className="object-cover"
						/>
					)}
				</div>
			)}

			<div className="p-4 flex flex-col grow">
				<div className="grow">
					{/* User Info */}
					<div className="flex items-start justify-between mb-3">
						<div className="flex items-center">
							{/* Profile Picture */}
							<div className="relative mr-3 w-12 h-10 flex-shrink-0 overflow-visible">
								<Image
									src={profilePicSrc}
									alt={userName}
									width={40}
									height={40}
									className="rounded-full object-cover"
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
					<div className={`text-gray-700 min-h-[60px] max-h-[85px] overflow-hidden ${textFontSize} ${textFontWeight} ${textLineHeight}`}>
						{textContent}
					</div>
				</div>

				{/* Date and Stats */}
				<div className="pt-3">
					<p className="text-gray-400 text-xs">{date}</p>

					<CardStats
						views={views}
						likes={currentLikes}
						comments={comments}
						isLiked={isPostLiked}
						onLikeClick={handleLikeClick}
					/>
				</div>
			</div>
		</div>
	);
};

export default ContentFeedCard;
