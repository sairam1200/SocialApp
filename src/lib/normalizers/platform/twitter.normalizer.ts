import type { CardContentProps } from "@/types/content-card.types";
import type { TwitterContent, TwitterProfile } from "@/types/social/twitter.type";
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

export function normalizeTwitterContent(
  content: TwitterContent,
  profile?: TwitterProfile,
): CardContentProps {
  const userName = resolveUserName({
    displayName: content.name,
    name: profile?.userName,
  });
  const userHandle = resolveUserHandle({
    screen_name: profile?.userName,
    username: profile?.userName,
  });
  const profilePicSrc = resolveProfilePic({
    profileImage: profile?.profileImage,
  });
  const imageSrc = resolveContentImage({
    thumbnailUrl: content.thumbnailUrl,
    mediaUrl: content.mediaUrl,
  });
  const title = resolveTitle({ text: content.tweet, title: undefined });
  const description = resolveDescription({ text: content.tweet });
  const date = normalizeDate({ timestamp: content.timestamp });
  const stats = normalizeStats({
    likes: content.likeCount,
    comments: content.replyCount,
    shares: content.repostCount,
  });
  const sourceUrl = content.permalink;

  return {
    imageSrc,
    profilePicSrc,
    userName,
    userHandle,
    platform: "twitter",
    textContent: buildTextNode(title, description),
    date,
    stats,
    sourceUrl,
  };
}
