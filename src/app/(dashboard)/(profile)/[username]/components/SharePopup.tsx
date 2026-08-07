"use client";

import type { UserProfileType } from "@/types/account/profile.type";
import SharedSharePopup from "@/components/share/SharePopup";

const SharePopup = ({
	user,
	username,
}: {
	user: UserProfileType | undefined;
	username: string;
}) => (
	<SharedSharePopup
		url={`/${encodeURIComponent(username)}`}
		heading="Share Profile"
		preview={{
			avatarSrc: user?.photo,
			name: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || username,
			handle: username,
		}}
	/>
);

export default SharePopup;
