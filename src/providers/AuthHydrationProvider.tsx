"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthUserStore } from "@/store/auth-user.store";
import { AuthUserType } from "@/types/auth/authUser.type";
import { isProtectedPath, ONBOARDING_INCOMPLETE_REDIRECT } from "@/constants/routes";
import { Preloader } from "@/components/preloader";
import type { CurrentUserResponseType } from "@/types/auth/login.type";
import { clearLegacyProviderTokenCookiesAction } from "@/actions/token.actions";

interface AuthHydrationProviderProps {
	children: React.ReactNode;
	isAuthenticated?: boolean;
	initialUser?: CurrentUserResponseType | null;
}

export default function AuthHydrationProvider({
	isAuthenticated = false,
	initialUser = null,
	children,
}: AuthHydrationProviderProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [hydrated, setHydrated] = useState(false);
	const legacyCleanupAttempted = useRef(false);

	const authUser: AuthUserType | null = useMemo(() => {
		if (!isAuthenticated || !initialUser) return null;

		return {
			id: initialUser.id,
			username: initialUser.username ?? "",
			email: initialUser.email,
			firstName: initialUser.firstName,
			lastName: initialUser.lastName,
			fullName: initialUser.fullName,
			photo: initialUser.photo,
			userType: initialUser.userType,
			roles: initialUser.roles ?? [],
			permissions: initialUser.permissions ?? [],
		};
	}, [initialUser, isAuthenticated]);

	// Hydrate Zustand + onboarding route guard (single effect to prevent
	// children rendering before the onboarding check completes).
	useEffect(() => {
		if (isAuthenticated && !legacyCleanupAttempted.current) {
			legacyCleanupAttempted.current = true;
			void clearLegacyProviderTokenCookiesAction();
		} else if (!isAuthenticated) {
			legacyCleanupAttempted.current = false;
		}

		if (authUser) {
			useAuthUserStore.setState({ authUser, isAuthenticated: true });
		} else if (!isAuthenticated) {
			useAuthUserStore.setState({ authUser: null, isAuthenticated: false });
		}

		if (isAuthenticated && initialUser) {
			const effectiveOnboardingStep = initialUser.onboardingStep;

			const isCompleted = effectiveOnboardingStep === 'Completed';

			if (!isCompleted) {
				const onProtectedRoute = isProtectedPath(pathname);
				if (onProtectedRoute) {
					router.replace(ONBOARDING_INCOMPLETE_REDIRECT);
					return;
				}
			} else if (pathname.startsWith('/onboarding')) {
				router.replace('/discover');
				return;
			}
		}

		setHydrated(true);
	}, [authUser, initialUser, isAuthenticated, pathname, router]);

	if (!hydrated) {
		return <Preloader />;
	}

	return <>{children}</>;
}
