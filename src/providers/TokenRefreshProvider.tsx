"use client";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
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

  const isAuthRoute =
	AUTH_ROUTES.some((route) =>
		pathname.startsWith(route)
	) || pathname.startsWith("/api/oauth");

  // Initialize token refresh but don't block rendering
  useTokenRefresh(isAuthRoute);

  return <>{children}</>;
}
