"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
	const setAuthUser = useAuthUserStore((state) => state.setAuthUser);
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

	useEffect(() => {
		if (authUser) {
			setAuthUser(authUser);
		}
		setHydrated(true);
	}, [authUser, setAuthUser]);

	// Onboarding route guard (runs after hydration)
	useEffect(() => {
		if (!hydrated) return;

		if (isAuthenticated && jwtUser) {
			const onboardingStep = jwtUser.onboardingStep as string | undefined;
			const isCompleted = onboardingStep === 'Completed';

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
