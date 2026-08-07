export interface SearchContentAuthor {
  name?: string | null;
  handle?: string | null;
  profileImage?: string | null;
  verified?: boolean | null;
  displayName?: string | null;
}

export interface SearchContentMedia {
  thumbnailUrl?: string | null;
  url?: string | null;
}

export interface SearchContentEngagement {
  views?: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  viewCount?: number | null;
  likeCount?: number | null;
  commentCount?: number | null;
  shareCount?: number | null;
}

/** Structural input accepted by the canonical resolver. Compatible with both the raw wire item (FlatSearchItem) and the normalized SearchResult. */
export interface SearchContentInput {
  title?: string | null;
  description?: string | null;
  platform?: string | null;
  publishedAt?: string | null;
  url?: string | null;
  sourceUrl?: string | null;
  thumbnailUrl?: string | null;
  mediaUrl?: string | null;
  creatorName?: string | null;
  creatorUsername?: string | null;
  creatorAvatar?: string | null;
  creator?: SearchContentAuthor | string | null;
  author?: SearchContentAuthor | null;
  media?: SearchContentMedia | null;
  engagement?: SearchContentEngagement | null;
  platformMetadata?: Record<string, any> | null;
}

export interface CanonicalSearchContent {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  displayName: string;
  handle?: string;
  profileImage?: string;
  verified?: boolean;
  publishedAt?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  sourceUrl?: string;
  platform: string;
}

export type SearchContentTrace = Record<string, string>;

type Source = [label: string, value: () => unknown];

function firstDefined(
  trace: SearchContentTrace,
  field: string,
  sources: Source[],
): unknown {
  for (const [label, value] of sources) {
    const v = value();
    if (v !== undefined && v !== null && v !== "") {
      trace[field] = label;
      return v;
    }
  }
  trace[field] = "(none)";
  return undefined;
}

function asText(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asTextOrTimestamp(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number") {
    const ms = value > 1e12 ? value : value * 1000;
    const parsed = new Date(ms);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }
  return undefined;
}

function asTextArrayJoined(
  value: unknown,
  key: string,
  separator = ", ",
): string | undefined {
  if (!Array.isArray(value)) return undefined;
  const parts = value
    .map((entry) => entry?.[key])
    .filter((part): part is string => typeof part === "string" && part !== "");
  return parts.length > 0 ? parts.join(separator) : undefined;
}

/**
 * Canonical metadata resolver for search content cards.
 *
 * Normalizes every platform into one canonical model, reading from the
 * item-level fields first and then walking the platformMetadata (the backend
 * `metaData` bag) across every spelling the indexed platforms write:
 * imported rows (thumbnailUrl, youtubeUrl, channelTitle, viewCount...) and
 * search-indexed rows (thumbnails.high.url, channelUsername,
 * channelProfileImage, channelUrl...) as well as platform-specific keys
 * (message, caption, analytics.*, stats.*, commentary, selftext, ...).
 *
 * Every legacy mapping is preserved; only fallback sources are appended.
 */
