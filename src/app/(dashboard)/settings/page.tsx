"use client";
import { useState, ComponentType, SVGProps, useEffect } from "react";
import Image from "next/image";
import ArrowBack from "@/components/svg/arrow_back.svg";
import PenIcon from "@/components/svg/pen.svg";
import VerificationIcon from "@/components/svg/verification-badge-purple.svg";
import SocialDialogsManager from "../(profile)/u/[username]/components/SocialDialogsManager";
import { Camera } from "lucide-react";
import { useHttpContext } from "@/providers/HttpContextProvider";
import { ClaimTypes } from "@/constants/globals";
import { LinkedAccountType, ManualProfileType } from "@/types/account/profile.type";
import { UserProfileType } from "@/types/account/profile.type";
import { UserAvatar } from "@/components/ui/user-avatar";
import TiktokIcon from "@/components/svg/tiktok-black-circle.svg";
import YoutubeIcon from "@/components/svg/youtube-red-circle.svg";
import InstagramIcon from "@/components/svg/instagram-colored.svg";
import FacebookIcon from "@/components/svg/facebook-blue.svg";
import CheckIcon from "@/components/svg/check-circle-gradient.svg";
import { apiClient } from "@/services/apiClient.service";
import XIcon from "@/components/svg/x-icon.svg";
import PinterestIcon from "@/components/svg/pinterest.svg";
import LinkedInIcon from "@/components/svg/linkedin-blue.svg";
export default function ProfilePage() {
	const [openManageSocial, setOpenManageSocial] = useState(false);
	const [data, setData] = useState<UserProfileType | undefined>(undefined);
	const [openPhotoDialog, setOpenPhotoDialog] = useState(false);
	const [openCustomizeGaddrDialog, setOpenCustomizeGaddrDialog] = useState(false);
	const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccountType[]>([]);
	const [manualProfiles, setManualProfiles] = useState<ManualProfileType[]>([]);
	const { user } = useHttpContext();
	const platformIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
		tikTok: TiktokIcon,
		youtube: YoutubeIcon,
		instagram: InstagramIcon,
		facebook: FacebookIcon,
		twitter: XIcon,
		pinterest: PinterestIcon,
		linkedin: LinkedInIcon,
	};
	useEffect(() => {
		const fetchProfile = async () => {
			const start = performance.now();

			try {
				const result =
					await apiClient.User.getUserProfileAsync(
						user?.[ClaimTypes.UserName] ?? ""
					);

				console.log("PROFILE RESULT", result);

				if (result.success) {
					setData(result);
				}
			} catch (err) {
				console.error("PROFILE ERROR", err);
			}
			console.log(
				"Profile fetch ms:",
				performance.now() - start
			);

			
		};

		fetchProfile();
	}, [user]);
	return (
		<div className="space-y-10">
			{/* Header */}
			<div className="mb-5">
				<h2 className="text-xl font-bold mb-2">Profile</h2>
				<p className="text-sm text-gray-neutral">Some of your information is visible to others on Gaddr</p>
			</div>

			{/* Profile Header */}
			<div className="rounded-[20px] overflow-hidden shadow shadow-[#F4D7FF]">
				{/* Header background and avatar */}
				<div className="relative w-full h-[120px] rounded-xl mb-10">
					<Image src="/images/default-bg.svg" alt="Header background" fill className="object-cover" priority />

					<div
						className="bg-white rounded-full h-8 w-8 flex items-center justify-center absolute bottom-4 right-4 cursor-pointer"
						onClick={() => setOpenCustomizeGaddrDialog(true)}
					>
						<PenIcon />
					</div>

					{/* Avatar */}
					<div className="absolute left-10 -bottom-9">
						<div
							onClick={() => setOpenPhotoDialog(true)}
							className="relative w-14 h-14 rounded-full border-4 border-white shadow-md overflow-hidden cursor-pointer group"
						>
							<Image src={user?.["http://gaddr.com/claims/profile-picture"] || "/images/avatar.svg"} alt="User avatar" fill className="object-cover" />

							<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 text-white">
								<Camera size={60} strokeWidth={1} />
							</div>
						</div>
					</div>
				</div>

				{/* Profile details + Connected accounts */}
				<div className="pl-10 pb-8 flex w-full items-start">
					{/* Left side - user info */}
					<div className="border-r pr-6">
						<h3 className="text-base font-semibold">{user?.["http://gaddr.com/claims/fullname"]}</h3>
						<p className="text-gray text-sm">@{user?.["http://gaddr.com/claims/username"]}</p>

						<span className="text-xs text-[#001753] flex items-center gap-1 mt-2 cursor-pointer border border-dashed border-[#808080] rounded-xl py-1 px-2">
							<VerificationIcon />
							Add verification badge
						</span>
					</div>

					<div className="flex-1 px-6">
						<div className="flex items-center justify-between mb-2">
							<p className="text-base font-bold">Connected accounts</p>

							<button
								onClick={() => setOpenManageSocial(true)}
								className="gradient-text-primary text-sm font-semibold cursor-pointer flex items-center gap-2"
							>
								Manage social media <ArrowBack />
							</button>

							{/* Manage Social Media Dialogs */}
							<SocialDialogsManager
								open={openManageSocial}
								linkedAccounts={linkedAccounts}
								manualProfiles={manualProfiles}
								setLinkedAccounts={setLinkedAccounts}
								setManualProfiles={setManualProfiles}
								onClose={() => setOpenManageSocial(false)}
								onOpen={() => setOpenManageSocial(true)}
								username={user?.[ClaimTypes.UserName] ?? ""}
							/>
						</div>

						<div className="mt-3 flex flex-wrap gap-1">
							{data?.linkedAccounts?.map((account) => {
								const Icon = platformIcons[account.platform.toLowerCase()];
								return (
									<div key={account.id} className="flex items-center gap-1 text-xs">
										<div className="relative w-7 h-7 rounded-full flex justify-center items-center bg-secondary mr-2">
											<UserAvatar src={account?.profileImage} alt="avatar" size="xs" />
											{Icon && <Icon className="size-4 absolute -right-2 bottom-0 z-10" />}
										</div>
										<span>{account.username || "@"}</span>
										{account.isVerified && <CheckIcon />}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
