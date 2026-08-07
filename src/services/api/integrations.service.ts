/* eslint-disable @typescript-eslint/no-unused-vars */
import { Post, Get, Patch, Delete, Body, Path, Query } from "restfit";
import {
  ConnectResponse,
  ConnectCallbackResponseType,
  ImportRequestBody,
  ImportCancellationResponse,
  ImportJobStatusResponse,
  PublishCapabilities,
} from "@/types/integrations.types";
import {
  CreatePostRequest,
  CreatePostResponse,
  DraftPostResponse,
  GenerationBrand,
  PublishCalendarResponse,
  PublishChannelsResponse,
  PublishItem,
  PublishQueueResponse,
  ReplyDraftResponse,
} from "@/types/publishing.types";

export class IntegrationsService {
  /** OAuth */
  @Get<ConnectResponse>("/integrations/{platform}/connect")
  async connect(
    @Path("platform") platform: string
  ): Promise<ConnectResponse> {
    return { authorizeURL: "" };
  }

  /** OAuth callback */
  @Get<ConnectCallbackResponseType>(
    "/integrations/{platform}/connect-callback"
  )
  async connectCallback(
    @Path("platform") platform: string,
    @Query("code") code: string,
    @Query("state") state: string
  ): Promise<ConnectCallbackResponseType> {
    return {} as ConnectCallbackResponseType;
  }

  /** Current account */
  @Get("/integrations/{platform}/me")
  async getMe<T = unknown>(
    @Path("platform") platform: string
  ): Promise<T> {
    return {} as T;
  }

  /** Connected profile */
  @Get("/integrations/{platform}/profile")
  async getProfile<T>(
    @Path("platform") platform: string
  ): Promise<T> {
    return {} as T;
  }

  /** Imported content */
  @Get("/integrations/{platform}/contents")
  async getContents<T= unknown>(
    @Path("platform") platform: string,
    @Query("cursor") cursor?: string
  ): Promise<T > {
    return { } as T;
  }

  /** Import content */
  @Post("/integrations/{platform}/import")
  async importContent(
    @Path("platform") platform: string,
    @Body() body: ImportRequestBody
  ): Promise<{
    message: string;
    accessToken?: string;
    expiresIn?: number;
  }> {
    return {
      message: "",
    };
  }

  /** Cancel import */
  @Post("/integrations/{platform}/import/cancel")
  async cancelImport(
    @Path("platform") platform: string,
    @Body() body: { confirm: true }
  ): Promise<ImportCancellationResponse> {
    void body;
    return {
      message: "",
    };
  }

  /** Authoritative import queue state for the current user */
  @Get<ImportJobStatusResponse>("/integrations/{platform}/import/status")
  async getImportStatus(
    @Path("platform") platform: string
  ): Promise<ImportJobStatusResponse> {
    return {
      platform,
      jobId: null,
      status: "not_found",
      progress: 0,
    };
  }

  /** Enable sync */
  @Post("/integrations/{platform}/sync/enable")
  async enableSync(
    @Path("platform") platform: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return {
      success: false,
      message: "",
    };
  }

  /** Disable sync */
  @Post("/integrations/{platform}/sync/disable")
  async disableSync(
    @Path("platform") platform: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return {
      success: false,
      message: "",
    };
  }

  //delete
  @Delete("/integrations/{platform}/disconnect")
  async disconnect(
    @Path("platform") platform: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return {
      success: false,
      message: "",
    };
  }

  /** Get connected platform names for the current user */
  @Get<{ platforms: string[] }>("/integrations/me/linked-accounts")
  async getLinkedAccounts(): Promise<{ platforms: string[] }> {
    return { platforms: [] };
  }

  /** Upload a media file and return its URL */
  @Post<{
    url: string;
    uploadId?: string;
    r2Key?: string;
    fileSize?: number;
    contentType?: string;
    publicUrl?: string;
  }>("/integrations/upload")
  async uploadMedia(@Body() body: FormData): Promise<{
    url: string;
    uploadId?: string;
    r2Key?: string;
    fileSize?: number;
    contentType?: string;
    publicUrl?: string;
  }> {
    return { url: "" };
  }

