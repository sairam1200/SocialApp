import React, { useState } from "react";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { Loader2, Plus, Activity, User } from "lucide-react";
import { useFollowUser } from "@/hooks/useFollowUser";
import { useIsOwnProfile } from "@/hooks/useIsOwnProfile";
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
    profilePicSrc: string;
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
    followingCount,
    linkedAccounts,
    profileHref,
    initialIsFollowing = false,
    hideFollowButton = false,
}) => {
    const router = useRouter();
    const isOwnProfile = useIsOwnProfile(userId);
    const [profileImageError, setProfileImageError] = useState(false);
    const { isFollowing, followersCount, isPending, toggleFollow, canFollow } = useFollowUser({
        userId,
        isFollowing: initialIsFollowing,
        followersCount: followerCount,
        isOwnProfile,
    });

    const cardClasses = "flex flex-col items-center bg-white rounded-xl shadow-lg overflow-hidden min-w-[225px] min-h-[340px] p-6 text-center";
    const resolvedProfileHref = profileHref ?? (userHandle ? `/u/${userHandle.replace(/^@/, "")}` : undefined);

    return (
        <div className={cardClasses}>

            {/* PROFILE IMAGE */}
            {profileImageError ? (
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center shadow-md mb-3">
                    <User className="w-8 h-8 text-gray-400" />
                </div>
            ) : (
                <Image
                    src={profilePicSrc || "/images/default-avatar.png"}
                    alt={userName}
                    width={80}
                    height={80}
                    className="rounded-full object-cover shadow-md mb-3"
                    unoptimized
                    onError={() => setProfileImageError(true)}
                />
            )}

            {/* NAME AND CATEGORY */}
            <div className="mb-6">
                <h3 className="font-bold text-xl text-gray-900">{userName}</h3>
                <p className="text-sm text-gray-500 mb-2">{userHandle}</p>
                <div className="flex items-center justify-center text-sm text-yellow-600 space-x-1">
                    <Activity size={14} className="text-yellow-500" />
                    <span className="text-gray-700">{category}</span>
                </div>
            </div>

            {/* MEDIA */}
            <div className="mb-30 w-full">
                <p className="text-sm font-medium text-gray-600 mb-2">Active channels</p>
                <div className="flex justify-center gap-3">
                    {getChannelIcons(linkedAccounts)}
                </div>
            </div>

            {/* STATS */}
            <div className="flex justify-between w-full mb-5 px-2">
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-gray-900">{postCount}</span>
                    <span className="text-[11px] text-gray-500 font-medium">Posts</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-gray-900">{followersCount}</span>
                    <span className="text-[11px] text-gray-500 font-medium">Followers</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-gray-900">{followingCount}</span>
                    <span className="text-[11px] text-gray-500 font-medium">Following</span>
                </div>
            </div>
            {/* ACTION BUTTONS */}
            <div className="flex justify-center space-x-3 w-full">
                <button
                    className="flex-1 px-4 py-2 text-indigo-700 border border-indigo-700 rounded-full font-semibold hover:bg-indigo-50 transition duration-150"
                    onClick={() => {
                        if (resolvedProfileHref) router.push(resolvedProfileHref);
                    }}
                    disabled={!resolvedProfileHref}
                >
                    View profile
                </button>
                {!hideFollowButton && !isOwnProfile && (
                    <button
                        className={`flex-1 flex items-center justify-center px-2 py-2 text-xs rounded-full font-semibold transition duration-150 ${isFollowing
                            ? "bg-gray-100 text-gray-600 border border-gray-200"
                            : "bg-indigo-700 text-white hover:bg-indigo-800"
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
                )}
            </div>
        </div>
    );
};

export default ProfileCard;
