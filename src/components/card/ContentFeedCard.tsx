import React, { useState, useEffect } from "react";
import Image from "next/image";
import CardStats from "./CardStats";
import { UserAvatar } from "@/components/ui/user-avatar";
import VerifiedIcon from "@/components/svg/verified-icon-black.svg";
import type { StatItem } from "@/types/content-card.types";
import { renderPlatformIcon } from "@/lib/card-helpers";
import { cn } from "@/utils/cn.util";
import BookmarkToggle from "@/components/bookmarks/BookmarkToggle";
import SharePopup from "@/components/share/SharePopup";

interface ContentFeedCardProps {
  contentId?: string;
  imageSrc?: string;
  profilePicSrc: string | null;
  userName: string;
  userHandle?: string;
  verified?: boolean;
  platform: string;
  platformIcon?: React.ReactNode;
  textContent: React.ReactNode;
  date?: string;
  stats: StatItem[];
  sourceUrl?: string;
  sourceLabel?: React.ReactNode;
  licenseAttribution?: React.ReactNode;
}

const ContentFeedCard: React.FC<ContentFeedCardProps> = ({
  contentId,
  imageSrc,
  profilePicSrc,
  userName,
  userHandle,
  verified,
  platform,
  platformIcon: platformIconProp,
  textContent,
  date,
  stats,
  sourceUrl,
  sourceLabel,
  licenseAttribution,
}) => {
	const isNavigableUrl = (url?: string): url is string =>
		Boolean(url && (/^https?:\/\//i.test(url) || url.startsWith("/")));
	const [currentStats, setCurrentStats] = useState<StatItem[]>(stats);
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  const isVideo =
    imageSrc?.toLowerCase().includes(".mp4") ||
    imageSrc?.includes("video_dashinit") ||
    imageSrc?.includes("/video");

  const handleLikeClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentStats((prev) =>
      prev.map((s) =>
        s.type === "likes"
          ? { ...s, value: s.value + (isPostLiked ? -1 : 1) }
          : s
      )
    );
    setIsPostLiked((prev) => !prev);
  };

	const openSource = () => {
    if (!isNavigableUrl(sourceUrl)) return;
    window.open(sourceUrl, "_blank", "noopener,noreferrer");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!sourceUrl) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openSource();
    }
  };

  const hasThumbnail = !!imageSrc && !imageError;
  const textFontSize = hasThumbnail ? "text-sm" : "text-base";
  const textFontWeight = hasThumbnail ? "font-normal" : "font-semibold";
  const textLineHeight = hasThumbnail ? "leading-relaxed" : "leading-tight";
  const hasStats = currentStats.some((s) => s.value != null && s.value > 0);
  const cardClasses =
    "relative flex bg-card text-card-foreground rounded-xl shadow-lg overflow-hidden flex-col min-w-[225px] h-[440px]";
  const platformIcon = platformIconProp ?? renderPlatformIcon(platform);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new window.Image();
    img.onload = () => {
      setIsPortrait(img.height > img.width);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  return (
    <div
      className={cn(cardClasses, isNavigableUrl(sourceUrl) ? "cursor-pointer" : "")}
      onClick={isNavigableUrl(sourceUrl) ? openSource : undefined}
      role={isNavigableUrl(sourceUrl) ? "link" : undefined}
      tabIndex={isNavigableUrl(sourceUrl) ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      {imageSrc && !imageError && (
        <div className="relative w-full h-[200px] bg-muted flex items-center justify-center flex-shrink-0">
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
      <div className="p-4 flex flex-col flex-1 min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <div className="relative mr-3 w-12 h-10 flex-shrink-0 overflow-visible">
                <UserAvatar
                  src={profilePicSrc}
                  alt={userName}
                  size="md"
                />
                <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
                  {platformIcon}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-foreground text-base leading-snug">{userName}</p>
                  {verified && <VerifiedIcon className="w-4 h-4 flex-shrink-0" />}
                </div>
                <p className="text-muted-foreground text-sm">{userHandle}</p>
              </div>
            </div>
            <div
              data-testid="content-card-actions"
              className="relative z-10 flex shrink-0 items-center gap-2 transition-[margin]"
              style={
                hasThumbnail
                  ? undefined
                  : {
                      marginTop:
                        "var(--content-card-action-offset, 0rem)",
                    }
              }
            >
			  <SharePopup
				url={sourceUrl}
				heading="Share Content"
				title={userName}
				iconOnly
				preview={{
					avatarSrc: profilePicSrc,
					name: userName,
					handle: userHandle,
				}}
			  />
              {contentId && (
                <BookmarkToggle
                  contentId={contentId}
                  platform={platform}
                  title={typeof textContent === "string" ? textContent : `${userName} post`}
                  contentUrl={sourceUrl}
                  thumbnailUrl={imageSrc}
                  type="post"
                />
              )}
            </div>
          </div>

          {textContent && (
            <div className="flex-1 overflow-y-auto">
              <div className={`text-card-foreground ${textFontSize} ${textFontWeight} ${textLineHeight}`}>
                {textContent}
              </div>
            </div>
          )}
        </div>

        {/* Date and Stats */}
        <div className="pt-1 mt-auto ">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
            {date ? <span>{date}</span> : null}
            {date && sourceLabel ? <span aria-hidden="true">·</span> : null}
            {sourceLabel ? <span>{sourceLabel}</span> : null}
          </div>
          {licenseAttribution ? (
            <div className="mt-0.5">{licenseAttribution}</div>
          ) : null}
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
