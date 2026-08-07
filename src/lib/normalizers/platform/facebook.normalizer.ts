import type { CardContentProps } from "@/types/content-card.types";
import type { FacebookContent, FacebookProfile } from "@/types/social/facebook.type";
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

export function normalizeFacebookContent(
  content: FacebookContent,
  profile?: FacebookProfile,
): CardContentProps {
  const userName = resolveUserName({
    name: profile?.name,
    username: profile?.userName,
  });
  const userHandle = resolveUserHandle({
    username: profile?.userName,
  });
  const profilePicSrc = resolveProfilePic({
    profileImage: profile?.profileImage,
    picture: profile?.page?.picture,
  });
  const imageSrc = resolveContentImage({ thumbnailUrl: content.picture });
  const title = resolveTitle({ title: content.title, description: content.description });
  const description = resolveDescription({
    message: content.message,
    description: content.description,
    text: content.story,
  });
  const date = normalizeDate({ createdAt: content.createdAt, updatedAt: content.updatedAt });
  const stats = normalizeStats({
    likes: content.reactions ?? content.totalReactions,
    comments: content.commentCount,
    shares: content.sharesCount,
  });
  const sourceUrl = content.permalinkUrl ?? content.link;

  return {
    imageSrc,
    profilePicSrc,
    userName,
    userHandle,
    platform: "facebook",
    textContent: buildTextNode(title, description),
    date,
    stats,
    sourceUrl,
  };
}
