"use client";

import type { ReactNode } from "react";
import { AccentThemeProvider } from "@/providers/ThemeProvider";
import TokenRefreshProvider from "@/providers/TokenRefreshProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import AuthHydrationProvider from "@/providers/AuthHydrationProvider";
import { HttpContextProvider } from "@/providers/HttpContextProvider";
import { Toaster } from "react-hot-toast";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { WebSocketEventHandlers } from "@/components/websocket/WebSocketEventHandlers";
import { JwtPayload } from "@/types/jwtPayload.type";
import { ToasterClient } from "@/app/ToasterClient";

interface AppProvidersProps {
  children: ReactNode;
  jwtUser: JwtPayload | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

export function AppProviders({ children, jwtUser, accessToken, isAuthenticated }: AppProvidersProps) {
  console.log("APP PROVIDERS", {
  isAuthenticated,
  jwtUser,
  accessToken: !!accessToken,
});
  return (
    <QueryProvider>
      <AccentThemeProvider>
        <AuthHydrationProvider
      jwtUser={jwtUser}
      isAuthenticated={isAuthenticated}
    >
        <HttpContextProvider user={jwtUser} isAuthenticated={isAuthenticated}>
        <TokenRefreshProvider>
            <WebSocketProvider accessToken={accessToken}>
            <ToasterClient />
            {children}
            {isAuthenticated && <WebSocketEventHandlers />}
            </WebSocketProvider>
          </TokenRefreshProvider>
          
        </HttpContextProvider>
       </AuthHydrationProvider>
      </AccentThemeProvider>
    </QueryProvider>
  );
}
