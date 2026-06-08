"use client";

import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import CopyIcon from "@/components/svg/copy.svg";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/utils/cn.util";
import { UserProfileType } from "@/types/account/profile.type";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
	FacebookShareButton,
	LinkedinShareButton,
	TwitterShareButton,
	WhatsappShareButton,
	EmailShareButton,
} from "react-share";
import { Share } from "lucide-react";

const socialShare = [
	{ platform: "facebook", Button: FacebookShareButton },
	{ platform: "x", Button: TwitterShareButton },
	{ platform: "linkedin", Button: LinkedinShareButton },
	{ platform: "whatsapp", Button: WhatsappShareButton },
	{ platform: "email", Button: EmailShareButton },
];

const SharePopup = ({ user, username }: { user: UserProfileType | undefined; username: string }) => {
	const pathname = usePathname();
	const [profileUrl, setProfileUrl] = useState("");
	const [copied, setCopied] = useState(false);

	const copyToClipboard = () => {
		if (!profileUrl) return;

		navigator.clipboard.writeText(profileUrl);
		setCopied(true);

		setTimeout(() => setCopied(false), 2000);
	};

	useEffect(() => {
		if (typeof window !== "undefined") {
			setProfileUrl(`${window.location.origin}${pathname}`);
		}
	}, [pathname]);

	return (
		<Popover>
			<PopoverTrigger
				title="Share"
				className={cn(buttonVariants({ variant: "secondary", size: "icon-sm" }), "sm:hidden")}
			>
				<Share />
			</PopoverTrigger>

			<PopoverTrigger title="Share" className={cn(buttonVariants({ variant: "secondary" }), "hidden sm:flex")}>
				Share
			</PopoverTrigger>

			<PopoverContent>
				<div>
					<h2 className="font-bold text-sm">Share Profile</h2>
				</div>
				<div className="flex items-center gap-3 border border-[#E6E6E6] bg-[#F8F8F8] p-2 rounded-md mt-3">
					<div className="relative w-8 h-8 rounded-full shadow-md shadow-[#6136FF40] overflow-hidden cursor-pointer group">
						<Image src={user?.photo ?? "/images/avatar.svg"} alt="Avatar" fill className="object-cover" />
					</div>
					<div>
						<h3 className="text-xs font-bold text-black-default">{`${user?.firstName} ${user?.lastName}`}</h3>
						<p className="text-gray-neutral text-xs">@{username}</p>
					</div>
				</div>
				<div className="mt-5">
					<p className="font-bold text-sm mb-2">Profile Link</p>
					<div className="flex gap-2 items-center relative">
						<span className="border border-[#E6E6E6] p-2 text-xs rounded-md flex-1">
							{profileUrl || `https://gaddr.me/${username}`}
						</span>

						{copied ? (
							<div className="border bg-[#F8F8F8] text-xs p-1 rounded-md z-10 absolute right-0 top-1/2 -translate-y-1/2">
								Link copied!
							</div>
						) : (
							<button
								onClick={copyToClipboard}
								className={`border border-[#E6E6E6] rounded-lg flex items-center justify-center p-2 cursor-pointer `}
							>
								<CopyIcon />
							</button>
						)}
					</div>
				</div>

				<div className="mt-5">
					<p className="font-bold text-sm mb-2">Share on social media</p>
					<div className="grid grid-cols-3 gap-3">
						{socialShare.map(({ platform, Button }) => (
							<Button key={platform} url={profileUrl} title="Gaddr" className="cursor-pointer">
								<Image src={`/images/${platform}_share_button.svg`} width={100} height={60} alt={platform} />
							</Button>
						))}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default SharePopup;