export function resolveSearchContentWithTrace(
  input: SearchContentInput,
): { model: CanonicalSearchContent; trace: SearchContentTrace } {
  const meta: Record<string, any> = input.platformMetadata ?? {};
  const author = input.author ?? {};
  const creator = typeof input.creator === "string" ? {} : (input.creator ?? {});
  const media = input.media ?? {};
  const engagement = input.engagement ?? {};
  const trace: SearchContentTrace = {};

  const title =
    (firstDefined(trace, "title", [["title", () => input.title]]) as string) ??
    "";

  const description = asText(
    firstDefined(trace, "description", [
      ["description", () => input.description],
      ["metaData.description", () => meta.description],
      ["metaData.message", () => meta.message],
      ["metaData.caption", () => meta.caption],
      ["metaData.selftext", () => meta.selftext],
      ["metaData.note", () => meta.note],
      [
        "metaData.commentary",
        () =>
          typeof meta.commentary === "string"
            ? meta.commentary
            : meta.commentary?.text,
      ],
      [
        "metaData.text",
        () => (typeof meta.text === "string" ? meta.text : meta.text?.text),
      ],
    ]),
  );

  const thumbnailUrl = asText(
    firstDefined(trace, "thumbnailUrl", [
      ["media.thumbnailUrl", () => media.thumbnailUrl],
      ["thumbnailUrl", () => input.thumbnailUrl],
      ["metaData.thumbnailUrl", () => meta.thumbnailUrl],
      ["metaData.imageUrl", () => meta.imageUrl],
      ["metaData.coverImageUrl", () => meta.coverImageUrl],
      ["metaData.picture", () => meta.picture],
      ["metaData.thumbnail", () => meta.thumbnail],
      ["metaData.thumbnails.high.url", () => meta.thumbnails?.high?.url],
      ["metaData.thumbnails.medium.url", () => meta.thumbnails?.medium?.url],
      ["metaData.thumbnails.default.url", () => meta.thumbnails?.default?.url],
      [
        "metaData.images[0].url",
        () => (Array.isArray(meta.images) ? meta.images[0]?.url : undefined),
      ],
    ]),
  );

  const displayName =
    asText(
      firstDefined(trace, "displayName", [
        ["author.name", () => author.name],
        ["creator.displayName", () => creator.displayName],
        ["creatorName", () => input.creatorName],
        ["metaData.channelTitle", () => meta.channelTitle],
        ["metaData.channelName", () => meta.channelName],
        ["metaData.pageName", () => meta.pageName],
        ["metaData.username", () => meta.username],
        [
          "metaData.author",
          () => (typeof meta.author === "string" ? meta.author : undefined),
        ],
        ["metaData.displayName", () => meta.displayName],
        [
          "metaData.artists",
          () => asTextArrayJoined(meta.artists, "name"),
        ],
      ]),
    ) ?? "Unknown";

  const handle = asText(
    firstDefined(trace, "handle", [
      ["author.handle", () => author.handle],
      ["creator.handle", () => creator.handle],
      ["creatorUsername", () => input.creatorUsername],
      ["metaData.channelUsername", () => meta.channelUsername],
      ["metaData.username", () => meta.username],
      ["metaData.channelHandle", () => meta.channelHandle],
      ["metaData.customUrl", () => meta.customUrl],
      ["metaData.screenName", () => meta.screenName],
    ]),
  );

  const profileImage = asText(
    firstDefined(trace, "profileImage", [
      ["author.profileImage", () => author.profileImage],
      ["creator.profileImage", () => creator.profileImage],
      ["creatorAvatar", () => input.creatorAvatar],
      ["metaData.channelProfileImage", () => meta.channelProfileImage],
      ["metaData.profileImage", () => meta.profileImage],
      ["metaData.avatar", () => meta.avatar],
    ]),
  );

  const verified = firstDefined(trace, "verified", [
    ["author.verified", () => author.verified],
    ["creator.verified", () => creator.verified],
    ["metaData.verified", () => meta.verified],
    ["metaData.isVerified", () => meta.isVerified],
  ]) as boolean | undefined;

  const publishedAt = asTextOrTimestamp(
    firstDefined(trace, "publishedAt", [
      ["publishedAt", () => input.publishedAt],
      ["metaData.publishedAt", () => meta.publishedAt],
      ["metaData.createdTime", () => meta.createdTime],
      ["metaData.created", () => (meta.created?.time ?? meta.created)],
      ["metaData.timestamp", () => meta.timestamp],
      ["metaData.createdAt", () => meta.createdAt],
      ["metaData.createTime", () => meta.createTime],
      ["metaData.createdUtc", () => meta.createdUtc],
      ["metaData.releaseDate", () => meta.releaseDate],
    ]),
  );

  const viewCount = firstDefined(trace, "viewCount", [
    ["engagement.views", () => engagement.views],
    ["engagement.viewCount", () => engagement.viewCount],
    ["metaData.viewCount", () => meta.viewCount],
    ["metaData.views", () => meta.views],
    ["metaData.analytics.views", () => meta.analytics?.views],
    ["metaData.analytics.impressions", () => meta.analytics?.impressions],
    ["metaData.stats.viewCount", () => meta.stats?.viewCount],
    ["metaData.statistics.viewCount", () => meta.statistics?.viewCount],
  ]) as number | undefined;

  const likeCount = firstDefined(trace, "likeCount", [
    ["engagement.likes", () => engagement.likes],
    ["engagement.likeCount", () => engagement.likeCount],
    ["metaData.likeCount", () => meta.likeCount],
    ["metaData.likes", () => meta.likes],
    ["metaData.analytics.reactions", () => meta.analytics?.reactions],
    ["metaData.analytics.saves", () => meta.analytics?.saves],
    ["metaData.stats.likeCount", () => meta.stats?.likeCount],
    ["metaData.statistics.likeCount", () => meta.statistics?.likeCount],
  ]) as number | undefined;

  const commentCount = firstDefined(trace, "commentCount", [
    ["engagement.comments", () => engagement.comments],
    ["engagement.commentCount", () => engagement.commentCount],
    ["metaData.commentCount", () => meta.commentCount],
    ["metaData.commentsCount", () => meta.commentsCount],
    ["metaData.numComments", () => meta.numComments],
    ["metaData.num_comments", () => meta.num_comments],
    ["metaData.comment_count", () => meta.comment_count],
    ["metaData.analytics.comments", () => meta.analytics?.comments],
    ["metaData.stats.commentCount", () => meta.stats?.commentCount],
    ["metaData.statistics.commentCount", () => meta.statistics?.commentCount],
    ["metaData.replyCount", () => meta.replyCount],
    ["metaData.reply_count", () => meta.reply_count],
  ]) as number | undefined;

  const shareCount = firstDefined(trace, "shareCount", [
    ["engagement.shares", () => engagement.shares],
    ["engagement.shareCount", () => engagement.shareCount],
    ["metaData.shareCount", () => meta.shareCount],
    ["metaData.shares", () => meta.shares],
    ["metaData.analytics.shares", () => meta.analytics?.shares],
    ["metaData.stats.shareCount", () => meta.stats?.shareCount],
    ["metaData.statistics.shareCount", () => meta.statistics?.shareCount],
    ["metaData.retweet_count", () => meta.retweet_count],
    ["metaData.quote_count", () => meta.quote_count],
  ]) as number | undefined;

  const sourceUrl = asText(
    firstDefined(trace, "sourceUrl", [
      ["url", () => input.url],
      ["sourceUrl", () => input.sourceUrl],
      ["metaData.youtubeUrl", () => meta.youtubeUrl],
      ["metaData.permalink", () => meta.permalink],
      ["metaData.link", () => meta.link],
      ["metaData.channelUrl", () => meta.channelUrl],
      ["metaData.shareUrl", () => meta.shareUrl],
      ["metaData.mediaUrl", () => meta.mediaUrl],
      ["metaData.media_url", () => meta.media_url],
      ["metaData.sourceUrl", () => meta.sourceUrl],
      ["metaData.url", () => meta.url],
    ]),
  );

  const platform =
    asText(firstDefined(trace, "platform", [["platform", () => input.platform]])) ??
    "gaddr";

  return {
    model: {
      title,
      description,
      thumbnailUrl,
      displayName,
      handle,
      profileImage,
      verified,
      publishedAt,
      viewCount,
      likeCount,
      commentCount,
      shareCount,
      sourceUrl,
      platform,
    },
    trace,
  };
}

export function resolveSearchContent(
  input: SearchContentInput,
): CanonicalSearchContent {
  return resolveSearchContentWithTrace(input).model;
}
