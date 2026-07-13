"use client";
import React, { useState } from "react";
import { ChartColumn, LogOut, Settings } from "lucide-react";
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
import { useHttpContext } from "@/providers/HttpContextProvider";
import { ClaimTypes } from "@/constants/globals";
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
	const { user } = useHttpContext();
	const [open, setOpen] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [isLogoutDialog, setIsLogoutDialog] = useState(false);
const deviceId = getDeviceIdOrNull();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { clearAuthUser } = useAuthUserStore();

	const usernameHref = `/u/${user?.[ClaimTypes.UserName]}`;
	const pathname = usePathname();
	const isProfileActive = user?.[ClaimTypes.UserName] ? pathname?.startsWith(`/u/${user?.[ClaimTypes.UserName]}`) : false;

	const profileMenuItems = [
		// { label: "Analytics", href: "/analytics", icon: ChartColumn },
		{ label: "Account Settings", href: "/settings", icon: Settings },
		{ label: "Logout", href: null, icon: LogOut, action: () => setIsLogoutDialog(true) },
	];

	const handleLogout = async () => {
  try {
    clearAuthUser();
    await logoutFn(deviceId);

    queryClient?.clear?.();

    router.replace("/discover");
    
  } catch (error) {
    toast.error("Unable to log out.");
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
							className={cn("rounded-full cursor-pointer", isProfileActive && "bg-[#F0EBFF]", "hover:bg-[#F0EBFF]")}
							title="Profile"
						>
							{user?.[ClaimTypes.ProfileImage] ? (
								<Image fetchPriority="high" preload src={user?.[ClaimTypes.ProfileImage] as string} alt="User avatar" width={30} height={30} className="rounded-full" />
							) : (
								<AvatarIcon className="scale-75 text-[#0D0D0D]" />
							)}
						</button>
					)}
				</PopoverTrigger>

				<PopoverContent side="right" align="start" sideOffset={10} className="w-64 py-2 px-3" {...contentProps}>
					<Link href={usernameHref} className="hover:bg-secondary p-2 rounded-sm block" onClick={() => setOpen(false)}>
						<p className="font-semibold text-sm">
							{user?.[ClaimTypes.FullName]}
						</p>
						<p className="text-xs text-gray-neutral">@{user?.[ClaimTypes.UserName]}</p>
					</Link>

					<div className="border-t mt-2 space-y-1">
						{profileMenuItems.map((item) => (
							<button
								key={item.label}
								onClick={() => {
									if (item.href) window.location.href = item.href;
									else item.action?.();
									setOpen(false);
								}}
								className={cn(
									"w-full flex items-center gap-2 p-2 hover:bg-secondary rounded-sm text-left text-sm cursor-pointer",
									item.label === "Logout" && "border-t"
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
					title="Confirm Logout"
					maxWidthClass="max-w-lg"
					footer={
						<div className="flex justify-end gap-4">
							<Button label="Cancel" variant="secondary" onClick={() => setIsLogoutDialog(false)} />
							<Button label="Logout" loading={isLoggingOut} onClick={handleLogout} />
						</div>
					}
				>
					<p className="text-sm">Are you sure you want to log out?</p>
				</DialogContainer>
			)}
		</>
	);
}

export default ProfileMenu;
