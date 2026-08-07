import React from 'react';
import { Eye, ThumbsUp, MessageCircle } from 'lucide-react';
import { StatType, StatItem } from '@/lib/card-helpers';
import { ShareIcon } from '@/components/ui/share-icon';

const ICONS: Record<StatType, React.ComponentType<{ size: number; className?: string }>> = {
    views: Eye,
    likes: ThumbsUp,
    comments: MessageCircle,
    shares: ShareIcon,
};

interface CardStatsProps {
    stats: StatItem[];
    isLiked: boolean;
    onLikeClick: () => void;
}

const formatNumber = (num: number): string => {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
};

const CardStats: React.FC<CardStatsProps> = ({ stats, isLiked, onLikeClick }) => {

    const StatItemComponent: React.FC<{
        stat: StatItem;
        color?: string;
        onClick?: () => void;
    }> = ({ stat, color, onClick }) => {
        const Icon = ICONS[stat.type];
        if (!Icon) return null;

        const baseClasses = `flex items-center text-xs ${color || 'text-gray-500'} ${stat.clickable ? 'cursor-pointer' : ''}`;

        return (
            <div
                className={baseClasses}
                onClick={onClick}
            >
                <Icon
                    size={16}
                    className={stat.type === 'likes' && isLiked ? 'fill-current' : ''}
                />
                <span className="ml-1">{formatNumber(stat.value)}</span>
            </div>
        );
    };

    const baseColorClass = 'text-gray-600';

    return (
        <div className="flex gap-4 py-2">
            {stats
                .filter((s) => s.value != null && s.value > 0)
                .map((stat) => (
                    <StatItemComponent
                        key={stat.type}
                        stat={stat}
                        color={baseColorClass}
                        onClick={
                            stat.type === 'likes' && stat.clickable
                                ? onLikeClick
                                : undefined
                        }
                    />
                ))}
        </div>
    );
};

export default CardStats;
