import type { CardContentProps } from "@/types/content-card.types";
import type { InstagramContent, InstagramProfile } from "@/types/social/instagram.type";
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

export function normalizeInstagramContent(
  content: InstagramContent,
  profile?: InstagramProfile,
): CardContentProps {
  const userName = resolveUserName({
    username: content.username,
    name: profile?.userName,
  });
  const userHandle = resolveUserHandle({
    username: content.username,
    username2: profile?.userName,
  });
  const profilePicSrc = resolveProfilePic({
    profileImage: profile?.profileImage,
    avatar: profile?.profileImage,
  });
  const imageSrc = resolveContentImage({
    mediaUrl: content.mediaUrl,
    thumbnailUrl: content.thumbnailUrl,
  });
  const title = resolveTitle({ caption: content.caption, title: content.title });
  const description = resolveDescription({ caption: content.caption, description: content.title });
  const date = normalizeDate({ timestamp: content.timestamp, createdAt: content.createdAt });
  const stats = normalizeStats({
    likes: content.likeCount,
    comments: content.commentsCount,
  });
  const sourceUrl = content.permalink;

  return {
    imageSrc,
    profilePicSrc,
    userName,
    userHandle,
    platform: "instagram",
    textContent: buildTextNode(title, description),
    date,
    stats,
    sourceUrl,
  };
}
