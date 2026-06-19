import { TokenService, AccountService, UserService, SearchService } from "./api";
import { interceptors } from "@/interceptors";
import { createApiService } from 'restfit';
import { IntegrationsService } from "./api/integrations.service";
import { COOKIE_NAMES } from "@/constants/globals";
import { getCookie } from "@/utils/cookie.util";
import { OnboardingService } from "./onboarding.service";
type ApiServiceMap = {
  Token: typeof TokenService;
  Account: typeof AccountService;
  Integration: typeof IntegrationsService;
  User: typeof UserService;
  Search: typeof SearchService;
  Onboarding: typeof OnboardingService;
};

export const apiClient = createApiService<ApiServiceMap>(
  {
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
    headers: {
      "Content-Type": "application/json",
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
    User: UserService,
    Search: SearchService,
    Onboarding: OnboardingService,
  }
);

export type ApiClient = typeof apiClient;
