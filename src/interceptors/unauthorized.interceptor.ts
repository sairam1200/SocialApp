import { ResponseInterceptorConfig } from "restfit";
import { logoutFn } from "@/utils/logout.utitl";
import { getDeviceIdOrNull } from "@/utils/deviceId.util";
import { useAuthUserStore } from "@/store/auth-user.store";

export const unauthorizedInterceptor: ResponseInterceptorConfig = {
  handler: (response) => {
    if (response.status === 401) {
      if (typeof window === "undefined") return;

      const headers = response.headers || {};
      const tokenExpiredHeader = Object.keys(headers).find(
        key => key.toLowerCase() === 'token-expired'
      );

      if (tokenExpiredHeader && headers[tokenExpiredHeader]) {
        const currentPath = window.location.pathname;

        if (currentPath.startsWith("/login")) return;

        useAuthUserStore.getState().clearAuthUser();
        const redirectPath = `?redirect=${encodeURIComponent(currentPath)}`;
        void logoutFn(getDeviceIdOrNull()).then(() => {
          window.location.href = `/login${redirectPath}`;
        });
      }
    }
  }
};