import type { CardContentProps } from "@/types/content-card.types";
import { resolveUserName, buildTextNode, normalizeDate, normalizeStats } from "../utils/normalization.utils";

export interface GaddrContentInput {
  id: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  publishedAt?: string | null;
  sourceUrl?: string | null;
  views?: number | null;
  likes?: number | null;
  comments?: number | null;
  userName: string;
  userHandle: string;
  userProfileImage: string | null;
  platform: string;
}

export function normalizeGaddrContent(content: GaddrContentInput): CardContentProps {
  const userName = resolveUserName({ displayName: content.userName, name: content.userName });
  const userHandle = content.userHandle
    ? content.userHandle.startsWith("@")
      ? content.userHandle
      : `@${content.userHandle}`
    : undefined;
  const profilePicSrc = content.userProfileImage ?? null;
  const imageSrc = content.imageUrl ?? undefined;
  const title = content.title?.trim() || undefined;
  const description = content.description?.trim() || undefined;
  const date = normalizeDate({ publishedAt: content.publishedAt ?? undefined });
  const stats = normalizeStats({
    views: content.views,
    likes: content.likes,
    comments: content.comments,
  });
  const sourceUrl = content.sourceUrl ?? undefined;

  return {
    imageSrc,
    profilePicSrc,
    userName,
    userHandle,
    platform: "gaddr",
    textContent: buildTextNode(title, description),
    date,
    stats,
    sourceUrl,
  };
}
