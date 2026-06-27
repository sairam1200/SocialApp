"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn.util";
import AvatarIcon from "@/components/svg/avatar-icon.svg";
import DiscoverIcon from "@/components/svg/dashboard.svg";
import BookmarkIcon from "@/components/svg/bookmark.svg";
import GaddrLogo from "@/components/svg/gaddr-logo-xs.svg";
import PlusIcon from "@/components/svg/plus.svg";
import AnalyticsIcon from "@/components/svg/analytics-icon.svg";
import Link from "next/link";
import DialogContainer from "../dialog/DialogContainer";
import { Button } from "../ui/button";
import ProfileMenu from "./ProfileMenu";
import CreatePostDialog from "../create-post";
import { useHttpContext } from "@/providers/HttpContextProvider";

export default function SidebarNav() {
	const { isAuthenticated } = useHttpContext();
	const [openPostDialog, setOpenPostDialog] = useState(false);
	const [isLoginDialog, setIsLoginDialog] = useState(false);
	const pathname = usePathname();
	const isActive = (href: string) => pathname.startsWith(href);

	const navItems = [
		{ Icon: DiscoverIcon, label: "Discover", href: "/discover" },
		{ Icon: BookmarkIcon, label: "Bookmarks", href: "/bookmarks" },
		{ Icon: AnalyticsIcon, label: "Analytics", href: "/analytics" },
		{ Icon: PlusIcon, label: "Post", href: "#", action: () => setOpenPostDialog(true) },
	];

	const handleNavClick = (action?: () => void) => (e: React.MouseEvent) => {
		if (action) {
			e.preventDefault();
			action();
		}
	};

	const renderNavContent = (isMobile = false) => (
		<>
			{/* Profile/Login Button */}
			<div className={cn(isMobile ? "order-4" : "")}>
				{isAuthenticated ? (
					<ProfileMenu />
				) : (
					<button
						className="rounded-md hover:bg-[#F0EBFF] cursor-pointer p-2 flex flex-col items-center gap-1"
						onClick={() => setIsLoginDialog(true)}
						title="Profile"
					>
						<AvatarIcon className={cn(isMobile ? "scale-90" : "scale-75")} />
						{isMobile && <span className="text-xs text-[#0D0D0D]">Profile</span>}
					</button>
				)}
			</div>

			{/* Nav Items */}
			{navItems.map(({ Icon, label, href, action }, index) => (
				<Link
					href={href}
					key={label}
					className={cn(
						"rounded-md flex items-center justify-center p-2",
						isActive(href) && "bg-[#F0EBFF]",
						"hover:bg-[#F0EBFF]",
						isMobile && "flex-col gap-1",
						isMobile && `order-${index + 1}`
					)}
					title={label}
					onClick={handleNavClick(action)}
				>
					<Icon className={cn(isMobile ? "scale-90" : "scale-80", "text-[#0D0D0D]")} />
					{isMobile && <span className="text-xs text-[#0D0D0D]">{label}</span>}
				</Link>
			))}
		</>
	);

	return (
		<>
			{/* Desktop Sidebar - hidden on mobile */}
			<aside
				className="hidden md:flex h-fit flex-col items-center gap-5 rounded-[20px] py-5 px-1 sm:px-2 mr-5 sm:mr-10"
				style={{ boxShadow: "0px 1px 20.7px 0px #3600F940" }}
			>
				<Link href="/">
					<GaddrLogo className="scale-80" />
				</Link>
				{renderNavContent(false)}
			</aside>

			{/* Mobile Bottom Navigation */}
			<nav
				className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-[20px] px-4 py-3 z-50"
				style={{ boxShadow: "0px -1px 20.7px 0px #3600F940" }}
			>
				<div className="flex justify-around items-center max-w-md mx-auto">
					{renderNavContent(true)}
				</div>
			</nav>

			{/* Login Dialog */}
			{isLoginDialog && (
				<DialogContainer
					open={isLoginDialog}
					onClose={() => setIsLoginDialog(false)}
					title="Log In or Sign Up to Continue"
					maxWidthClass="max-w-lg"
					footer={
						<div className="flex justify-end gap-4">
							<Link href="/login">
								<Button label="Login" variant="secondary" />
							</Link>
							<Link href="/signup">
								<Button label="Signup" />
							</Link>
						</div>
					}
				>
					<p className="text-sm">
						To continue using Gaddr Me & Search, you need to Sign Up or Log In to your existing account.
					</p>
				</DialogContainer>
			)}

			<CreatePostDialog open={openPostDialog} close={() => setOpenPostDialog(false)} />
		</>
	);
}