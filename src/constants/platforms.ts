import BehanceIcon from "@/components/svg/black-behance.svg";
import DiscordIcon from "@/components/svg/black-discord.svg";
import InstagramIcon from "@/components/svg/black-instagram.svg";
import FacebookIcon from "@/components/svg/black-fb.svg";
import XIcon from "@/components/svg/black-x.svg";
import YouTubeIcon from "@/components/svg/black-youtube.svg";
import TikTokIcon from "@/components/svg/black-tiktok.svg";
import PinterestIcon from "@/components/svg/black-pinterest.svg";
import RedditIcon from "@/components/svg/black-reddit.svg";
import SpotifyIcon from "@/components/svg/black-spotify.svg";
import LinkedinIcon from "@/components/svg/black-linkedin.svg";

export type PlatformId =
	| "behance"
	| "discord"
	| "instagram"
	| "facebook"
	| "twitter"
	| "youtube"
	| "tiktok"
	| "linkedin"
	| "pinterest"
	| "reddit"
	| "spotify";

export const SUPPORTED_PLATFORM_IDS_BY_API: PlatformId[] = [
	"facebook",
	"instagram",
	"pinterest",
	"reddit",
	"spotify",
	"twitter",
	"youtube",
	"tiktok",
	"linkedin",
];

export type OAuthStatus = "ready" | "no_credentials" | "disabled" | "coming_soon";

export interface BaseProfile {
	id: string;
	name?: string;
	email?: string;
	userName?: string;
	profileImage?: string;
	followersCount?: number;
	followingCount?: number;
	allowImport?: boolean;
}

export interface Metrics {
	posts?: number | string;
	followers?: number | string;
	following?: number | string;
}

export interface Platform {
	id: PlatformId;
	name: string;
	icon: React.FC<React.SVGProps<SVGSVGElement>>;
	connected: boolean;
	urlPrefix: string;

	connectionMethod?: "link" | "import";
	importStatus?: "not_imported" | "importing" | "imported";

	username?: string;
	handle?: string;
	verified?: boolean;
	profile?: BaseProfile;
	metrics?: Metrics;
	iconName?: string;

	capabilities: {
		manualLink: boolean; // manual linking is supported
		oauth: boolean; // OAuth is supported
		importContent: boolean; // import is possible
	};

	// current OAuth status for the platform
	oauthStatus?: OAuthStatus;
}

// Data
export const platforms: Platform[] = [
	{
		id: "behance",
		name: "Behance",
		icon: BehanceIcon,
		urlPrefix: "https://behance.net/",
		iconName: "BEHANCE",
		connected: false,
		capabilities: { manualLink: true, oauth: true, importContent: true },
		oauthStatus: "no_credentials",
	},
	{
		id: "discord",
		name: "Discord",
		icon: DiscordIcon,
		urlPrefix: "https://discord.com/",
		iconName: "DISCORD",
		connected: false,
		capabilities: { manualLink: true, oauth: true, importContent: true },
		oauthStatus: "no_credentials",
	},

	{
		id: "instagram",
		name: "Instagram",
		icon: InstagramIcon,
		urlPrefix: "https://instagram.com/",
		iconName: "INSTAGRAM",
		connected: false,
		capabilities: { manualLink: true, oauth: true, importContent: true },
		oauthStatus: "no_credentials",
	},
	{
		id: "facebook",
		name: "Facebook",
		icon: FacebookIcon,
		urlPrefix: "https://facebook.com/",
		iconName: "FACEBOOK",
		connected: false,
		capabilities: { manualLink: true, oauth: true, importContent: true },
		oauthStatus: "ready",
	},
	{
		id: "twitter",
		name: "X",
		icon: XIcon,
		urlPrefix: "https://x.com/",
		iconName: "TWITTER",
		connected: false,
		capabilities: { manualLink: true, oauth: true, importContent: true },
		oauthStatus: "no_credentials",
	},
	{
		id: "youtube",
		name: "YouTube",
		icon: YouTubeIcon,
		urlPrefix: "https://youtube.com/@",
		iconName: "YOUTUBE",
		connected: false,
		capabilities: { manualLink: true, oauth: true, importContent: true },
		oauthStatus: "ready",
	},
	{
		id: "tiktok",
		name: "TikTok",
		icon: TikTokIcon,
		urlPrefix: "https://tiktok.com/@",
		iconName: "TIKTOK",
		connected: false,
		capabilities: { manualLink: true, oauth: true, importContent: true },
		oauthStatus: "no_credentials",
	},
	{
		id: "pinterest",
		name: "Pinterest",
		icon: PinterestIcon,
		urlPrefix: "https://pinterest.com/",
		iconName: "PINTEREST",
		connected: false,
		capabilities: { manualLink: true, oauth: true, importContent: true },
		oauthStatus: "no_credentials",
	},
	{
		id: "reddit",
		name: "Reddit",
		icon: RedditIcon,
		urlPrefix: "https://reddit.com/u/",
		iconName: "REDDIT",
		connected: false,
		capabilities: { manualLink: true, oauth: true, importContent: true },
		oauthStatus: "no_credentials",
	},
	{
		id: "spotify",
		name: "Spotify",
		icon: SpotifyIcon,
		urlPrefix: "https://open.spotify.com/user/",
		iconName: "SPOTIFY",
		connected: false,
		capabilities: { manualLink: true, oauth: true, importContent: true },
		oauthStatus: "no_credentials",
	},
	{
		id: "linkedin",
		name: "LinkedIn",
		icon: LinkedinIcon,
		urlPrefix: "https://linkedin.com/in/",
		iconName: "LINKEDIN",
		connected: false,
		capabilities: { manualLink: true, oauth: true, importContent: true },
		oauthStatus: "no_credentials",
	},
];

export const platformMap: Record<PlatformId, Platform> = Object.fromEntries(
	platforms.map((platform) => [platform.id, platform])
) as Record<PlatformId, Platform>;
