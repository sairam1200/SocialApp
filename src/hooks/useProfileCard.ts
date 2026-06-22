import { useMemo } from "react";
import { LinkedAccountType } from "@/types/account/profile.type";

export const useProfileCardProps = (
	account?: LinkedAccountType
) => {
	return useMemo(() => {
		if (!account) return null;

		return {
			profilePicSrc: account.profileImage,
			userName: account.username,
			userHandle: `@${account.username}`,
			category: account.platform,
			postCount: 0, // Update if available from API
			followerCount: account.followersCount,
			followingCount: account.followingCount,
			channelIcons: [account.platform],
		};
	}, [account]);
};