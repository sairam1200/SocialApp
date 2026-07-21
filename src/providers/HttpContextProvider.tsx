"use client";
import { createContext, useContext, ReactNode, useMemo } from "react";
import { JwtPayload } from "@/types/jwtPayload.type";
import { useAuthUserStore } from "@/store/auth-user.store";
import { ClaimTypes } from "@/constants/globals";

interface HttpContextValue {
  user: JwtPayload | null;
  isAuthenticated: boolean;
}

const HttpContextClient = createContext<HttpContextValue | null>(null);

interface HttpContextProviderProps {
  children: ReactNode;
}

export function HttpContextProvider({
  children,
}: HttpContextProviderProps) {
  const authUser = useAuthUserStore((s) => s.authUser);
  const isAuth = useAuthUserStore((s) => s.isAuthenticated);

  const user: JwtPayload | null = useMemo(() => {
    if (!authUser) return null;
    return {
      [ClaimTypes.UserId]: authUser.id,
      [ClaimTypes.Email]: authUser.email,
      [ClaimTypes.UserName]: authUser.username,
      [ClaimTypes.UserType]: authUser.userType ?? "",
      [ClaimTypes.FullName]: authUser.fullName ?? "",
      [ClaimTypes.GivenName]: authUser.firstName ?? "",
      [ClaimTypes.FamilyName]: authUser.lastName ?? "",
      [ClaimTypes.ProfileImage]: authUser.photo ?? "",
      [ClaimTypes.SecurityStamp]: authUser.securityStamp ?? "",
      [ClaimTypes.ConcurrencyStamp]: authUser.concurrencyStamp ?? "",
      exp: 0,
    } as JwtPayload;
  }, [authUser]);

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: isAuth,
    }),
    [user, isAuth]
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
