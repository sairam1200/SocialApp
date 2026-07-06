import { useHttpContext } from "@/providers/HttpContextProvider";
import { ClaimTypes } from "@/constants/globals";

export function useIsOwnProfile(profileUserId?: string): boolean {
	const { user } = useHttpContext();
	const currentUserId = user?.[ClaimTypes.UserId];
	return !!profileUserId && !!currentUserId && profileUserId === currentUserId;
}
