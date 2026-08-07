import { ServiceResponse } from "../serviceResponse.type";
import { UserType } from "./user.type";

export type UserProfileType = UserType & ServiceResponse & {
	photoPrivacy: UserPhotoPrivacy;
	linkedAccounts: LinkedAccountType[];
	manualProfiles: ManualProfileType[];
	followersCount: number;
	followingCount: number;
	totalPosts: number;
	isFollowing?: boolean;
	isGuestView: boolean;
};

export type PublicProfileModel = {
	id: string;
	userName: string;
	firstName: string;
	lastName: string;
	bio: string | null;
	profileImage: string | null;
	followersCount?: number;
	followingCount: number;
	connectedPlatformsCount: number;
	linkedAccounts: {
        id: string;
        platform: string;
    }[];
	totalPosts: number;
	engagementRate: number;
	niche: string | null;
	verified: boolean;
	isFollowing?: boolean;
};

export type DiscoverCreatorsResponse = {
	profiles: PublicProfileModel[];
	page: number;
	limit: number;
	totalResults: number;
	hasNextPage?: boolean;
};

export type LinkedAccountType = {
	id: string;
	username: string;
	isImported: boolean;
	externalId: string;
	externalUrl: string | null;
	followersCount: number;
	followingCount: number;
	isVerified: boolean;
	platform: string;
	profileImage: string;
	syncEnabled?: boolean;
	lastSyncedAt?: string | null;
};

export type CreateManualProfileType = {
	url: string;
	platform: string;
	icon: string;
}

export type UpdateManualProfileType = CreateManualProfileType & {
	id: string;
}

export type ManualProfileType = UpdateManualProfileType & ServiceResponse & {
	displayOrder?: number;
	user: {
		userName: string;
		firstName: string;
		lastName: string;
		profileImage: string;
	};
}

export type ManualProfileReorderRequestType = {
	id: string;
	displayOrder: number;
}

export type UserPhotoPrivacyDto = {
	privacy: UserPhotoPrivacy;
};

export type UserPhotoPrivacy = "Everyone" | "Interactions";

export type FacebookProfileType = {
	id: string;
	name: string;
	email: string;
	userId: string;
	userName: string;
	facebookId: string;
	allowImport: boolean;
	profileImage: string;
	followersCount: number;
	followingCount: number;
}

export type InstagramProfileType = {
	id: string;
	email: string;
	userName: string;
	biography: string;
	mediaCount: number;
	websiteUrl: string;
	accountType: string;
	instagramId: string;
	allowImport: boolean;
	profileImage: string;
	followersCount: number;
	followingCount: number;
}

export type LinkedInProfileType = {
	id: string;
	email: string;
	userName: string;
	firstName: string;
	lastName: string;
	headline: string;
	industry: string;
	location: string;
	linkedInId: string;
	allowImport: boolean;
	profileImage: string;
	followersCount: number;
	followingCount: number;
}

export type PinterestProfileType = {
	id: string;
	email: string;
	userId: string;
	userName: string;
	pinterestId: string;
	profileImage: string;
	followersCount: number;
	followingCount: number;
	monthlyViews: number;
	allowImport: boolean;
	websiteUrl: string;
	pinCount: number;
	about: string;
}

export type RedditProfileType = {
	id: string;
	userId: string;
	redditId: string;
	userName: string;
	profileImage: string;
	allowImport: boolean;
	karma: {
		link: number;
		comment: number;
		total: number;
	};
	isVerified: boolean;
	isGold: boolean;
	isMod: boolean;
	hasVerifiedEmail: boolean;
	over18: boolean;
	redditUrl: string;
	description: string;
	displayName: string;
	createdAt: string;
}

export type TiktokProfileType = {
	id: string;
	username: string;
	displayName: string;
	avatarUrl: string;
	followersCount: number;
	followingCount: number;
	likesCount: number;
	videoCount: number;
	verified: boolean;
}

export type TwitterProfileType = {
	id: string;
	name: string;
	email: string;
	userId: string;
	userName: string;
	twitterId: string;
	description: string;
	allowImport: boolean;
	profileImage: string;
	countryCodes: string[];
	followersCount: number;
	followingCount: number;
	pinnedTweetId: string;
	listedCount: number;
	tweetCount: string;
	protected: boolean;
	createdAt: string;
	verified: boolean;
	location: string;
	entities: unknown;
	url: string;
}

export type YoutubeProfileType = {
	id: string;
	hd: string;
	name: string;
	email: string;
	userId: string;
	locale: string;
	userName: string;
	youtubeId: string;
	allowImport: boolean;
	profileImage: string;
	followersCount: number;
	followingCount: number;
	channel: {
		id: string;
		title: string;
		viewCount: number;
		description: string;
		videoCount: number;
		thumbnail: string;
	};
}
