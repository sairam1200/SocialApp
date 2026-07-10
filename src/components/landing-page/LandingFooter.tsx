"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { apiClient } from "@/services/apiClient.service";
const socialLinks = [
	{
		href: "https://gaddr.com",
		icon: "/icons/gaddr-icon.svg",
		alt: "Gaddr",
	},
	{
		href: "https://www.tiktok.com/@gaddr",
		icon: "/icons/tiktok.svg",
		alt: "TikTok",
	},
	{
		href: "https://www.instagram.com/gaddr.official",
		icon: "/icons/instagram.svg",
		alt: "Instagram",
	},
	{
		href: "https://www.linkedin.com/company/gaddr",
		icon: "/icons/linkedin.svg",
		alt: "LinkedIn",
	},
	{
		href: "https://www.facebook.com/gaddrcom",
		icon: "/icons/gaddr-fb.svg",
		alt: "Facebook",
	},
	{
		href: "https://x.com/gaddrme",
		icon: "/icons/twitter.svg",
		alt: "Twitter",
	},
];
const footerLinks = [
	{
		title: "About",
		links: [{ label: "About us", href: "https://gaddr.com/" }],
	},
	{
		title: "Features",
		links: [{ label: "Platform features", href: "/platform-status" }],
	},
	{
		title: "Support",
		links: [
			{ label: "Help Center", href: "/contact" },
			{ label: "FAQ", href: "#" },
		],
	},
	{
		title: "Legal",
		links: [
			{ label: "Privacy Policy", href: "/privacy-policy" },
			{ label: "Terms & Conditions", href: "/terms" },
		],
	},
];

const LandingFooter = () => {
	const [email, setEmail] = useState("");
	const [validationError, setValidationError] = useState("");
	const [loading, setLoading] = useState(false);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);

	const handleSubscribe = async () => {
		const trimmed = email.trim().toLowerCase();

		if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
			setValidationError("Please enter a valid email address.");
			setStatusMessage(null);
			return;
		}

		setValidationError("");
		setLoading(true);
		setStatusMessage(null);

		try {
			const result = await apiClient.Newsletter.subscribeAsync({
				email: trimmed,
			});

			if (result.success) {
				if (result.alreadySubscribed) {
					setStatusMessage("You're already subscribed to Gaddr updates.");
				} else {
					setStatusMessage(
						"🎉 Thanks! You've been subscribed to Gaddr updates.",
					);
				}
				setEmail("");
			} else {
				setStatusMessage("Something went wrong. Please try again later.");
			}
		} catch {
			setStatusMessage("Something went wrong. Please try again later.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<footer className="w-full bg-white py-10 border-t text-black-default">
			<div className="max-w-7xl mx-auto px-5">
				{/* TOP GRID */}
				<div className="flex flex-wrap xl:justify-between gap-10 pb-10">
					{/* Logo + Text */}
					<div>
						<Image loading="eager" fetchPriority="high" src="/images/gaddr.svg" alt="gaddr" width={160} height={80} sizes="160px" className="mb-4" />
						<p className="text-sm text-[#333] max-w-xs">
							Discover and stay inspired. All your social content in one place.
						</p>
					</div>

					<div className="flex flex-wrap gap-4 md:gap-8">
						{footerLinks.map((section) => (
							<div key={section.title}>
								<h3 className="font-semibold text-sm mb-3">{section.title}</h3>
								<div className="flex flex-col gap-1">
									{section.links.map((link) => (
										<Link key={link.label} href={link.href} className="text-sm text-primary">
											{link.label}
										</Link>
									))}
								</div>
							</div>
						))}
					</div>

					{/* NEWSLETTER */}
					<div className="max-w-72 w-full">
						<h3 className="font-semibold text-base mb-3 flex items-center gap-2">
							Stay Updated <span>🔔</span>
						</h3>
						<p className="text-sm text-gray-600 mb-4">
							Get the latest job opportunities, hiring trends & platform updates to your inbox.
						</p>

						<div className="flex items-center gap-2 mb-3">
							<div className="relative flex-1">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
								<Input
									type="email"
									placeholder="Enter email..."
									className="text-sm pl-10"
									value={email}
									onChange={(e) => {
										setEmail(e.target.value);
										if (validationError) setValidationError("");
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !loading) handleSubscribe();
									}}
								/>
							</div>

							<Button
								className="rounded-md shadow-md"
								style={{ background: "linear-gradient(132deg, #6400BF 37.13%, #0F13B9 80.11%)" }}
								onClick={handleSubscribe}
								disabled={loading}
							>
								<ArrowRight className="scale-x-150 text-white" />
							</Button>
						</div>

						{validationError && (
							<p className="text-xs text-red-500 mb-2">{validationError}</p>
						)}

						{statusMessage && (
							<p className="text-xs text-gray-700 mb-2">{statusMessage}</p>
						)}

						<p className="text-xs text-gray-600 leading-relaxed">
							By subscribing, you agree to our{" "}
							<Link href="/privacy-policy" className="text-primary underline">
								Privacy policy
							</Link>{" "}
							and{" "}
							<Link href="/terms" className="text-primary underline">
								terms & conditions
							</Link>
							.
						</p>
					</div>
				</div>

				{/* BOTTOM BAR */}
				<div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-[#A1A1A1] pt-10">
					<p className="text-sm text-[#333]">{new Date().getFullYear()} Gaddr. All rights reserved.</p>

					{/* SOCIAL ICONS */}
					<div className="flex items-center gap-4">
						{socialLinks.map((social) => (
							<Link key={social.alt} href={social.href}>
								<Image
									src={social.icon}
									width={40}
									height={40}
									alt={social.alt}
								/>
							</Link>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
};

export default LandingFooter;
