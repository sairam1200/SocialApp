"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AccentThemeProvider } from "@/providers/ThemeProvider";
import { ColorSchemeProvider } from "@/providers/ColorSchemeProvider";
import TokenRefreshProvider from "@/providers/TokenRefreshProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import AuthHydrationProvider from "@/providers/AuthHydrationProvider";
import { HttpContextProvider } from "@/providers/HttpContextProvider";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { WebSocketEventHandlers } from "@/components/websocket/WebSocketEventHandlers";
import type { CurrentUserResponseType } from "@/types/auth/login.type";
import { UploadProvider } from "@/providers/UploadProvider";
import { UploadTray } from "@/components/uploads/UploadTray";

interface AppProvidersProps {
  children: ReactNode;
  initialUser: CurrentUserResponseType | null;
  isAuthenticated: boolean;
}

const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/confirm-email"];

export function AppProviders({ children, initialUser, isAuthenticated }: AppProvidersProps) {
  const pathname = usePathname();
  const isPublicPage = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  return (
    <QueryProvider>
      <ColorSchemeProvider>
      <AccentThemeProvider>
        <AuthHydrationProvider
          initialUser={initialUser}
          isAuthenticated={isAuthenticated}
        >
          <HttpContextProvider>
            <TokenRefreshProvider>
              <UploadProvider>
                {isPublicPage ? (
                  children
                ) : (
                  <WebSocketProvider>
                    {children}
                    {isAuthenticated && <WebSocketEventHandlers />}
                  </WebSocketProvider>
                )}
                {isAuthenticated && <UploadTray />}
              </UploadProvider>
            </TokenRefreshProvider>
          </HttpContextProvider>
        </AuthHydrationProvider>
      </AccentThemeProvider>
      </ColorSchemeProvider>
    </QueryProvider>
  );
}
