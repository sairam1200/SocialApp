/**
 * The publishing calendar's shapes, mirroring `publish.view.ts` on the backend.
 *
 * Kept flat and free of storage details on purpose: a calendar cell needs when,
 * where, what it says and whether it went out. R2 keys and upload ids stay on
 * the server side of the wire.
 */

export type PublishStatus =
  | "pending"
  | "scheduled"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export type PostFormat = "video" | "image" | "carousel" | "text" | "link";

/** `queued` means Gaddr holds the post; `native` means the platform does. */
export type DeliveryMode = "immediate" | "queued" | "native";

export interface PublishItem {
  id: string;
  /** Present when the post went to several channels at once. */
  groupId?: string;
  platform: string;
  linkedAccountId: string;
  status: PublishStatus;
  deliveryMode: DeliveryMode;
  postFormat: PostFormat;
  postType?: string;
  /** When it goes live, or went live. Always set. */
  at: string;
  timezone?: string;
  title: string;
  excerpt: string;
  tags?: string[];
  visibility?: string;
  thumbnailUrl?: string;
  progress: number;
  statusMessage?: string;
  lastError?: string;
  attempts: number;
  platformContentUrl?: string;
  /** False once the post has published or failed for good. */
  editable: boolean;
  createdAt: string;
}

export interface PublishCalendarResponse {
  from: string;
  to: string;
  items: PublishItem[];
  /** Post count per YYYY-MM-DD, for shading a month without holding every item. */
  countsByDay: Record<string, number>;
  countsByPlatform: Record<string, number>;
}

export interface PublishQueueResponse {
  items: PublishItem[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * A connected account a post can actually be sent to.
 *
 * `linkedAccountId` is the only identifier the publish path accepts: a user can
 * hold two Instagram accounts and a platform name cannot tell them apart.
 */
export interface PublishChannel {
  linkedAccountId: string;
  platform: string;
  displayName?: string;
  externalId?: string;
  canPublish: boolean;
  canEngage: boolean;
  /** Set when the platform is connected but publishing is gated, e.g. TikTok's audit. */
  publishBlockedReason?: string;
}

export interface PublishChannelsResponse {
  channels: PublishChannel[];
  /** Connected, but nothing here can publish to them. */
  connectedButNotPublishable: string[];
}

export interface CreatePostTarget {
  linkedAccountId: string;
  platform: string;
  uploadId?: string;
  title?: string;
  description?: string;
  tags?: string[];
  visibility?: string;
  postFormat?: PostFormat;
  postType?: string;
  /**
   * Platform-specific extras the provider reads: a YouTube thumbnail URL, a
   * Pinterest board and cover image. Free-form because each provider names its
   * own, and pinning a union here would mean editing this file every time a
   * platform gains a field.
   */
  metadata?: Record<string, unknown>;
}

export interface CreatePostRequest {
  targets: CreatePostTarget[];
  title?: string;
  description?: string;
  tags?: string[];
  visibility?: "public" | "private" | "unlisted";
  postFormat?: PostFormat;
  uploadId?: string;
  linkUrl?: string;
  /** ISO instant. Omit to publish now. */
  publishAt?: string;
  timezone?: string;
}

export interface CreatePostChannelResult {
  platform: string;
  linkedAccountId: string;
  publishJobId?: string;
  status: string;
  scheduledAt?: string;
  deliveryMode?: DeliveryMode;
  /** Set only on the channels that were rejected. The others still went ahead. */
  error?: string;
}

export interface CreatePostResponse {
  groupId: string;
  scheduledAt?: string;
  channels: CreatePostChannelResult[];
  accepted: number;
  rejected: number;
}

/* ------------------------------------------------------------- generation */

export interface GenerationBrand {
  description?: string;
  tone?: string;
  language?: string;
  preferredTerms?: string[];
  bannedTerms?: string[];
}

export interface AiDisclosure {
  aiGenerated: true;
  model: string;
  generatedAt: string;
  /** Translation key, not a sentence. Shown next to any draft that is used. */
  noticeKey: string;
}

export interface PlatformDraft {
  platform: string;
  title: string;
  body: string;
  hashtags: string[];
  rationale: string;
  /** Measured against the platform's real limits, server side. */
  warnings: string[];
}

export interface DraftPostResponse {
  drafts: PlatformDraft[];
  disclosure: AiDisclosure;
}

export interface ReplyDraft {
  body: string;
  tone: string;
  /** A person has to send this one. Complaints, refunds, legal, safety. */
  needsHuman: boolean;
  needsHumanReason?: string;
}

export interface ReplyDraftResponse {
  replies: ReplyDraft[];
  disclosure: AiDisclosure;
}
