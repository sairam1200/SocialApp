"use client";

import React, { ComponentType, SVGProps, useState, use } from "react";
import { AlertCircle, Camera, Edit, EllipsisVertical, Loader2, Mail, RefreshCw, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import DialogContainer from "@/components/dialog/DialogContainer";
import TiktokIcon from "@/components/svg/tiktok-black-circle.svg";
import YoutubeIcon from "@/components/svg/youtube-red-circle.svg";
import InstagramIcon from "@/components/svg/instagram-colored.svg";
import FacebookIcon from "@/components/svg/facebook-blue.svg";
import CheckIcon from "@/components/svg/check-circle-gradient.svg";
import ArrowBackIcon from "@/components/svg/arrow_back.svg";
import ProfileTabs from "./components/ProfileTabs";
import SharePopup from "./components/SharePopup";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { UserProfileType } from "@/types/account/profile.type";
import { useHttpContext } from "@/providers/HttpContextProvider";
import { ClaimTypes } from "@/constants/globals";
import { useFollowUser } from "@/hooks/useFollowUser";
import { useGetUser } from "@/hooks/api/user.hook";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import XIcon from "@/components/svg/x-icon.svg";
import PinterestIcon from "@/components/svg/pinterest.svg";
import LinkedInIcon from "@/components/svg/linkedin-blue.svg";

const ProfilePictureDialog = dynamic(() => import("./components/ProfilePictureDialog"), {
	ssr: false,
});
const EditProfileDialog = dynamic(() => import("./components/EditProfileDialog"), {
	ssr: false,
});
const SocialDialogsManager = dynamic(() => import("./components/SocialDialogsManager"), {
	ssr: false,
});
const ProfileSkeleton = dynamic(() => import("@/components/loaders/skeletons/ProfileSkeleton"), {
	ssr: false,
});

const platformIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
	tiktok: TiktokIcon,
	youtube: YoutubeIcon,
	instagram: InstagramIcon,
	facebook: FacebookIcon,
	twitter: XIcon,
	pinterest: PinterestIcon,
	linkedin: LinkedInIcon,
};

