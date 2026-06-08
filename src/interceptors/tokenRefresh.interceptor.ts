// src/interceptors/tokenRefresh.interceptor.ts

import { ResponseInterceptorConfig } from "restfit";
import { triggerTokenRefresh } from "@/hooks/useTokenRefresh";

export const tokenRefreshInterceptor: ResponseInterceptorConfig = {
  handler: (response) => {
    if (typeof window === "undefined") {
      return;
    }

    const refreshRequired =
      response.headers?.[
      "x-token-refresh-required"
      ] ??
      response.headers?.[
      "X-Token-Refresh-Required"
      ];

    if (
      refreshRequired ===
      "true"
    ) {
      triggerTokenRefresh().catch(
        (error) => {
          if (
            process.env
              .NODE_ENV ===
            "development"
          ) {
            console.error(
              "Failed to trigger token refresh:",
              error
            );
          }
        }
      );
    }
  },
};