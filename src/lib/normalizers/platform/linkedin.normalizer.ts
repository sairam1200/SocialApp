import type { CardContentProps } from "@/types/content-card.types";
import type { LinkedInContent, LinkedInProfile } from "@/types/social/linkedin.type";
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

export function normalizeLinkedInContent(
  content: LinkedInContent,
  profile?: LinkedInProfile,
): CardContentProps {
  const userName = resolveUserName({
    displayName: profile?.firstName
      ? [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim()
      : undefined,
    name: content.author?.name,
    username: profile?.userName,
  });
  const userHandle = resolveUserHandle({
    username: profile?.userName,
  });
  const profilePicSrc = resolveProfilePic({
    profileImage: profile?.profileImage,
    authorAvatar: content.author?.image,
  });
  const imageSrc: string | undefined = undefined;
  const title = resolveTitle({ title: content.title, text: content.text });
  const description = resolveDescription({ text: content.text, description: content.title });
  const date = normalizeDate({ created: content.created, timestamp: content.lastModified });
  const stats = normalizeStats({
    likes: content.activity?.likes,
    comments: content.activity?.comments,
    shares: content.activity?.shares,
  });
  const sourceUrl = undefined;

  return {
    imageSrc,
    profilePicSrc,
    userName,
    userHandle,
    platform: "linkedin",
    textContent: buildTextNode(title, description),
    date,
    stats,
    sourceUrl,
  };
}
