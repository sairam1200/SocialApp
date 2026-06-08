"use client";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { Preloader } from "@/components/preloader";
import { usePathname } from "next/navigation";

const AUTH_ROUTES = [
	"/login",
	"/signup",
	"/forgot-password",
	"/reset-password",
	"/confirm-email",
	"/onboarding",
];

export default function TokenRefreshProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Skip token refresh logic on auth pages for better performance
  const isAuthRoute =
	AUTH_ROUTES.some((route) =>
		pathname.startsWith(route)
	) || pathname.startsWith("/api/oauth");

  const { shouldShowPreloader, isRefreshing, isInitialized } = useTokenRefresh(isAuthRoute);

  // Don't show preloader on auth routes
  if (!isAuthRoute && (!isInitialized || (isRefreshing && shouldShowPreloader))) {
    return <Preloader />;
  }

  return <>{children}</>;
}