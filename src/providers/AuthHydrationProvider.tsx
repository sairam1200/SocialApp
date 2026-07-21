"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useAuthUserStore } from "@/store/auth-user.store";
import { AuthUserType } from "@/types/auth/authUser.type";
import { ClaimTypes } from "@/constants/globals";
import { PROTECTED_ROUTES, ONBOARDING_INCOMPLETE_REDIRECT } from "@/constants/routes";
import { Preloader } from "@/components/preloader";

interface AuthHydrationProviderProps {
	jwtUser?: Record<string, unknown> | null;
	children: React.ReactNode;
	isAuthenticated?: boolean;
}

const PROTECTED_PATHS = PROTECTED_ROUTES;

export default function AuthHydrationProvider({
	jwtUser,
	isAuthenticated = false,
	children,
}: AuthHydrationProviderProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [hydrated, setHydrated] = useState(false);

	const authUser: AuthUserType | null = useMemo(() => {
		if (!isAuthenticated || !jwtUser) return null;

		return {
			id: jwtUser[ClaimTypes.UserId] as string,
			username: jwtUser[ClaimTypes.UserName] as string,
			email: jwtUser[ClaimTypes.Email] as string,
			firstName: jwtUser[ClaimTypes.GivenName] as string | undefined,
			lastName: jwtUser[ClaimTypes.FamilyName] as string | undefined,
			fullName: jwtUser[ClaimTypes.FullName] as string | undefined,
			photo: jwtUser[ClaimTypes.ProfileImage] as string | undefined,
			userType: jwtUser[ClaimTypes.UserType] as string | undefined,
			roles: Array.isArray(jwtUser[ClaimTypes.Roles])
				? (jwtUser[ClaimTypes.Roles] as string[])
				: jwtUser[ClaimTypes.Roles]
				? [jwtUser[ClaimTypes.Roles] as string]
				: [],
			permissions: Array.isArray(jwtUser[ClaimTypes.Permission])
				? (jwtUser[ClaimTypes.Permission] as string[])
				: jwtUser[ClaimTypes.Permission]
				? [jwtUser[ClaimTypes.Permission] as string]
				: [],
			securityStamp: jwtUser[ClaimTypes.SecurityStamp] as string | undefined,
			concurrencyStamp: jwtUser[ClaimTypes.ConcurrencyStamp] as string | undefined,
			twoFARequired: Boolean(jwtUser[ClaimTypes.TwoFARequired]),
		};
	}, [jwtUser, isAuthenticated]);

	// Token refresh: update Zustand when jwtUser changes after initial load
	useEffect(() => {
		if (authUser) {
			useAuthUserStore.setState({ authUser, isAuthenticated: true });
		}
		setHydrated(true);
	}, [authUser]);

	// Onboarding route guard (runs after hydration)
	useEffect(() => {
		if (!hydrated) return;

		if (isAuthenticated) {
			// Use localStorage JWT as the source of truth for onboardingStep
			// (the server-prop jwtUser may be stale during client-side navigation)
			let effectiveOnboardingStep = jwtUser?.onboardingStep as string | undefined;

			if (typeof window !== 'undefined') {
				const localToken = localStorage.getItem("accessToken");
				if (localToken) {
					try {
						const decoded = jwtDecode<Record<string, unknown>>(localToken);
						if (decoded?.onboardingStep) {
							effectiveOnboardingStep = decoded.onboardingStep as string;
						}
					} catch {
						// ignore decode errors
					}
				}
			}

			const isCompleted = effectiveOnboardingStep === 'Completed';

			if (!isCompleted) {
				const onProtectedRoute = PROTECTED_PATHS.some((route) =>
					pathname.startsWith(route)
				);
				if (onProtectedRoute) {
					router.replace(ONBOARDING_INCOMPLETE_REDIRECT);
					return;
				}
			} else if (pathname.startsWith('/onboarding')) {
				router.replace('/discover');
				return;
			}
		}
	}, [hydrated, isAuthenticated, jwtUser, pathname, router]);

	if (!hydrated) {
		return <Preloader />;
	}

	return <>{children}</>;
}
