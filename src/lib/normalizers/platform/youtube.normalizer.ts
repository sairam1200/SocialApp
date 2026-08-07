import type { CardContentProps } from "@/types/content-card.types";
import type { YoutubeContent, YoutubeProfile } from "@/types/social/youtube.type";
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

export function normalizeYoutubeContent(
  content: YoutubeContent,
  profile?: YoutubeProfile,
): CardContentProps {
  const channel = profile?.channel;
  const userName = resolveUserName({
    channelTitle: channel?.title,
    displayName: profile?.name,
    name: profile?.userName,
  });
  const userHandle = resolveUserHandle({
    channelHandle: channel?.handle,
    username: profile?.userName,
  });
  const profilePicSrc = resolveProfilePic({
    channelThumbnail: channel?.thumbnail,
    profileImage: profile?.profileImage,
  });
  const imageSrc = resolveContentImage({ thumbnailUrl: content.thumbnailUrl });
  const title = resolveTitle({ title: content.title });
  const description = resolveDescription({ description: content.description });
  const date = normalizeDate({ publishedAt: content.publishedAt });
  const stats = normalizeStats({
    views: content.viewCount,
    likes: content.likeCount,
    comments: content.commentCount,
  });
  const sourceUrl = content.externalId
    ? `https://youtube.com/watch?v=${content.externalId}`
    : undefined;

  return {
    imageSrc,
    profilePicSrc,
    userName,
    userHandle,
    platform: "youtube",
    textContent: buildTextNode(title, description),
    date,
    stats,
    sourceUrl,
  };
}
