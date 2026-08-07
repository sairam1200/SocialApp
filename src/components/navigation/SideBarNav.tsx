"use client";
import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/utils/cn.util";
import AvatarIcon from "@/components/svg/avatar-icon.svg";
import DiscoverIcon from "@/components/svg/dashboard.svg";
import BookmarkIcon from "@/components/svg/bookmark.svg";
import PlusIcon from "@/components/svg/plus.svg";
import AnalyticsIcon from "@/components/svg/analytics-icon.svg";
import { CalendarDays, FolderHeart, Users } from "lucide-react";
import Link from "next/link";
import DialogContainer from "../dialog/DialogContainer";
import { Button } from "../ui/button";
import ProfileMenu from "./ProfileMenu";
import CreatePostDialog from "../create-post";
import { useHttpContext } from "@/providers/HttpContextProvider";
import { useQueryClient } from "@tanstack/react-query";
import { GaddrProductSwitcher } from "./GaddrProductSwitcher";

/**
 * The other nav icons are SVGs compiled by svgr and take a `className`.
 * Wrapping the lucide icon keeps the call site uniform so the map below does
 * not need a special case.
 */
function CommunityIcon({ className }: { className?: string }) {
	return <Users className={className} strokeWidth={1.6} />;
}

function CollectionIcon({ className }: { className?: string }) {
	return <FolderHeart className={className} strokeWidth={1.6} />;
}

export default function SidebarNav() {
	const { isAuthenticated } = useHttpContext();
	const queryClient = useQueryClient();
	const [openPostDialog, setOpenPostDialog] = useState(false);
	const [isLoginDialog, setIsLoginDialog] = useState(false);
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();
	const t = useTranslations("nav");
	const tCommon = useTranslations("common");
	const isActive = useCallback((href: string) => pathname.startsWith(href), [pathname]);

	const handlePostClick = useCallback(() => {
		if (!isAuthenticated) {
			setIsLoginDialog(true);
			return;
		}
		setOpenPostDialog(true);
	}, [isAuthenticated]);

	const navItems = [
		{ Icon: DiscoverIcon, label: t("discover"), href: "/discover", mobileOrder: "order-1", action: () => queryClient.invalidateQueries({ queryKey: ['discover'] }) },
		{ Icon: CommunityIcon, label: t("community"), href: "/community", mobileOrder: "order-2" },
		{ Icon: BookmarkIcon, label: t("bookmarks"), href: "/bookmarks", mobileOrder: "order-3" },
		{ Icon: CollectionIcon, label: t("collections"), href: "/collections", mobileOrder: "order-4" },
		{ Icon: CalendarDays, label: t("calendar"), href: "/publishing", mobileOrder: "order-5" },
		{ Icon: AnalyticsIcon, label: t("analytics"), href: "/analytics", mobileOrder: "order-6" },
	];

	const handleNavClick = (href: string, action?: () => void) => (e: React.MouseEvent) => {
		const hasSearchQuery = searchParams.has('q') && searchParams.get('q')!.trim().length > 0;

		if (isActive(href)) {
			if (hasSearchQuery) {
				// On discover with search results — navigate to clean discover to clear search
				router.push(href);
				return;
			}
			e.preventDefault();
			action?.();
			if (typeof window !== "undefined") {
				window.scrollTo({ top: 0, behavior: "smooth" });
			}
		}
	};

	const renderNavContent = (isMobile = false) => (
		<>
			{isMobile && <GaddrProductSwitcher compact />}
			{/* Profile/Login Button */}
			<div className={cn(isMobile ? "w-16 shrink-0 order-6" : "")}>
				{isAuthenticated ? (
					<ProfileMenu />
				) : (
					<button
						className={cn("rounded-md hover:bg-secondary cursor-pointer p-2 flex flex-col items-center gap-1", isMobile && "w-full p-1")}
						onClick={() => setIsLoginDialog(true)}
						title={t("profile")}
						aria-label={t("profile")}
					>
						<AvatarIcon className={cn(isMobile ? "scale-90" : "scale-75")} />
						{isMobile && <span className="max-w-full truncate text-[10px] text-foreground">{t("profile")}</span>}
					</button>
				)}
			</div>

			{/* Nav Items */}
			{navItems.map(({ Icon, label, href, mobileOrder, action }) => (
				<Link
					href={href}
					key={label}
					className={cn(
						"rounded-md flex items-center justify-center p-2",
						isActive(href) && "bg-secondary",
						"hover:bg-secondary",
						isMobile && "w-16 shrink-0 flex-col gap-1 p-1",
						isMobile && mobileOrder
					)}
					title={label}
					aria-label={label}
					onClick={handleNavClick(href, action)}
				>
					<Icon className={cn(isMobile ? "scale-90" : "scale-80", "text-foreground")} />
					{isMobile && <span className="max-w-full truncate text-[10px] text-foreground">{label}</span>}
				</Link>
			))}

			{/* Post Button */}
			<button
				onClick={handlePostClick}
				className={cn(
					"rounded-md flex items-center justify-center p-2 cursor-pointer",
					"hover:bg-secondary",
					isMobile && "w-16 shrink-0 flex-col gap-1 p-1",
					isMobile && "order-7"
				)}
				title={t("post")}
				aria-label={t("post")}
			>
				<PlusIcon className={cn(isMobile ? "scale-90" : "scale-80", "text-foreground")} />
				{isMobile && <span className="max-w-full truncate text-[10px] text-foreground">{t("post")}</span>}
			</button>
		</>
	);

	return (
		<>
			{/* Desktop Sidebar - hidden on mobile */}
			<aside
				className="relative z-50 hidden h-[470px] w-[76px] flex-col items-center gap-4 rounded-[20px] py-5 px-1 sm:mr-10 sm:px-2 md:flex"
				style={{ boxShadow: "0px 1px 20.7px 0px color-mix(in srgb, var(--primary) 25%, transparent)" }}
			>
				<GaddrProductSwitcher />
				{renderNavContent(false)}
			</aside>

			{/* Mobile Bottom Navigation */}
			<nav
				className="md:hidden fixed bottom-0 left-0 right-0 bg-background rounded-t-[20px] px-4 py-3 z-50"
				style={{ boxShadow: "0px -1px 20.7px 0px color-mix(in srgb, var(--primary) 25%, transparent)" }}
			>
				<div className="mx-auto flex max-w-md items-center justify-start gap-0 overflow-x-auto">
					{renderNavContent(true)}
				</div>
			</nav>

			{/* Login Dialog */}
			{isLoginDialog && (
				<DialogContainer
					open={isLoginDialog}
					onClose={() => setIsLoginDialog(false)}
					title={t("loginOrSignup")}
					maxWidthClass="max-w-lg"
					footer={
						<div className="flex justify-end gap-4">
							<Link href="/login">
								<Button label={tCommon("login")} variant="secondary" />
							</Link>
							<Link href="/signup">
								<Button label={tCommon("signup")} />
							</Link>
						</div>
					}
				>
					<p className="text-sm">
						{t("loginOrSignupMessage")}
					</p>
				</DialogContainer>
			)}

			<CreatePostDialog open={openPostDialog} close={() => setOpenPostDialog(false)} />
		</>
	);
}
