import React from 'react';
import { Eye, ThumbsUp, MessageCircle } from 'lucide-react';

interface CardStatsProps {
    views?: number;
    likes?: number;
    comments?: number;
    isLiked: boolean;
    onLikeClick: () => void;
}

const formatNumber = (num: number): string => {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
};

const CardStats: React.FC<CardStatsProps> = ({ views, likes, comments, isLiked, onLikeClick }) => {

    const StatItem: React.FC<{
        icon: React.ReactNode;
        count: number;
        clickable?: boolean;
        color?: string;
        onClick?: () => void
    }> = ({ icon, count, clickable = false, color, onClick }) => {

        const baseClasses = `flex items-center text-xs ${color || 'text-gray-500'} ${clickable ? 'cursor-pointer' : ''}`;

        return (
            <div
                className={baseClasses}
                onClick={onClick}
            >
                {icon}
                <span className="ml-1">{formatNumber(count)}</span>
            </div>
        );
    };

    const baseColorClass = 'text-gray-600';
    const thumbStrokeColor = '#6b7280';

    return (
        <div className="flex gap-4 py-2">
            {views && views > 0 && (
                <StatItem
                    icon={<Eye size={16} />}
                    count={views}
                    color={baseColorClass}
                />
            )}

            {likes && likes > 0 && (
                <StatItem
                    icon={
                        <ThumbsUp
                            size={16}
                            fill={isLiked ? "#6b7280" : "none"}
                            stroke={thumbStrokeColor}
                        />
                    }
                    count={likes}
                    clickable
                    color={baseColorClass}
                    onClick={onLikeClick}
                />
            )}

            {comments && comments > 0 && (
                <StatItem
                    icon={<MessageCircle size={16} />}
                    count={comments}
                    color={baseColorClass}
                />
            )}
        </div>
    );
};

export default CardStats;