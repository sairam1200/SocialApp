import { Body, Delete, Get, Patch, Path, Post, Query } from "restfit";
import type {
	UnifiedSearchResponse,
	SearchMode,
} from "@/types/unified-search.type";
import type {
	Balance,
	CalendarItem,
	ComposeInput,
	Conversation,
	CourseDetail,
	CourseSummary,
	CommunityProfile,
	CreatorAnalytics,
	EngagementSignal,
	ExploreResult,
	FeedMode,
	FeedPage,
	FeedPreferences,
	FeedPreferencesResponse,
	Message,
	Post as CommunityPost,
	ReactionType,
	StreamIngest,
	LiveCategory,
	StreamSummary,
	Thread,
} from "@/types/community.type";

/**
 * The Community API client.
 *
 * One service for the whole social layer rather than eight, because the
 * surfaces share types and callers routinely need two of them in one screen —
 * a profile page reads a profile, a feed and a storefront. Splitting it would
 * mean three imports and three query-key namespaces for one page.
 *
 * Bodies are returned by the decorator, so the method bodies here are
 * unreachable placeholders; `restfit` replaces them. That is the existing
 * convention in this directory, not something new.
 */
export class CommunityService {
	/* ------------------------------------------------------------------ feed */

	@Get("/community/feed")
	async getFeed(
		@Query("mode") mode?: FeedMode,
		@Query("limit") limit?: number,
		@Query("before") before?: string,
		@Query("topics") topics?: string,
		@Query("kinds") kinds?: string,
	): Promise<FeedPage> {
		return { mode: "latest", items: [], nextCursor: null, hasMore: false };
	}

	@Get("/community/profiles/{handle}/feed")
	async getProfileFeed(
		@Path("handle") handle: string,
		@Query("limit") limit?: number,
		@Query("before") before?: string,
		@Query("includeFollowing") includeFollowing?: boolean,
	): Promise<FeedPage> {
		return { mode: "latest", items: [], nextCursor: null, hasMore: false };
	}

	@Get("/community/posts/{postId}")
	async getPost(@Path("postId") postId: string): Promise<CommunityPost> {
		return {} as CommunityPost;
	}

	@Get("/community/posts/{postId}/thread")
	async getThread(
		@Path("postId") postId: string,
		@Query("limit") limit?: number,
	): Promise<Thread> {
		return {} as Thread;
	}

	@Post("/community/posts/{postId}/react")
	async react(
		@Path("postId") postId: string,
		@Body() body: { type: ReactionType },
	): Promise<{ reacted: boolean; likesCount: number }> {
		return { reacted: false, likesCount: 0 };
	}

	@Post("/community/posts/{postId}/vote")
	async vote(
		@Path("postId") postId: string,
		@Body() body: { optionId: string },
	): Promise<{ ok: true }> {
		return { ok: true };
	}

	@Post("/community/posts/{postId}/share")
	async share(
		@Path("postId") postId: string,
		@Body() body: { channel: string },
	): Promise<{ referralCode: string; url: string }> {
		return { referralCode: "", url: "" };
	}

	@Post("/community/posts/{postId}/not-interested")
	async notInterested(@Path("postId") postId: string): Promise<{ ok: true }> {
		return { ok: true };
	}

	@Post("/community/signals")
	async sendSignals(
		@Body() body: { events: EngagementSignal[] },
	): Promise<{ recorded: number }> {
		return { recorded: 0 };
	}

	/* --------------------------------------------------------- unified search */

	/**
	 * Search everything, in one shape.
	 *
	 * Lives on the Community service rather than Search because the engine
	 * behind it is the Community recommender — the same fusion and the same
	 * topic affinities. Splitting them would be two clients for one idea.
	 */
	@Get("/search/unified")
	async unifiedSearch(
		@Query("keyword") keyword?: string,
		@Query("mode") mode?: SearchMode,
		@Query("page") page?: number,
		@Query("limit") limit?: number,
		@Query("platforms") platforms?: string,
		@Query("kinds") kinds?: string,
		@Query("topics") topics?: string,
		@Query("seed") seed?: string,
	): Promise<UnifiedSearchResponse> {
		return {
			mode: "all",
			keyword: "",
			items: [],
			total: 0,
			hasMore: false,
			sources: [],
			kinds: [],
			topics: [],
		};
	}

	/* ------------------------------------------------------ algorithm controls */

	@Get("/community/feed/preferences")
	async getFeedPreferences(): Promise<FeedPreferencesResponse> {
		return {} as FeedPreferencesResponse;
	}

	@Post("/community/feed/preferences")
	async setFeedPreferences(
		@Body() body: Partial<FeedPreferences>,
	): Promise<{ preferences: FeedPreferences }> {
		return {} as { preferences: FeedPreferences };
	}

