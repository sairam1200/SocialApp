import type { ElementType } from "react";

export interface ProfileFormData {
	fullName: string;
	email: string;
	bio: string;
	interests: string[];
	connectedAccounts: Record<string, string>;
	profileImage?: File | null;
	profileImagePreview?: string;
}


export interface SocialPlatform {
	name: string;
	id: string;
	icon: ElementType;
	color: string;
	bg: string;
}

/* export const INTERESTS: Interest[] = [
	{ id: 1, name: "Animals & pets", icon: "🐾" },
	{ id: 2, name: "Art & Design", icon: "🎨" },
	{ id: 3, name: "Beauty", icon: "💄" },
	{ id: 4, name: "Books & Culture", icon: "📚" },
	{ id: 5, name: "Cars & Motors", icon: "🚗" },
	{ id: 6, name: "Food & Drinks", icon: "🍔" },
	{ id: 7, name: "Fashion", icon: "👗" },
	{ id: 8, name: "Gaming", icon: "🎮" },
	{ id: 9, name: "Health & Wellness", icon: "🌱" },
	{ id: 10, name: "Home & Decor", icon: "🏠" },
	{ id: 11, name: "Mindfulness", icon: "🧘" },
	{ id: 12, name: "Nature & Outdoors", icon: "🌍" },
	{ id: 13, name: "News & Events", icon: "🗞️" },
	{ id: 14, name: "Photography", icon: "📸" },
	{ id: 15, name: "Sports", icon: "🏆" },
	{ id: 16, name: "Tech & Gadgets", icon: "📱" },
	{ id: 17, name: "Travel", icon: "✈️" },
	{ id: 18, name: "Music", icon: "🎶" },
	{ id: 19, name: "Movies & TV", icon: "🎬" },
]; */

import {
	Share2,
	Instagram,
	Twitter,
	Youtube,
	Music2,
	MessageCircle,
	Facebook,
} from "lucide-react";

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
	{ name: "Facebook", id: "facebook", icon: Facebook, color: "text-blue-600", bg: "bg-blue-50" },
	{ name: "Instagram", id: "instagram", icon: Instagram, color: "text-pink-600", bg: "bg-pink-50" },
	{ name: "TikTok", id: "tiktok", icon: Music2, color: "text-black", bg: "bg-gray-100" },
	{ name: "WhatsApp", id: "whatsapp", icon: MessageCircle, color: "text-green-500", bg: "bg-green-50" },
	{ name: "X (Twitter)", id: "twitter", icon: Twitter, color: "text-black", bg: "bg-gray-100" },
	{ name: "Pinterest", id: "pinterest", icon: Share2, color: "text-red-600", bg: "bg-red-50" },
	{ name: "Youtube", id: "youtube", icon: Youtube, color: "text-red-500", bg: "bg-red-50" },
];
