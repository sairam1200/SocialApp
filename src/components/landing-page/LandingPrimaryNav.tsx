"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import MenuIcon from "@/components/svg/menu.svg";
import IconHome from "@/components/svg/icon-home.svg";
import CloseIcon from "@/components/svg/icon-close.svg";
import ProfileMenu from "../navigation/ProfileMenu";
import Image from "next/image";
import AvatarIcon from "@/components/svg/avatar-icon.svg";
import { useHttpContext } from "@/providers/HttpContextProvider";
import { ClaimTypes } from "@/constants/globals";

type Props = {
	className?: string;
};

const navItems = [
	{ label: "Explore", href: "/" },
	{ label: "About", href: "/about" },
	{ label: "Product Plans", href: "/plans" },
];

export default function LandingPrimaryNav({ className = "" }: Props) {
	const { user, isAuthenticated } = useHttpContext();
	const [open, setOpen] = useState(false);

	const triggerElement = (
		<div className="text-white flex items-center gap-2 cursor-pointer">
			<span className={"rounded-full bg-[#F0EBFF]"}>
				{user?.[ClaimTypes.ProfileImage] ? (
					<Image src={user?.[ClaimTypes.ProfileImage] as string} alt="User avatar" width={30} height={30} className="rounded-full" />
				) : (
					<AvatarIcon className="scale-75 text-[#0D0D0D]" />
				)}
			</span>

			<span>
				<p className="font-semibold text-sm">
					{user?.[ClaimTypes.FullName]}
				</p>
				<p className="text-xs">@{user?.[ClaimTypes.UserName]}</p>
			</span>
		</div>
	);

	return (
		<>
			{/* DESKTOP NAV */}
			<nav className={`hidden md:flex justify-between items-center w-full ${className}`}>
				{/* Links */}
				<ul className="flex gap-8 text-white font-medium">
					{navItems.map((item) => (
						<li key={item.href} className="cursor-pointer transition text-base font-normal leading-6 hover:opacity-80">
							<Link href={item.href}>{item.label}</Link>
						</li>
					))}
				</ul>

				{/* Auth */}
				{isAuthenticated ? (
					<ProfileMenu triggerElement={triggerElement} contentProps={{ side: "bottom", align: "end" }} />
				) : (
					<div className="flex items-center gap-4">
						<Button
							variant="link"
							size="default"
							className="text-white underline text-base leading-5 font-semibold shadow-none"
						>
							<Link href="/login">Log In</Link>
						</Button>

						<Button
							variant="secondary"
							size="lg"
							className="bg-white text-[#6E2CF0] border-transparent text-base 
                        leading-5 font-semibold shadow-[0px_2px_3px_0px_#6136FF40]"
						>
							<Link href="/signup">Sign Up</Link>
						</Button>
					</div>
				)}
			</nav>

			{/* MOBILE BURGER BUTTON */}
			<button
				className="md:hidden p-2 absolute right-[27px] top-6 text-white"
				onClick={() => setOpen(true)}
				aria-label="Open menu"
			>
				<MenuIcon className="w-7 h-7 text-white cursor-pointer" />
			</button>

			{/* MOBILE MENU */}
			{open && (
				<div
					className="
                    fixed inset-0 z-50 
                    bg-[linear-gradient(117deg,#0D0932_28.21%,#501F98_75.34%)]
                    flex flex-col items-center
                    pt-20 px-6
                    "
				>
					{/* Close button */}
					<button
						className="md:hidden p-2 absolute right-[27px] top-6 text-white"
						onClick={() => setOpen(false)}
						aria-label="Close menu"
					>
						<CloseIcon className="w-7 h-7 text-white cursor-pointer" />
					</button>

					{/* Logo */}
					<Link href="/" className="mt-12 mb-12 cursor-pointer" onClick={() => setOpen(false)}>
						<IconHome className="w-12 h-12" />
					</Link>

					{/* Nav links */}
					<nav className="flex flex-col items-center gap-6 text-white text-[22px] font-medium mb-10">
						{navItems.map((item) => (
							<Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="active:opacity-70">
								{item.label}
							</Link>
						))}
					</nav>

					{/* Auth buttons */}
					{isAuthenticated ? (
						<ProfileMenu triggerElement={triggerElement} contentProps={{ side: "bottom", align: "center" }} />
					) : (
						<div className="flex items-center gap-4 mt-4">
							<Button
								variant="outline"
								className="
                                w-[129px] h-[52px] rounded-full border-2 border-[#F0EBFF]
                                bg-transparent text-white px-8 py-3 text-[18px] font-semibold
                                shadow-[0px_2px_3px_0px_#6136FF40] flex items-center justify-center
                                hover:bg-transparent hover:text-white
                        "
							>
								<Link href="/login" onClick={() => setOpen(false)}>
									Log In
								</Link>
							</Button>

							<Button
								variant="secondary"
								className="
                                w-[129px] h-[52px] rounded-full bg-[#FAFAFA] text-[#6E2CF0]
                                px-8 py-3 text-[18px] font-semibold shadow-[0px_2px_3px_0px_#6136FF40]
                                flex items-center justify-center
                        "
							>
								<Link href="/signup" onClick={() => setOpen(false)}>
									Sign Up
								</Link>
							</Button>
						</div>
					)}
				</div>
			)}
		</>
	);
}
