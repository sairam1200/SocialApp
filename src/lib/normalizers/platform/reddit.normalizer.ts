import type { CardContentProps } from "@/types/content-card.types";
import type { RedditContent, RedditProfile } from "@/types/social/reddit.type";
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

export function normalizeRedditContent(
  content: RedditContent,
  profile?: RedditProfile,
): CardContentProps {
  const userName = resolveUserName({
    displayName: profile?.displayName,
    name: content.author,
    username: profile?.userName,
  });
  const userHandle = resolveUserHandle({
    username: content.author ?? profile?.userName,
  });
  const profilePicSrc = resolveProfilePic({
    profileImage: profile?.profileImage,
  });
  const imageSrc = resolveContentImage({
    thumbnailUrl: content.thumbnailUrl,
    mediaUrl: content.mediaUrl,
  });
  const title = resolveTitle({ title: content.title });
  const description = resolveDescription({ description: content.description, text: content.title });
  const date = normalizeDate({ created: content.created });
  const stats = normalizeStats({
    likes: content.ups,
    comments: content.numComments,
  });
  const sourceUrl = content.permalink;

  return {
    imageSrc,
    profilePicSrc,
    userName,
    userHandle,
    platform: "reddit",
    textContent: buildTextNode(title, description),
    date,
    stats,
    sourceUrl,
  };
}
