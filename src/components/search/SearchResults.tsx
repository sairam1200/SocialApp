"use client";

import React from "react";
import WarningIcon from "@/components/svg/warning-icon.svg";
import { SearchResult, SearchTypeTab } from "@/types/search.types";
import ContentFeedCard from "@/components/card/ContentFeedCard";
import ProfileCard from "@/components/card/PorfileCard";
import { cn } from "@/utils/cn.util";
import { PublicProfileModel } from "@/types/account/profile.type";
import { hydrateFollowState } from "@/store/follow.store";
import { renderPlatformIcon, isValidUrl, normalizeSearchResult, mapProfileToProps } from "@/lib/card-helpers";

interface SearchResultsProps {
    results: SearchResult[];
    searchType?: SearchTypeTab;
    isLoading: boolean;
    isError: boolean;
    error?: Error | null;
    viewType?: "grid" | "list";
    onRetry?: () => void;
    className?: string;
}

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

export const SearchResults = ({
    results,
    searchType = "profiles",
    isLoading,
    isError,
    error,
    viewType = "grid",
    onRetry,
    className,
}: SearchResultsProps) => {
    React.useEffect(() => {
        if (!Array.isArray(results)) return;
        results.forEach((result) => {
            if (result.type === "profile" && result.publicProfile) {
                hydrateFollowState(result.publicProfile);
            }
        });
    }, [results]);

    if (isLoading) {
        return (
            <div
                className={cn(
                    "grid gap-6",
                    viewType === "grid"
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1",
                    className
                )}
            >
                {[...Array(12)].map((_, i) => (
                    <ResultSkeleton key={i} viewType={viewType} />
                ))}
            </div>
        );
    }

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

    if (!results || !Array.isArray(results) || results.length === 0) {
        const emptyMessages: Record<SearchTypeTab, { title: string; description: string }> = {
            profiles: { title: "No profiles found", description: "Try searching with different keywords" },
            contents: { title: "No content found", description: "Try searching with different keywords or filters" },
            projects: { title: "No projects found", description: "Try searching with different keywords" },
        };
        const empty = emptyMessages[searchType];

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
                    {empty.title}
                </h3>
                <p className="text-gray-600 text-center">
                    {empty.description}
                </p>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "grid gap-6",
                viewType === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1",
                className
            )}
        >
            {Array.isArray(results) &&
                results.map((result) => {
                    if (result.type === "profile") {
                        const publicProfile = result.publicProfile as
                            | PublicProfileModel
                            | undefined;

                        const cardProps = mapProfileToProps(publicProfile, {
                            id: result.author?.id ?? result.id,
                            profileImage: result.author?.profileImage,
                        });

                        return (
                            <ProfileCard
                                key={result.id}
                                {...cardProps}
                            />
                        );
                    }

                    const cardProps = normalizeSearchResult(result);
                    const validUrl =
                        cardProps.sourceUrl && isValidUrl(cardProps.sourceUrl) ? cardProps.sourceUrl : null;

                    return (
                        <div
                            key={result.id}
                            onClick={() => {
                                if (validUrl) {
                                    window.open(
                                        validUrl,
                                        "_blank",
                                        "noopener,noreferrer"
                                    );
                                }
                            }}
                            className={validUrl ? "cursor-pointer" : ""}
                        >
                            <ContentFeedCard
                                {...cardProps}
                                platformIcon={renderPlatformIcon(cardProps.platform)}
                            />
                        </div>
                    );
                })}
            {!Array.isArray(results) && (
                <div className="col-span-full text-center py-8">
                    <p className="text-red-600 font-semibold">
                        Error: Invalid results format
                    </p>
                </div>
            )}
        </div>
    );
};
