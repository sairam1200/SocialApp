import type { CardContentProps, StatItem, StatType } from "@/types/content-card.types";

export function pickFirstDefined(...values: (string | null | undefined)[]): string | undefined {
  for (const v of values) {
    if (v != null && v.trim().length > 0) return v.trim();
  }
  return undefined;
}

export function resolveUserName(fields: Record<string, string | null | undefined>): string {
  const name =
    pickFirstDefined(
      fields.displayName,
      fields.username,
      fields.channelTitle,
      fields.name,
      fields.creatorName,
      fields.authorName,
      fields.ownerName,
      fields.profileName,
    ) ?? "Unknown User";
  return name;
}

export function resolveUserHandle(fields: Record<string, string | null | undefined>): string | undefined {
  const raw = pickFirstDefined(
    fields.handle,
    fields.username,
    fields.screen_name,
    fields.uniqueId,
    fields.creatorUsername,
    fields.ownerUsername,
    fields.channelHandle,
  );
  if (!raw) return undefined;
  return raw.startsWith("@") ? raw : `@${raw}`;
}

export function resolveProfilePic(fields: Record<string, string | null | undefined>): string | null {
  return pickFirstDefined(
    fields.creatorAvatar,
    fields.creatorProfilePicture,
    fields.creatorThumbnail,
    fields.authorAvatar,
    fields.authorPicture,
    fields.ownerAvatar,
    fields.profilePicture,
    fields.thumbnailDefault,
    fields.channelThumbnail,
    fields.avatar,
    fields.profilePic,
    fields.profileImage,
  ) ?? null;
}

export function resolveContentImage(fields: Record<string, string | null | undefined>): string | undefined {
  return pickFirstDefined(
    fields.thumbnailUrl,
    fields.thumbnail,
    fields.coverImage,
    fields.previewImage,
    fields.mediaUrl,
    fields.imageUrl,
    fields.poster,
    fields.mediaUrl0,
  );
}

export function resolveTitle(fields: Record<string, string | null | undefined>): string | undefined {
  const title = pickFirstDefined(
    fields.title,
    fields.headline,
    fields.caption,
    fields.description,
    fields.text,
  );
  if (!title || title.trim().length === 0) return undefined;
  return title;
}

export function resolveDescription(fields: Record<string, string | null | undefined>): string | undefined {
  const desc = pickFirstDefined(
    fields.description,
    fields.caption,
    fields.message,
    fields.body,
    fields.text,
    fields.content,
  );
  if (!desc || desc.trim().length === 0) return undefined;
  return desc;
}

export function buildTextNode(title?: string, description?: string): React.ReactNode {
  const t = title?.trim() ?? "";
  const d = description?.trim() ?? "";
  if (!t && !d) return null;
  return (
    <>
      {t && <span className="font-semibold block line-clamp-1">{t}</span>}
      {d && <span className="text-sm text-muted-foreground block line-clamp-2">{d}</span>}
    </>
  );
}

export function normalizeDate(dateFields: Record<string, string | null | undefined>): string | undefined {
  const raw = pickFirstDefined(
    dateFields.publishedAt,
    dateFields.createdAt,
    dateFields.timestamp,
    dateFields.created_time,
    dateFields.uploadTime,
    dateFields.published,
    dateFields.created,
  );
  if (!raw) return undefined;
  try {
    return new Date(raw).toISOString();
  } catch {
    return undefined;
  }
}

export function normalizeStats(statMap: Partial<Record<StatType, number | null | undefined>>): StatItem[] {
  const stats: StatItem[] = [];
  const order: StatType[] = ["views", "likes", "comments", "shares"];
  for (const type of order) {
    const val = statMap[type];
    if (val != null && val > 0) {
      stats.push({ type, value: val, clickable: type === "likes" });
    }
  }
  return stats;
}

export function calculateContentCompleteness(content: CardContentProps): number {
  let score = 0;
  if (content.imageSrc) score++;
  if (content.profilePicSrc) score++;
  if (content.userName && content.userName !== "Unknown User") score++;
  let hasText = false;
  const text = content.textContent;
  if (text != null && text !== false && text !== "") hasText = true;
  if (hasText) score++;
  if (content.stats.length > 0) score++;
  if (content.date) score++;
  if (content.sourceUrl) score++;
  return score;
}

export const MIN_CONTENT_COMPLETENESS = 5;

export function isContentValid(content: CardContentProps): boolean {
  if (!content.userName || content.userName === "Unknown User" || !content.platform) return false;
  return calculateContentCompleteness(content) >= MIN_CONTENT_COMPLETENESS;
}

export function filterValidContent(items: CardContentProps[]): CardContentProps[] {
  return items.filter(isContentValid);
}
