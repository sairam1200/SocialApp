import { PublicProfileModel } from "@/types/account/profile.type";

export function normalizePublicProfile(raw: Partial<PublicProfileModel>): PublicProfileModel {
  return {
    ...raw,
    id: raw.id ?? "",
    userName: raw.userName ?? "",
    firstName: raw.firstName ?? "",
    lastName: raw.lastName ?? "",
    bio: raw.bio ?? null,
    profileImage: raw.profileImage ?? null,
    followingCount: Number(raw.followingCount) || 0,
    connectedPlatformsCount:
      typeof raw.connectedPlatformsCount === "number"
        ? raw.connectedPlatformsCount
        : Array.isArray(raw.linkedAccounts)
          ? raw.linkedAccounts.length
          : 0,
    linkedAccounts: Array.isArray(raw.linkedAccounts)
      ? raw.linkedAccounts.map((la) => ({
          id: la.id ?? "",
          platform: la.platform ?? "",
        }))
      : [],
    totalPosts: typeof raw.totalPosts === "number" ? raw.totalPosts : 0,
    engagementRate: typeof raw.engagementRate === "number" ? raw.engagementRate : 0,
    niche: raw.niche ?? null,
    verified: typeof raw.verified === "boolean" ? raw.verified : false,
  };
}
