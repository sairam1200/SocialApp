"use client";
import { createContext, useContext, ReactNode, useMemo } from "react";
import { JwtPayload } from "@/types/jwtPayload.type";

interface HttpContextValue {
  user: JwtPayload | null;
  isAuthenticated: boolean;
}

const HttpContextClient = createContext<HttpContextValue | null>(null);

interface HttpContextProviderProps {
  children: ReactNode;
  user: JwtPayload | null;
  isAuthenticated: boolean;
}

export function HttpContextProvider({
  children,
  user,
  isAuthenticated,
}: HttpContextProviderProps) {

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
    }),
    [user, isAuthenticated]
  );

  return (
    <HttpContextClient.Provider value={contextValue}>
      {children}
    </HttpContextClient.Provider>
  );
}

// Full context hook (use when you need both values)
export function useHttpContext(): HttpContextValue {
  const context = useContext(HttpContextClient);
  if (!context) {
    throw new Error("useHttpContext must be used within HttpContextProvider");
  }
  return useMemo(() => context, [context]);
}

// Selector hooks - only re-render when specific value changes
export function useHttpContextUser(): JwtPayload | null {
  const context = useContext(HttpContextClient);
  if (!context) {
    throw new Error("useUser must be used within HttpContextProvider");
  }
  return context.user;
}

export function useHttpContextIsAuthenticated(): boolean {
  const context = useContext(HttpContextClient);
  if (!context) {
    throw new Error("useIsAuthenticated must be used within HttpContextProvider");
  }
  return context.isAuthenticated;
}
