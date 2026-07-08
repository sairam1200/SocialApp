import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const footerLinks = [
	{
		title: "About",
		links: [{ label: "About us", href: "#" }],
	},
	{
		title: "Features",
		links: [{ label: "Platform features", href: "#" }],
	},
	{
		title: "Support",
		links: [
			{ label: "Help Center", href: "#" },
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
								<Input type="email" placeholder="Enter email..." className="text-sm pl-10" />
							</div>

							<Button
								className="rounded-md shadow-md"
								style={{ background: "linear-gradient(132deg, #6400BF 37.13%, #0F13B9 80.11%)" }}
							>
								<ArrowRight className="scale-x-150 text-white" />
							</Button>
						</div>

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
						<Image className="shrink-0" fetchPriority="low" loading="lazy"  src="/icons/gaddr-icon.svg" width={40} height={40} alt="gaddr" sizes="40px" />
						<Image className="shrink-0" fetchPriority="low" loading="lazy"  src="/icons/tiktok.svg" width={40} height={40} alt="tiktok" sizes="40px" />
						<Image className="shrink-0" fetchPriority="low" loading="lazy"  src="/icons/instagram.svg" width={40} height={40} alt="instagram" sizes="40px" />
						<Image className="shrink-0" fetchPriority="low" loading="lazy"  src="/icons/linkedin.svg" width={40} height={40} alt="linkedin" sizes="40px" />
						<Image className="shrink-0" fetchPriority="low" loading="lazy"  src="/icons/gaddr-fb.svg" width={40} height={40} alt="facebook" sizes="40px" />
						<Image className="shrink-0" fetchPriority="low" loading="lazy"  src="/icons/twitter.svg" width={40} height={40} alt="twitter" sizes="40px" />
					</div>
				</div>
			</div>
		</footer>
	);
};

export default LandingFooter;
