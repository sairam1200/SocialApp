import { TokenService, AccountService, UserService, SearchService, YoutubeService, FacebookService } from "./api";
import { interceptors } from "@/interceptors";
import { createApiService } from 'restfit';
import { IntegrationsService } from "./api/integrations.service";
import { OnboardingService } from "./onboarding.service";
type ApiServiceMap = {
  Token: typeof TokenService;
  Account: typeof AccountService;
  Integration: typeof IntegrationsService;
  Youtube: typeof YoutubeService;
  Facebook: typeof FacebookService;
  User: typeof UserService;
  Search: typeof SearchService;
  Onboarding: typeof OnboardingService;
};

export const apiClient = createApiService<ApiServiceMap>(
  {
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
    headers: {
      
      ...(process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_CLIENT_ORIGIN
        ? { "x-client-origin": process.env.NEXT_PUBLIC_CLIENT_ORIGIN }
        : {}),
    },
   
authorization: async () => {
  if (typeof window === "undefined") {
    return null;
  }


  return localStorage.getItem(
    "accessToken"
  );
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
  }
);

export type ApiClient = typeof apiClient;