	@Post("/community/feed/topics/{topic}")
	async setTopicPreference(
		@Path("topic") topic: string,
		@Body() body: { isPinned?: boolean; isMuted?: boolean; weight?: number },
	): Promise<{ ok: true }> {
		return { ok: true };
	}

	/* -------------------------------------------------------------- profiles */

	@Get("/community/me")
	async getMe(@Query("invite") invite?: string): Promise<CommunityProfile> {
		return {} as CommunityProfile;
	}

	@Get("/community/profiles/{handle}")
	async getProfile(@Path("handle") handle: string): Promise<CommunityProfile> {
		return {} as CommunityProfile;
	}

	@Patch("/community/me")
	async updateProfile(
		@Body() body: Partial<CommunityProfile> & { topics?: string[] },
	): Promise<CommunityProfile> {
		return {} as CommunityProfile;
	}

	@Get("/community/handles/{handle}/available")
	async isHandleAvailable(
		@Path("handle") handle: string,
	): Promise<{ available: boolean; normalised: string; reason?: string }> {
		return { available: false, normalised: "" };
	}

	@Get("/community/audiences/{audience}")
	async listAudience(@Path("audience") audience: string): Promise<unknown[]> {
		return [];
	}

	@Post("/community/audiences/{audience}/{profileId}")
	async setAudience(
		@Path("audience") audience: string,
		@Path("profileId") profileId: string,
		@Body() body: { included: boolean },
	): Promise<{ ok: true }> {
		return { ok: true };
	}

	@Post("/community/profiles/{profileId}/mute")
	async mute(
		@Path("profileId") profileId: string,
		@Body() body: { isBlock?: boolean; enabled?: boolean },
	): Promise<{ ok: true }> {
		return { ok: true };
	}

	/* -------------------------------------------------------------- composer */

	@Post("/community/posts")
	async compose(@Body() body: ComposeInput): Promise<CommunityPost> {
		return {} as CommunityPost;
	}

	@Patch("/community/posts/{postId}")
	async updatePost(
		@Path("postId") postId: string,
		@Body() body: Partial<ComposeInput>,
	): Promise<CommunityPost> {
		return {} as CommunityPost;
	}

	@Post("/community/posts/{postId}/publish")
	async publishPost(@Path("postId") postId: string): Promise<CommunityPost> {
		return {} as CommunityPost;
	}

	@Delete("/community/posts/{postId}")
	async deletePost(@Path("postId") postId: string): Promise<{ ok: true }> {
		return { ok: true };
	}

	@Get("/community/drafts")
	async getDrafts(@Query("limit") limit?: number): Promise<CommunityPost[]> {
		return [];
	}

	@Get("/community/calendar")
	async getCalendar(
		@Query("from") from?: string,
		@Query("to") to?: string,
		@Query("statuses") statuses?: string,
	): Promise<{ items: CalendarItem[] }> {
		return { items: [] };
	}

	/* ----------------------------------------------------- explore and growth */

	@Get("/community/explore")
	async explore(
		@Query("q") q?: string,
		@Query("limit") limit?: number,
	): Promise<ExploreResult> {
		return {} as ExploreResult;
	}

	@Get("/community/analytics")
	async getAnalytics(@Query("days") days?: number): Promise<CreatorAnalytics> {
		return {} as CreatorAnalytics;
	}

	@Post("/community/invites")
	async createInvite(
		@Body() body: { email?: string },
	): Promise<{ code: string; url: string; status: string }> {
		return { code: "", url: "", status: "sent" };
	}

	@Get("/community/invites")
	async listInvites(): Promise<{
		acceptedCount: number;
		rewardedCount: number;
		rewardLabel: string | null;
		invites: Array<{
			code: string;
			invitedEmail: string | null;
			status: string;
			acceptedOn?: string | null;
			expiresOn?: string | null;
		}>;
	}> {
		return {
			acceptedCount: 0,
			rewardedCount: 0,
			rewardLabel: null,
			invites: [],
		};
	}

	@Post("/community/shares/{referralCode}/visit")
	async recordShareVisit(
		@Path("referralCode") referralCode: string,
	): Promise<{ ok: true }> {
		return { ok: true };
	}

	/* -------------------------------------------------------------- commerce */

	@Get("/community/balance")
	async getBalance(): Promise<Balance> {
		return {} as Balance;
	}

	@Post("/community/profiles/{profileId}/tip")
	async tip(
		@Path("profileId") profileId: string,
		@Body() body: { amountMinor: number; postId?: string; message?: string },
	): Promise<{ id: string; amountMinor: string }> {
		return { id: "", amountMinor: "0" };
	}

	@Post("/community/payouts")
	async requestPayout(
		@Body() body: { amountMinor: number },
	): Promise<{ id: string; status: string; amountMinor: string }> {
		return { id: "", status: "requested", amountMinor: "0" };
	}

