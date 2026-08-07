import type { CardContentProps } from "@/types/content-card.types";
import type { PinterestContent, PinterestProfile } from "@/types/social/pinterest.type";
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

export function normalizePinterestContent(
  content: PinterestContent,
  profile?: PinterestProfile,
): CardContentProps {
  const userName = resolveUserName({
    username: profile?.userName,
    name: profile?.userName,
  });
  const userHandle = resolveUserHandle({
    username: profile?.userName,
  });
  const profilePicSrc = resolveProfilePic({
    profileImage: profile?.profileImage,
  });
  const imageSrc = resolveContentImage({
    imageUrl: content.imageUrl,
    thumbnailUrl: content.imageUrl,
  });
  const title = resolveTitle({ title: content.title });
  const description = resolveDescription({ description: content.description, text: content.title });
  const date = normalizeDate({ createdAt: content.createdAt });
  const stats = normalizeStats({
    likes: content.pinCount,
  });
  const sourceUrl = content.link;

  return {
    imageSrc,
    profilePicSrc,
    userName,
    userHandle,
    platform: "pinterest",
    textContent: buildTextNode(title, description),
    date,
    stats,
    sourceUrl,
  };
}