  /** Submit content for publishing to a platform */
  @Post<{ publishJobId: string; platform: string; status: string }>(
    "/integrations/publish/content"
  )
  async publishContent(
    @Body()
    body: {
      linkedAccountId: string;
      platform: string;
      uploadId: string;
      title: string;
      description?: string;
      tags?: string[];
      visibility?: 'public' | 'private' | 'unlisted';
      publishAt?: string;
      postType?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<{ publishJobId: string; platform: string; status: string }> {
    return { publishJobId: "", platform: "", status: "" };
  }

  /** Get publish job status */
  @Get<{
    id: string;
    platform: string;
    status: string;
    progress: number;
    statusMessage?: string;
    platformContentId?: string;
    platformContentUrl?: string;
    attempts: number;
    lastError?: string;
    nextRetryAt?: string;
    createdAt: string;
  }>("/integrations/publish/status/{publishJobId}")
  async getPublishStatus(
    @Path("publishJobId") publishJobId: string
  ): Promise<{
    id: string;
    platform: string;
    status: string;
    progress: number;
    statusMessage?: string;
    platformContentId?: string;
    platformContentUrl?: string;
    attempts: number;
    lastError?: string;
    nextRetryAt?: string;
    createdAt: string;
  }> {
    return {
      id: "",
      platform: "",
      status: "",
      progress: 0,
      attempts: 0,
      createdAt: "",
    };
  }

  /** Media and scheduling constraints exposed by registered publishers */
  @Get<PublishCapabilities>("/integrations/publish/capabilities")
  async getPublishCapabilities(): Promise<PublishCapabilities> {
    return {};
  }

  /* --------------------------------------------------------- the calendar */

  /**
   * Everything scheduled, publishing or published between two instants.
   *
   * The range is required rather than defaulted, because only the client knows
   * which window it is showing and in which timezone.
   */
  @Get<PublishCalendarResponse>("/integrations/publish/calendar")
  async getPublishCalendar(
    @Query("from") from: string,
    @Query("to") to: string,
    @Query("platforms") platforms?: string,
  ): Promise<PublishCalendarResponse> {
    return { from, to, items: [], countsByDay: {}, countsByPlatform: {} };
  }

  /** The list view: every post, newest first, filterable by status and channel. */
  @Get<PublishQueueResponse>("/integrations/publish/queue")
  async getPublishQueue(
    @Query("status") status?: string,
    @Query("platforms") platforms?: string,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number,
  ): Promise<PublishQueueResponse> {
    return { items: [], total: 0, limit: 25, offset: 0 };
  }

  /**
   * The accounts a post can be sent to, each with the id the publish path needs.
   *
   * Distinct from `getLinkedAccounts`, which returns platform names only. That
   * is enough to draw connect buttons and not enough to publish.
   */
  @Get<PublishChannelsResponse>("/integrations/publish/channels")
  async getPublishChannels(): Promise<PublishChannelsResponse> {
    return { channels: [], connectedButNotPublishable: [] };
  }

  /** Compose once, publish to many. One group, one result per channel. */
  @Post<CreatePostResponse>("/integrations/publish/posts")
  async createPost(
    @Body() body: CreatePostRequest,
  ): Promise<CreatePostResponse> {
    return { groupId: "", channels: [], accepted: 0, rejected: 0 };
  }

  /**
   * Move a post, or publish it now.
   *
   * `scheduledAt: null` means now. Omitting it is rejected rather than treated
   * as now, because turning a malformed request into an immediate publication
   * is the one outcome nobody can undo.
   */
  @Patch<PublishItem[]>("/integrations/publish/{publishJobId}/schedule")
  async reschedulePublish(
    @Path("publishJobId") publishJobId: string,
    @Body()
    body: {
      scheduledAt: string | null;
      timezone?: string;
      applyToGroup?: boolean;
    },
  ): Promise<PublishItem[]> {
    return [];
  }

  @Delete<PublishItem[]>("/integrations/publish/{publishJobId}")
  async cancelPublish(
    @Path("publishJobId") publishJobId: string,
    @Body() body?: { applyToGroup?: boolean },
  ): Promise<PublishItem[]> {
    return [];
  }

  @Post<PublishItem>("/integrations/publish/{publishJobId}/duplicate")
  async duplicatePublish(
    @Path("publishJobId") publishJobId: string,
    @Body() body: { scheduledAt: string | null; timezone?: string },
  ): Promise<PublishItem> {
    return {} as PublishItem;
  }

  /* ------------------------------------------------------- AI generation */

  /** Whether this deployment has generation configured at all. */
  @Get<{ available: boolean }>("/integrations/generate/status")
  async getGenerationStatus(): Promise<{ available: boolean }> {
    return { available: false };
  }

  @Post<DraftPostResponse>("/integrations/generate/post")
  async generatePost(
    @Body()
    body: {
      brief: string;
      platforms: string[];
      sourceText?: string;
      mediaDescription?: string;
      linkUrl?: string;
      includeHashtags?: boolean;
      variantsPerPlatform?: number;
      brand?: GenerationBrand;
    },
  ): Promise<DraftPostResponse> {
    return {} as DraftPostResponse;
  }

  @Post<{ hashtags: string[] }>("/integrations/generate/hashtags")
  async generateHashtags(
    @Body()
    body: {
      text: string;
      platform: string;
      count?: number;
      brand?: GenerationBrand;
    },
  ): Promise<{ hashtags: string[] }> {
    return { hashtags: [] };
  }

  @Post<ReplyDraftResponse>("/integrations/generate/replies")
  async generateReplies(
    @Body()
    body: {
      comment: string;
      postContext?: string;
      platform: string;
      count?: number;
      brand?: GenerationBrand;
    },
  ): Promise<ReplyDraftResponse> {
    return {} as ReplyDraftResponse;
  }
}