	@Get("/community/campaigns")
	async listCampaigns(@Query("topics") topics?: string): Promise<unknown[]> {
		return [];
	}

	@Get("/community/campaigns/for-me")
	async campaignsForMe(): Promise<unknown[]> {
		return [];
	}

	/* ----------------------------------------------------------------- live */

	@Get("/community/live")
	async listLive(
		@Query("limit") limit?: number,
		@Query("category") category?: string,
		@Query("sort") sort?: "viewers" | "recent",
	): Promise<StreamSummary[]> {
		return [];
	}

	@Get("/community/live/categories")
	async listLiveCategories(): Promise<LiveCategory[]> {
		return [];
	}

	@Get("/community/streams/{channelKey}")
	async getStream(
		@Path("channelKey") channelKey: string,
	): Promise<StreamSummary> {
		return {} as StreamSummary;
	}

	@Get("/community/stream/ingest")
	async getIngest(): Promise<StreamIngest> {
		return {} as StreamIngest;
	}

	@Post("/community/stream/ingest/rotate")
	async rotateIngestKey(): Promise<StreamIngest> {
		return {} as StreamIngest;
	}

	@Patch("/community/stream/settings")
	async updateStreamSettings(
		@Body() body: Record<string, unknown>,
	): Promise<Record<string, unknown>> {
		return {};
	}

	@Get("/community/streams/{streamId}/chat")
	async getStreamChat(
		@Path("streamId") streamId: string,
		@Query("limit") limit?: number,
	): Promise<
		Array<{
			id: string;
			body: string;
			author: { handle: string; displayName: string; avatarUrl?: string };
			createdOn: string;
		}>
	> {
		return [];
	}

	@Post("/community/streams/{streamId}/chat")
	async postStreamChat(
		@Path("streamId") streamId: string,
		@Body() body: { body: string },
	): Promise<{ id: string; createdOn: string }> {
		return { id: "", createdOn: "" };
	}

	/* ------------------------------------------------------------- learning */

	@Get("/community/courses")
	async listCourses(
		@Query("topics") topics?: string,
		@Query("level") level?: string,
	): Promise<CourseSummary[]> {
		return [];
	}

	@Get("/community/courses/{idOrSlug}")
	async getCourse(@Path("idOrSlug") idOrSlug: string): Promise<CourseDetail> {
		return {} as CourseDetail;
	}

	@Post("/community/courses/{idOrSlug}/enroll")
	async enroll(
		@Path("idOrSlug") idOrSlug: string,
	): Promise<{ status: string; progressPercent: number }> {
		return { status: "enrolled", progressPercent: 0 };
	}

	@Post("/community/courses/{courseId}/lessons/{lessonId}/complete")
	async completeLesson(
		@Path("courseId") courseId: string,
		@Path("lessonId") lessonId: string,
	): Promise<{ status: string; progressPercent: number; completedLessonIds: string[] }> {
		return { status: "in_progress", progressPercent: 0, completedLessonIds: [] };
	}

	@Post("/community/courses/{courseId}/lessons/{lessonId}/submit")
	async submitQuiz(
		@Path("courseId") courseId: string,
		@Path("lessonId") lessonId: string,
		@Body() body: { answers: number[] },
	): Promise<{
		score: number;
		passed: boolean;
		certification: {
			id: string;
			title: string;
			verificationCode: string;
			issuedOn: string;
		} | null;
	}> {
		return { score: 0, passed: false, certification: null };
	}

	@Get("/community/certifications/{code}/verify")
	async verifyCertification(@Path("code") code: string): Promise<{
		valid: boolean;
		title?: string;
		holder?: string;
		issuedOn?: string;
	}> {
		return { valid: false };
	}

	/* ------------------------------------------------------------- messaging */

	@Get("/community/conversations")
	async listConversations(
		@Query("limit") limit?: number,
	): Promise<Conversation[]> {
		return [];
	}

	@Post("/community/conversations")
	async openConversation(
		@Body() body: { profileId: string },
	): Promise<{ id: string }> {
		return { id: "" };
	}

	@Get("/community/conversations/{conversationId}/messages")
	async listMessages(
		@Path("conversationId") conversationId: string,
		@Query("limit") limit?: number,
	): Promise<Message[]> {
		return [];
	}

	@Post("/community/conversations/{conversationId}/messages")
	async sendMessage(
		@Path("conversationId") conversationId: string,
		@Body() body: { body?: string; sharedPostId?: string },
	): Promise<Message> {
		return {} as Message;
	}

	@Get("/community/conversations/unread-count")
	async unreadCount(): Promise<{ count: number }> {
		return { count: 0 };
	}

	@Post("/content/report")
	async reportContent(
		@Body() body: { subjectId: string; subjectKind: string; reason: string; detail?: string },
	): Promise<{ message: string }> {
		return { message: "REPORT_SUBMITTED" };
	}
}
