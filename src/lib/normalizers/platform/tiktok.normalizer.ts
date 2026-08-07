import type { CardContentProps } from "@/types/content-card.types";
import type { TiktokContent, TiktokProfile } from "@/types/social/tiktok.type";
import {
  resolveUserName,
  resolveUserHandle,
  resolveProfilePic,
  resolveContentImage,
  resolveTitle,
  resolveDescription,
  buildTextNode,
  normalizeDate,
  normalizeStats,
} from "../utils/normalization.utils";

export function normalizeTiktokContent(
  content: TiktokContent,
  profile?: TiktokProfile,
): CardContentProps {
  const userName = resolveUserName({
    displayName: profile?.displayName,
    username: content.username ?? profile?.username,
  });
  const userHandle = resolveUserHandle({
    uniqueId: content.username ?? profile?.username,
    username: profile?.username,
  });
  const profilePicSrc = resolveProfilePic({
    avatar: profile?.avatarUrl,
  });
  const imageSrc = resolveContentImage({
    thumbnailUrl: content.thumbnailUrl,
    mediaUrl: content.mediaUrl,
  });
  const title = resolveTitle({ title: content.title, description: content.description });
  const description = resolveDescription({ description: content.description, text: content.title });
  const date = normalizeDate({ timestamp: content.timestamp, createdAt: content.createdAt });
  const stats = normalizeStats({
    views: content.playCount,
    likes: content.likeCount,
    comments: content.commentCount,
    shares: content.shareCount,
  });
  const sourceUrl = content.permalink;

  return {
    imageSrc,
    profilePicSrc,
    userName,
    userHandle,
    platform: "tiktok",
    textContent: buildTextNode(title, description),
    date,
    stats,
    sourceUrl,
  };
}