interface ProfilePageProps {
	params: Promise<{ username: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
	const { username } = use(params);

	const { isAuthenticated, user } = useHttpContext();
	const queryClient = useQueryClient();
	const { data, isLoading, error, refetch } = useGetUser(username);

	const currentUserId = user?.[ClaimTypes.UserId];
	const isOwner = isAuthenticated && data?.id === currentUserId;

	const [openPhotoDialog, setOpenPhotoDialog] = useState(false);
	const [openEditProfileDialog, setOpenEditProfileDialog] = useState(false);
	const [openManageSocial, setOpenManageSocial] = useState(false);
	const [showLoginDialog, setShowLoginDialog] = useState(false);

	const followState = useFollowUser({
		userId: data?.id,
		isFollowing: data?.isFollowing ?? false,
		followersCount: data?.followersCount ?? 0,
	});

	if (error && !isLoading) {
		const errorMessage = (error as { message?: string })?.message ?? "An error occurred!";
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] px-4">
				<div className="flex flex-col items-center max-w-md w-full space-y-4">
					<div className="relative">
						<div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-50"></div>
						<div className="relative bg-white rounded-full p-4 border-2 border-red-100">
							<AlertCircle className="w-8 h-8 text-red-500" strokeWidth={2} />
						</div>
					</div>
					<div className="text-center space-y-2">
						<h2 className="text-xl font-semibold text-gray-900">
							Unable to load profile
						</h2>
						<p className="text-sm text-gray-600 leading-relaxed">
							{errorMessage}
						</p>
					</div>
					<div className="flex gap-3 pt-2">
						<Button
							variant="secondary"
							onClick={() => refetch()}
							className="flex items-center gap-2"
						>
							<RefreshCw className="w-4 h-4" />
							Try again
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (isLoading) return <ProfileSkeleton />;

	return (
		<>
			<div className="flex flex-wrap items-center gap-3 sm:grid sm:grid-cols-[auto_1fr] sm:items-start sm:gap-x-5 sm:gap-y-0">
				<div
					onClick={() => {
						if (isOwner) setOpenPhotoDialog(true);
					}}
					className={`relative w-18 h-18 sm:w-24 sm:h-24 rounded-full shadow-md shadow-[#6136FF40] overflow-hidden shrink-0 ${isOwner ? "cursor-pointer group" : "cursor-default"
						}`}
				>
					<Image src={data?.photo || "/images/avatar.svg"} alt="Avatar" fill className="object-cover" loading="eager" />

					<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 text-white">
						<Camera size={30} strokeWidth={1.5} />
					</div>
				</div>

				<div className="min-w-0 flex-1 sm:flex-none flex flex-col sm:items-start items-center">
					<div className="flex justify-between w-full">
						<div>
							<h3 className="text-lg sm:text-lg font-bold text-black-default">{`${data?.firstName} ${data?.lastName}`}</h3>
							<p className="text-gray-neutral text-sm">@{username}</p>
						</div>

						<div>
							{!isAuthenticated ? (
								<div className="flex items-center gap-3">
									<Button variant="secondary" onClick={() => setShowLoginDialog(true)}>
										Follow
									</Button>
									<Button variant="secondary" onClick={() => setShowLoginDialog(true)}>
										Message
									</Button>
								</div>
							) : isOwner ? (
								<div className="flex gap-2 sm:gap-3">
									<span>
										<Button
											variant="secondary"
											title="Edit Profile"
											size="icon-sm"
											className="sm:hidden"
											onClick={() => setOpenEditProfileDialog(true)}
										>
											<Edit />
										</Button>
										<Button
											variant="secondary"
											title="Edit Profile"
											className="hidden sm:flex"
											onClick={() => setOpenEditProfileDialog(true)}
										>
											Edit profile
										</Button>
									</span>
									<SharePopup user={data} username={username} />
								</div>
							) : (
								<div className="flex items-center gap-3">
									<span>
										<Button
											variant="secondary"
											title="Follow"
											size="icon-sm"
											className="sm:hidden"
											onClick={followState.toggleFollow}
											disabled={!followState.canFollow || followState.isPending}
										>
											{followState.isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
										</Button>
										<Button
											className="hidden sm:flex"
											onClick={followState.toggleFollow}
											disabled={!followState.canFollow || followState.isPending}
										>
											{followState.isPending ? "Updating..." : followState.isFollowing ? "Following" : "Follow"}
										</Button>
									</span>
									<span>
										<Button variant="secondary" title="Message" size="icon-sm" className="sm:hidden" onClick={() => { }}>
											<Mail />
										</Button>
										<Button variant="secondary" title="Message" className="hidden sm:flex" onClick={() => { }}>
											Message
										</Button>
									</span>
									<Button variant="secondary" className="rounded-full h-7 w-7" title="More" onClick={() => { }}>
										<EllipsisVertical />
									</Button>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* ProfileDetails */}
				<div className="w-full sm:col-start-2 sm:-mt-9 mt-4">
					<div className="flex gap-5 my-0 text-sm select-none">
						<p className="flex flex-col gap-1">
							<span className="gradient-text-primary">Posts</span>
							<span className="font-bold text-black-default">{data?.totalPosts ?? 0}</span>
						</p>
						<p className="flex flex-col gap-1">
							<span className="gradient-text-primary">Followers</span>
							<span className="font-bold text-black-default">{data?.followersCount}</span>
						</p>
						<p className="flex flex-col gap-1">
							<span className="gradient-text-primary">Following</span>
							<span className="font-bold text-black-default">{data?.followingCount}</span>
						</p>
					</div>

					<p className="text-black-default text-sm flex flex-col gap-1 select-none">
						{isOwner && <span className="text-gray-neutral">{data?.gender}</span>}
						<span className="mb-3">{data?.bio}</span>
					</p>

					<div className="border-t border-[#D9D9D9] py-3 flex flex-col md:flex-row md:justify-between md:items-start gap-3">
						<div>
							<div className="flex items-center justify-between">
								<p className="text-black-default text-sm font-bold">Connected accounts</p>
							</div>
							<div className="mt-3 flex flex-wrap gap-3">
								{data?.linkedAccounts?.map((account) => {
									const Icon = platformIcons[account.platform.toLowerCase()];
									return (
										<div key={account.id} className="flex items-center gap-1 text-xs">
											<div className="relative w-7 h-7 rounded-full flex justify-center items-center bg-secondary mr-2">
												<UserAvatar src={account?.profileImage} alt="avatar" size="xs" />
												{Icon && <div className="absolute -right-1 bottom-0 z-10 flex h-4 w-4 items-center justify-center">
													<Icon className="w-full h-full" />
												</div>}
											</div>
											<span>{account.username || "@"}</span>
											{account.isVerified && <CheckIcon />}
										</div>
									);
								})}
							</div>
						</div>

						{isOwner && (
							<button
								onClick={() => setOpenManageSocial(true)}
								className="gradient-text-primary text-sm font-semibold cursor-pointer flex items-center gap-2 text-nowrap"
							>
								Manage social media <ArrowBackIcon className="scale-80" />
							</button>
						)}
					</div>
				</div>
			</div>

			<div className="mt-8">
				<ProfileTabs user={data} isOwner={isOwner} username={username} />
			</div>

			{openPhotoDialog && (
				<ProfilePictureDialog open={openPhotoDialog} onClose={() => setOpenPhotoDialog(false)} user={data} username={username} />
			)}

			<EditProfileDialog
				open={openEditProfileDialog}
				onClose={() => setOpenEditProfileDialog(false)}
				openPhotoDialog={() => setOpenPhotoDialog(true)}
				user={data}
				onSuccess={(updatedData) => {
					queryClient.setQueryData(queryKeys.userProfile(username), (old: unknown) => {
						if (old && typeof old === "object") {
							return { ...(old as object), ...updatedData };
						}
						return old;
					});
				}}
			/>
			<SocialDialogsManager
				open={openManageSocial}
				onClose={() => setOpenManageSocial(false)}
				onOpen={() => setOpenManageSocial(true)}
				username={username}
				linkedAccounts={(data?.linkedAccounts ?? [])}
				manualProfiles={(data?.manualProfiles ?? [])}
				setLinkedAccounts={(updater) => {
					queryClient.setQueryData(queryKeys.userProfile(username), (old: unknown) => {
						if (old && typeof old === "object") {
							const profile = old as UserProfileType;
							const newLinkedAccounts = typeof updater === "function" ? updater(profile.linkedAccounts) : updater;
							return { ...profile, linkedAccounts: newLinkedAccounts };
						}
						return old;
					});
				}}
				setManualProfiles={(updater) => {
					queryClient.setQueryData(queryKeys.userProfile(username), (old: unknown) => {
						if (old && typeof old === "object") {
							const profile = old as UserProfileType;
							const newManualProfiles = typeof updater === "function" ? updater(profile.manualProfiles) : updater;
							return { ...profile, manualProfiles: newManualProfiles };
						}
						return old;
					});
				}}
			/>
			{showLoginDialog && (
				<DialogContainer
					open={showLoginDialog}
					onClose={() => setShowLoginDialog(false)}
					title="Log In to Continue"
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
						To interact with this profile, you need to log in or sign up.
					</p>
				</DialogContainer>
			)}
		</>
	);
}
