"use client";

import React from "react";
import WarningIcon from "@/components/svg/warning-icon.svg";
import { SearchResult } from "@/types/search.types";
import ContentFeedCard from "@/components/card/ContentFeedCard";
import ProfileCard from "@/components/card/PorfileCard";
import { cn } from "@/utils/cn.util";
import { PublicProfileModel } from "@/types/account/profile.type";
import YoutubeRedIcon from "@/components/svg/Youtube.svg";
import FacebookBlueIcon from "@/components/svg/facebook-blue.svg";
import InstagramColorIcon from "@/components/svg/instagram-colored.svg";
import PinterestIcon from "@/components/svg/pinterest.svg";
interface SearchResultsProps {
    results: SearchResult[];
    isLoading: boolean;
    isError: boolean;
    error?: Error | null;
    viewType?: "grid" | "list";
    onRetry?: () => void;
    className?: string;
}

/**
 * Loading Skeleton Component
 */
const ResultSkeleton = ({ viewType = "grid" }: { viewType?: "grid" | "list" }) => (
    <div
        className={cn(
            "bg-white rounded-lg border border-[#E6E6E6] p-4 animate-pulse",
            viewType === "list" ? "h-24" : "h-64"
        )}
    >
        <div className="flex gap-4 h-full">
            <div className="w-16 h-16 bg-[#F0F0F0] rounded-lg shrink-0"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#F0F0F0] rounded w-3/4"></div>
                <div className="h-3 bg-[#F0F0F0] rounded w-1/2"></div>
                {viewType === "grid" && (
                    <>
                        <div className="h-3 bg-[#F0F0F0] rounded w-2/3"></div>
                        <div className="h-3 bg-[#F0F0F0] rounded w-1/3"></div>
                    </>
                )}
            </div>
        </div>
    </div>
);

/**
 * SearchResults Component
 * Displays search results with loading and error states
 */
export const SearchResults = ({
    results,
    isLoading,
    isError,
    error,
    viewType = "grid",
    onRetry,
    className,
}: SearchResultsProps) => {

    // Loading State
    if (isLoading) {
        return (
            <div
                className={cn(
                    `grid gap-6 ${viewType === "grid"
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1"
                    }`,
                    className
                )}
            >
                {[...Array(12)].map((_, i) => (
                    <ResultSkeleton key={i} viewType={viewType} />
                ))}
            </div>
        );
    }

    // Error State
    if (isError) {
        return (
            <div className={cn("flex flex-col items-center justify-center py-12", className)}>
                <div className="rounded-full bg-red-100 p-4 mb-4">
                    <WarningIcon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {error?.message || "Search Error"}
                </h3>
                <p className="text-gray-600 text-center mb-6 max-w-md">
                    {error?.message ||
                        "Unable to fetch results. Please try again later."}
                </p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className={cn(
                            "px-6 py-2 bg-black text-white rounded-lg font-medium",
                            "hover:bg-gray-900 transition-colors"
                        )}
                    >
                        Try Again
                    </button>
                )}
            </div>
        );
    }

    // Empty State
    if (!results || !Array.isArray(results) || results.length === 0) {
        return (
            <div
                className={cn(
                    "flex flex-col items-center justify-center py-12",
                    className
                )}
            >
                <div className="rounded-full bg-gray-100 p-4 mb-4">
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin opacity-50"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Results Found
                </h3>
                <p className="text-gray-600 text-center">
                    Try searching with different keywords or filters
                </p>
            </div>
        );
    }

    const firstContentIndex = results.findIndex((item) => item.type !== "profile");

    // Results Grid/List
    return (
        <div
            className={cn(
                `grid gap-6 ${viewType === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`,
                className
            )}
        >
            {results.some((result) => result.type === "profile") && (
                <h2 className="col-span-full text-lg font-semibold text-gray-900">Profiles</h2>
            )}
            {Array.isArray(results) && results.map((result, index) => {
                // If result is a profile
                if (result.type === "profile") {
                    const publicProfile = result.publicProfile as PublicProfileModel | undefined;
                    const handle = publicProfile?.userName ?? result.author?.handle?.replace(/^@/, "");

                    return (
                        <ProfileCard
                            key={result.id}
                            userId={publicProfile?.id ?? result.author?.id ?? result.id}
                            profilePicSrc={publicProfile?.profileImage || result.author?.profileImage || "/icons/gaddr-logo-xs.svg"}
                            userName={result.author?.name || publicProfile?.userName || "Unknown"}
                            userHandle={handle ? `@${handle}` : "@unknown"}
                            category={publicProfile?.niche || result.description || "Content Creator"}
                            postCount={publicProfile?.totalPosts ?? result.engagement?.views ?? 0}
                            followerCount={publicProfile?.followersCount ?? result.engagement?.likes ?? 0}
                            followingCount={publicProfile?.followingCount ?? 0}
                            linkedAccounts={publicProfile?.linkedAccounts ?? []}                           
                            profileHref={handle ? `/u/${handle}` : undefined}
                            initialIsFollowing={publicProfile?.isFollowing ?? false}
                        />
                    );
                }

                // If result is a content feed item (post, video, reel)
                const card = (
                    <ContentFeedCard
                        key={result.id}
                        imageSrc={result.media?.url || result.media?.thumbnailUrl || "/icons/gaddr-logo-xs.svg"}
                        profilePicSrc={result.author?.profileImage || "/icons/gaddr-logo-xs.svg"}
                        userName={result.author?.name || "Unknown"}
                        userHandle={result.author?.handle || "@unknown"}
                        platformIcon={(() => {
                          switch (result.platform) {
                            case 'facebook': return <FacebookBlueIcon className="w-4 h-4" />;
                            case 'youtube': return <YoutubeRedIcon />;
                            case 'instagram': return <InstagramColorIcon className="w-4 h-4" />;
                            case 'pinterest': return <PinterestIcon className="w-4 h-4" />;
                            default: return <div className="text-xs text-gray-600">{result.platform}</div>;
                          }
                        })()}
                        textContent={result.description || result.content || result.title || null}
                        date={result.publishedAt ? new Date(result.publishedAt).toLocaleDateString() : ""}
                        views={result.engagement?.views || 0}
                        likes={result.engagement?.likes || 0}
                        comments={result.engagement?.comments || 0}
                    />
                );
                return index === firstContentIndex ? (
                    <React.Fragment key={`content-section-${result.id}`}>
                        <h2 className="col-span-full text-lg font-semibold text-gray-900">Contents</h2>
                        {card}
                    </React.Fragment>
                ) : card;
            })}
            {!Array.isArray(results) && (
                <div className="col-span-full text-center py-8">
                    <p className="text-red-600 font-semibold">Error: Invalid results format</p>
                </div>
            )}
        </div>
    );
};
