import React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Activity } from "lucide-react";
import { useFollowUser } from "@/hooks/useFollowUser";
import { useIsOwnProfile } from "@/hooks/useIsOwnProfile";
import { useHttpContext } from "@/providers/HttpContextProvider";
import { UserAvatar } from "@/components/ui/user-avatar";
import XIcon from "@/components/svg/x-icon.svg";
import PinterestIcon from "@/components/svg/pinterest.svg";
import LinkedInIcon from "@/components/svg/linkedin-blue.svg";
import TiktokIcon from "@/components/svg/tiktok-black-circle.svg";
import YoutubeIcon from "@/components/svg/youtube-red-circle.svg";
import InstagramIcon from "@/components/svg/instagram-colored.svg";
import FacebookIcon from "@/components/svg/facebook-blue.svg";

const platformIcons: Record<string, React.ElementType> = {
    twitter: XIcon,
    x: XIcon,
    facebook: FacebookIcon,
    instagram: InstagramIcon,
    youtube: YoutubeIcon,
    linkedin: LinkedInIcon,
    pinterest: PinterestIcon,
    tiktok: TiktokIcon,
};
interface ProfileCardProps {
    userId?: string;
    profilePicSrc: string | null;
    userName: string;
    userHandle: string;
    category: string;
    postCount: number;
    followerCount: number;
    followingCount: number;
    linkedAccounts: {
        id: string;
        platform: string;
    }[];
    profileHref?: string;
    initialIsFollowing?: boolean;
    hideFollowButton?: boolean;
    isProfileAvailable?: boolean;
    /** Keeps Discover profile cards aligned with the fixed-height content grid. */
    compact?: boolean;
}

type LinkedAccount = {
    id: string;
    platform: string;
};

const getChannelIcons = (linkedAccounts: LinkedAccount[] = []) => {
    return linkedAccounts
        .map((account) => {
            const Icon = platformIcons[account.platform.toLowerCase()];

            if (!Icon) return null;

            return (
                <Icon
                    key={account.id}
                    className="w-5 h-5"
                />
            );
        })
        .filter(Boolean);
};
const ProfileCard: React.FC<ProfileCardProps> = ({
    userId,
    profilePicSrc,
    userName,
    userHandle,
    category,
    postCount,
    followerCount,
    followingCount: initialFollowingCount,
    linkedAccounts,
    profileHref,
    initialIsFollowing = false,
    hideFollowButton = false,
    isProfileAvailable = true,
    compact = false,
}) => {
    const router = useRouter();
    const { isAuthenticated } = useHttpContext();
    const isOwnProfile = useIsOwnProfile(userId);
    const { isFollowing, followersCount, followingCount, isPending, toggleFollow, canFollow } = useFollowUser({
        userId,
        isFollowing: initialIsFollowing,
        followersCount: followerCount,
        followingCount: initialFollowingCount,
        isOwnProfile,
    });

    const cardClasses = compact
        ? "flex h-[440px] w-full flex-col items-center overflow-hidden rounded-xl bg-card text-card-foreground p-4 text-center shadow-lg"
        : "flex flex-col items-center bg-card text-card-foreground rounded-xl shadow-lg overflow-hidden min-w-[225px] min-h-[340px] p-6 text-center h-full";
    const resolvedProfileHref = profileHref ?? (userHandle ? `/${userHandle.replace(/^@/, "")}` : undefined);

    return (
        <div className={cardClasses}>

            {/* PROFILE IMAGE */}
            <UserAvatar
                src={profilePicSrc}
                alt={userName}
                size="xl"
                className="shadow-md mb-3"
            />

            {/* GROWING CONTENT AREA */}
            <div className="flex flex-col flex-1 w-full">
                {/* NAME AND CATEGORY */}
                <div className={compact ? "mb-3 min-w-0" : "mb-6"}>
                    <h3 className="truncate font-bold text-xl text-foreground">{userName}</h3>
                    <p className="mb-2 truncate text-sm text-muted-foreground">{userHandle}</p>
                    <div className="flex min-w-0 items-center justify-center space-x-1 text-sm text-yellow-600">
                        <Activity size={14} className="text-yellow-500" />
                        <span className="text-card-foreground truncate">{category}</span>
                    </div>
                </div>

                {/* MEDIA */}
                <div className={compact ? "mb-4 w-full min-h-0" : "mb-30 w-full"}>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Active channels</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {getChannelIcons(linkedAccounts)}
                    </div>
                </div>
            </div>

            {/* STATS */}
            <div className="grid w-full grid-cols-3 gap-1 px-2 mb-5">
                <div className="flex min-w-0 flex-col items-center">
                    <span className="text-sm font-bold text-foreground">{postCount}</span>
                    <span className="text-[11px] text-muted-foreground font-medium">Posts</span>
                </div>
                <div className="flex min-w-0 flex-col items-center">
                    <span className="truncate text-sm font-bold text-foreground">{followersCount}</span>
                    <span className="truncate text-[11px] font-medium text-muted-foreground">Followers</span>
                </div>
                <div className="flex min-w-0 flex-col items-center">
                    <span className="truncate text-sm font-bold text-foreground">{followingCount}</span>
                    <span className="truncate text-[11px] font-medium text-muted-foreground">Following</span>
                </div>
            </div>
            {/* ACTION BUTTONS */}
            {isProfileAvailable === false ? (
                <div className="flex flex-col items-center w-full mt-auto">
                    <p className="text-xs text-muted-foreground italic">Onboarding in progress</p>
                </div>
            ) : isAuthenticated && !hideFollowButton && !isOwnProfile ? (
                <div className="flex justify-center space-x-3 w-full mt-auto">
                    <button
                        className="flex-1 px-4 py-2 text-primary border border-primary rounded-full font-semibold hover:bg-accent transition duration-150"
                        onClick={() => {
                            if (resolvedProfileHref) router.push(resolvedProfileHref);
                        }}
                        disabled={!resolvedProfileHref}
                    >
                        View profile
                    </button>
                    <button
                        className={`flex-1 flex items-center justify-center px-2 py-2 text-xs rounded-full font-semibold transition duration-150 ${isFollowing
                            ? "bg-muted text-muted-foreground border border-border"
                            : "bg-primary text-primary-foreground hover:opacity-90"
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                        onClick={toggleFollow}
                        disabled={!canFollow || isPending}
                    >
                        {isPending ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : isFollowing ? "Following" : (
                            <span className="flex items-center">
                                Follow <Plus size={14} className="ml-1" />
                            </span>
                        )}
                    </button>
                </div>
            ) : (
                <div className="flex justify-center w-full mt-auto">
                    <button
                        className="px-6 py-2 text-primary border border-primary rounded-full font-semibold hover:bg-accent transition duration-150"
                        onClick={() => {
                            if (resolvedProfileHref) router.push(resolvedProfileHref);
                        }}
                        disabled={!resolvedProfileHref}
                    >
                        View profile
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileCard;
