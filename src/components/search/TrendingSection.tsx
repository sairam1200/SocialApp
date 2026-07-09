"use client";

import React from "react";
import WarningIcon from "@/components/svg/warning-icon.svg";
import StarIcon from "@/components/svg/Star.svg";
import { TrendingItem } from "@/types/search.types";
import { cn } from "@/utils/cn.util";

interface TrendingSectionProps {
    items: TrendingItem[];
    isLoading?: boolean;
    isError?: boolean;
    onItemClick?: (item: TrendingItem) => void;
    className?: string;
}

/**
 * Trending Item Skeleton
 */
const TrendingItemSkeleton = () => (
    <div className="p-4 bg-white rounded-lg border border-[#E6E6E6] animate-pulse">
        <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#F0F0F0] rounded w-3/4"></div>
                <div className="h-3 bg-[#F0F0F0] rounded w-1/2"></div>
                <div className="flex gap-1 pt-2">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-5 w-12 bg-[#F0F0F0] rounded-full"></div>
                    ))}
                </div>
            </div>
            <div className="h-8 w-12 bg-[#F0F0F0] rounded shrink-0"></div>
        </div>
    </div>
);

/**
 * Individual Trending Item
 */
const TrendingItemCard = ({
    item,
    onClick,
}: {
    item: TrendingItem;
    onClick?: () => void;
}) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full text-left p-4 bg-white rounded-lg border border-[#E6E6E6]",
            "hover:border-black-default hover:shadow-md transition-all",
            "group cursor-pointer"
        )}
    >
        <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-black-default truncate">
                        {item.title}
                    </h3>
                    {item.growth !== undefined && item.growth > 0 && (
                        <div className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full shrink-0">
                            <StarIcon className="w-3 h-3" />
                            <span>{item.growth}%</span>
                        </div>
                    )}
                </div>

                {item.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.description}
                    </p>
                )}

                {/* Platform Tags */}
                <div className="flex flex-wrap gap-2">
                    {item.platforms.map((platform) => (
                        <span
                            key={platform}
                            className={cn(
                                "text-xs px-2.5 py-1 rounded-full font-medium",
                                "bg-gray-100 text-gray-700 capitalize"
                            )}
                        >
                            {platform}
                        </span>
                    ))}
                </div>
            </div>

            {/* Trend Score Badge */}
            <div
                className={cn(
                    "flex flex-col items-center justify-center w-14 h-14 rounded-lg shrink-0",
                    "bg-linear-to-br from-blue-50 to-blue-100"
                )}
            >
                <span className="text-lg font-bold text-blue-600">{item.trendScore}</span>
                <span className="text-xs text-blue-600 font-medium">trending</span>
            </div>
        </div>
    </button>
);

/**
 * TrendingSection Component
 * Displays trending topics and content
 */
export const TrendingSection = ({
    items,
    isLoading = false,
    isError = false,
    onItemClick,
    className,
}: TrendingSectionProps) => {
    if (isLoading) {
        return (
            <div className={cn("space-y-3", className)}>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <StarIcon className="w-5 h-5" />
                    Trending Now
                </h2>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <TrendingItemSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={cn("rounded-lg border border-red-200 bg-red-50 p-4", className)}>
                <div className="flex items-center gap-3">
                    <WarningIcon className="w-5 h-5 text-red-600 shrink-0" />
                    <div>
                        <h3 className="font-semibold text-red-900">
                            Failed to Load Trending
                        </h3>
                        <p className="text-sm text-red-700">
                            Unable to fetch trending content. Please try again later.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className={cn("rounded-lg border border-[#E6E6E6] bg-white p-8 text-center", className)}>
                <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-3 opacity-50"></div>
                <p className="text-gray-600">No trending content available</p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-3", className)}>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <StarIcon className="w-5 h-5" />
                Trending Now
            </h2>
            <div className="space-y-3">
                {items.map((item) => (
                    <TrendingItemCard
                        key={item.id}
                        item={item}
                        onClick={() => onItemClick?.(item)}
                    />
                ))}
            </div>
        </div>
    );
};
