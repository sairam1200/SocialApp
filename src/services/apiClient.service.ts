import { TokenService, AccountService, UserService, SearchService, YoutubeService, FacebookService, DiscoverService, ProjectService, JobService } from "./api";
import { interceptors } from "@/interceptors";
import { createApiService } from 'restfit';
import { IntegrationsService } from "./api/integrations.service";
import { OnboardingService } from "./onboarding.service";
import { NewsletterService } from "./api/newsletter.service";
import { BookmarkService } from "./api/bookmark.service";
import { CommunityService } from "./api/community.service";
import { AdminService } from "./api/admin.service";
import { AnalyticsService } from "./api/analytics.service";
import { PlaylistService } from "./api/playlist.service";
type ApiServiceMap = {
  Token: typeof TokenService;
  Account: typeof AccountService;
  Integration: typeof IntegrationsService;
  Youtube: typeof YoutubeService;
  Facebook: typeof FacebookService;
  User: typeof UserService;
  Search: typeof SearchService;
  Onboarding: typeof OnboardingService;
  Discover: typeof DiscoverService;
  Newsletter: typeof NewsletterService;
  Project: typeof ProjectService;
  Job: typeof JobService;
  Bookmark: typeof BookmarkService;
  Community: typeof CommunityService;
  Admin: typeof AdminService;
  Analytics: typeof AnalyticsService;
  Playlist: typeof PlaylistService;
};

/**
 * Where requests go.
 *
 * `next.config.ts` rewrites `/api/v1/*` to the backend, so same-origin is the
 * correct default and the only one that works without configuration. The
 * template-literal form this replaced turned a missing variable into the
 * *string* `"undefined"`, and every request then went to `/undefined/...` —
 * resolved relative to the current page, so it 404'd quietly instead of
 * failing loudly, and did it differently on every route.
 *
 * Set the variable to point somewhere else; leave it unset to use the rewrite.
 */
export const API_BASE_URL = "/api/v1";

export const apiClient = createApiService<ApiServiceMap>(
  {
    baseUrl: API_BASE_URL,
    headers: {
      
      ...(process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_CLIENT_ORIGIN
        ? { "x-client-origin": process.env.NEXT_PUBLIC_CLIENT_ORIGIN }
        : {}),
    },
   
authorization: async () => {
  // Browser requests use the same-origin API rewrite, so the httpOnly session
  // cookie is sent automatically. Returning a script-readable token here would
  // undo the cookie boundary and expose the session to XSS.
  return null;
},
    wrapResponses: true,
    authorizationType: "Bearer",
    responseInterceptors: interceptors,
  },
  {
    Token: TokenService,
    Account: AccountService,
    Integration: IntegrationsService,
    Youtube: YoutubeService,
    Facebook: FacebookService,
    User: UserService,
    Search: SearchService,
    Onboarding: OnboardingService,
    Discover: DiscoverService,
    Newsletter: NewsletterService,
    Project: ProjectService,
    Job: JobService,
    Bookmark: BookmarkService,
    Community: CommunityService,
    Admin: AdminService,
    Analytics: AnalyticsService,
    Playlist: PlaylistService,
  }
);

export type ApiClient = typeof apiClient;
