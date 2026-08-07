"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import MenuIcon from "@/components/svg/menu.svg";
import IconHome from "@/components/svg/icon-home.svg";
import CloseIcon from "@/components/svg/icon-close.svg";
import { GaddrProductSwitcher } from "../navigation/GaddrProductSwitcher";
import Image from "next/image";
import AvatarIcon from "@/components/svg/avatar-icon.svg";
import { useHttpContext } from "@/providers/HttpContextProvider";
import { ClaimTypes } from "@/constants/globals";

type Props = {
	className?: string;
};

const navItems = [
	{ label: "Explore", href: "/discover" },
	{ label: "About", href: "/platform-status" },
	{ label: "Product Plans", href: "#" },
];

export default function LandingPrimaryNav({ className = "" }: Props) {
	const { user, isAuthenticated } = useHttpContext();
	const [open, setOpen] = useState(false);

	const profileLink = (
		<Link
			href="/discover"
			aria-label="Open discover"
			className="group flex items-center gap-2 rounded-md px-2 py-1 text-primary-foreground transition-colors hover:bg-primary-foreground/10 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		>
			<span className={"rounded-full bg-accent"}>
				{user?.[ClaimTypes.ProfileImage] ? (
					<Image fetchPriority="high" loading="eager" src={user?.[ClaimTypes.ProfileImage] as string} alt="User avatar" width={30} height={30} className="rounded-full" />
				) : (
					<AvatarIcon className="scale-75 text-accent-foreground" />
				)}
			</span>

			<span className="flex flex-col">
				<span className="font-semibold text-sm">{user?.[ClaimTypes.FullName]}</span>
				<span className="text-xs">@{user?.[ClaimTypes.UserName]}</span>
			</span>
		</Link>
	);

	return (
		<>
			{/* DESKTOP NAV */}
			<nav className={`relative z-50 hidden w-full items-center justify-between md:flex ${className}`}>
				{/* Links */}
				<div className="flex items-center gap-8">
					{/* The estate lives top left on every Gaddr product, so a reader
					    who arrives on one can reach the rest without knowing the
					    hostnames. The list itself is the shared contract. */}
					<GaddrProductSwitcher />

				<ul className="flex gap-8 text-primary-foreground font-medium">
					{navItems.map((item) => (
						<li key={item.label} className="cursor-pointer text-base font-normal leading-6 transition-all hover:-translate-y-0.5 hover:text-accent">
							<Link href={item.href} className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">{item.label}</Link>
						</li>
					))}
				</ul>
				</div>

				{/* Auth */}
				{isAuthenticated ? (
					profileLink
				) : (
					<div className="flex items-center gap-4">
						<Button
							asChild
							variant="link"
							size="lg"
							className="bg-primary-foreground text-primary border-transparent text-base leading-5 font-semibold shadow-[0px_2px_3px_0px_#6136FF40] hover:bg-accent hover:text-accent-foreground"
						>
							<Link href="/login">Log In</Link>
						</Button>

						<Button
							asChild
							variant="link"
							size="lg"
							className="bg-primary-foreground text-primary border-transparent text-base leading-5 font-semibold shadow-[0px_2px_3px_0px_#6136FF40] hover:bg-accent hover:text-accent-foreground"
						>
							<Link href="/signup">Sign Up</Link>
						</Button>
					</div>
				)}
			</nav>

			{/* MOBILE BURGER BUTTON */}
			<button
				className="md:hidden p-2 absolute right-[27px] top-6 text-primary-foreground rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				onClick={() => setOpen(true)}
				aria-label="Open menu"
			>
				<MenuIcon className="w-7 h-7 text-primary-foreground cursor-pointer" />
			</button>

			{/* MOBILE MENU */}
			{open && (
				<div
					className="
                    fixed inset-0 z-50 
					landing-hero-surface
                    flex flex-col items-center
                    pt-20 px-6
                    "
				>
					{/* Close button */}
					<button
						className="md:hidden p-2 absolute right-[27px] top-6 text-primary-foreground rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						onClick={() => setOpen(false)}
						aria-label="Close menu"
					>
						<CloseIcon className="w-7 h-7 text-primary-foreground cursor-pointer" />
					</button>

					{/* Logo */}
					<Link href="/" className="mt-12 mb-12 cursor-pointer" onClick={() => setOpen(false)}>
						<IconHome className="w-12 h-12" />
					</Link>

					{/* Nav links */}
					<nav className="flex flex-col items-center gap-6 text-primary-foreground text-[22px] font-medium mb-10">
						{navItems.map((item) => (
							<Link key={item.label} href={item.href} onClick={() => setOpen(false)} className="rounded-sm transition-colors hover:text-accent active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
								{item.label}
							</Link>
						))}
					</nav>

					{/* Auth buttons */}
					{isAuthenticated ? (
						profileLink
					) : (
						<div className="flex items-center gap-4 mt-4">
							<Button
								variant="outline"
								className="
                                w-[129px] h-[52px] rounded-full border-2 border-primary-foreground/70
                                bg-transparent text-primary-foreground px-8 py-3 text-[18px] font-semibold
                                shadow-[0px_2px_3px_0px_#6136FF40] flex items-center justify-center
                                hover:bg-accent hover:text-accent-foreground
                        "
							>
								<Link href="/login" onClick={() => setOpen(false)}>
									Log In
								</Link>
							</Button>

							<Button
								variant="secondary"
								className="
                                w-[129px] h-[52px] rounded-full bg-primary-foreground text-primary
                                px-8 py-3 text-[18px] font-semibold shadow-[0px_2px_3px_0px_#6136FF40]
                                flex items-center justify-center hover:bg-accent hover:text-accent-foreground
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
