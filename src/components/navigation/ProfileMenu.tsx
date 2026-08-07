"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { LogOut, Settings } from "lucide-react";
import AvatarIcon from "@/components/svg/avatar-icon.svg";
import Image from "next/image";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DialogContainer from "../dialog/DialogContainer";
import { Button } from "../ui/button";
import { getDeviceIdOrNull } from "@/utils/deviceId.util";
import { logoutFn } from "@/utils/logout.utitl";
import { cn } from "@/utils/cn.util";
import { PopoverContentProps } from "@radix-ui/react-popover";
import { useRouter } from 'next/navigation';
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAuthUserStore } from "@/store/auth-user.store";
function ProfileMenu({
	triggerElement,
	contentProps,
}: {
	triggerElement?: React.ReactNode;
	contentProps?: PopoverContentProps;
}) {
	const authUser = useAuthUserStore((s) => s.authUser);
	const [open, setOpen] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [isLogoutDialog, setIsLogoutDialog] = useState(false);
	const deviceId = getDeviceIdOrNull();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { clearAuthUser } = useAuthUserStore();
	const t = useTranslations("nav");

	const usernameHref = `/${authUser?.username}`;
	const pathname = usePathname();
	const isProfileActive = authUser?.username ? pathname?.startsWith(`/${authUser.username}`) : false;

	const profileMenuItems = [
		{ label: t("accountSettings"), href: "/settings", icon: Settings },
		{ label: t("logOut"), href: null, icon: LogOut, action: () => setIsLogoutDialog(true) },
	];

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			const result = await logoutFn(deviceId);
			clearAuthUser();
			queryClient.clear();
			router.replace("/discover");
			router.refresh();
			if (!result.success) {
				toast.error(t("unableToLogout"));
			}
		} catch {
			clearAuthUser();
			queryClient.clear();
			router.replace("/discover");
			router.refresh();
			toast.error(t("unableToLogout"));
		} finally {
			setIsLoggingOut(false);
		}
	};

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					{triggerElement ? (
						triggerElement
					) : (
					<button
						className={cn("rounded-full cursor-pointer", isProfileActive && "bg-accent", "hover:bg-accent")}
						title={t("profile")}
					>
						{authUser? (
							<Image fetchPriority="high" loading="eager" src={authUser.photo || "images/avatar.svg"} alt="User avatar" width={30} height={30} className="rounded-full" />
						) : (
							<AvatarIcon className="scale-75 text-[#0D0D0D]" />
						)}
						</button>
					)}
				</PopoverTrigger>

				<PopoverContent side="right" align="start" sideOffset={10} className="w-64 py-2 px-3" {...contentProps}>
					<Link href={usernameHref} className="hover:bg-secondary p-2 rounded-sm block" onClick={() => setOpen(false)}>
						<p className="font-semibold text-sm">
							{authUser?.fullName}
						</p>
						<p className="text-xs text-gray-neutral">@{authUser?.username}</p>
					</Link>

					<div className="border-t mt-2 space-y-1">
						{profileMenuItems.map((item) => (
							<button
								key={item.label}
								onClick={() => {
									if (item.href) router.push(item.href);
									else item.action?.();
									setOpen(false);
								}}
								className={cn(
									"w-full flex items-center gap-2 p-2 hover:bg-secondary rounded-sm text-left text-sm cursor-pointer",
									item.label === t("logOut") && "border-t"
								)}
							>
								<item.icon className="scale-75" />
								{item.label}
							</button>
						))}
					</div>
				</PopoverContent>
			</Popover>

			{/* ------------ LOGOUT DIALOG ------------ */}
			{isLogoutDialog && (
				<DialogContainer
					open
					onClose={() => setIsLogoutDialog(false)}
					title={t("confirmLogout")}
					maxWidthClass="max-w-lg"
					footer={
						<div className="flex justify-end gap-4">
							<Button label={t("confirmLogoutMessage") ? "Cancel" : "Cancel"} variant="secondary" onClick={() => setIsLogoutDialog(false)} />
							<Button label={t("logOut")} loading={isLoggingOut} onClick={handleLogout} />
						</div>
					}
				>
					<p className="text-sm">{t("confirmLogoutMessage")}</p>
				</DialogContainer>
			)}
		</>
	);
}

export default ProfileMenu;
