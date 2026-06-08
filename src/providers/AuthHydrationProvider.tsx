"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthUserStore } from "@/store/auth-user.store";
import { AuthUserType } from "@/types/auth/authUser.type";
import { ClaimTypes } from "@/constants/globals";
import { Preloader } from "@/components/preloader";

interface AuthHydrationProviderProps {
	jwtUser?: Record<string, unknown> | null;
	children: React.ReactNode;
	isAuthenticated?: boolean;
}

export default function AuthHydrationProvider({
	jwtUser,
	isAuthenticated = false,
	children,
}: AuthHydrationProviderProps) {
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
		// Mark hydration complete after setting authUser
		setHydrated(true);
	}, [authUser, setAuthUser]);

	// Show preloader until authUser is set or if not authenticated
	if (!hydrated) {
		return <Preloader />;
	}

	return <>{children}</>;
}
