import Image from "next/image";
import Link from "next/link";
import BrandIcon from "@/components/icons/BrandIcon";

const Footer = () => {
	return (
		<footer className="w-full bg-transparent py-8 border-t border-primary/25">
			<div className="px-5 max-w-7xl mx-auto">
				<div className="flex flex-col md:flex-row place-content-between gap-6 md:gap-4">
					<div className="flex gap-3 justify-center md:justify-start items-center">
						<Link href="/">
							<Image src="/images/gaddr.svg" alt="gaddr" width={120} height={100} />
						</Link>
						<p className="text-xs text-foreground">Your social media, unified.</p>
					</div>

					<div className="flex gap-6 justify-center flex-wrap">
						<Link href={"/contact"} className="text-xs text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
							Help Center
						</Link>
						<Link href={"/contact"} className="text-xs text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
							Contact Us
						</Link>
						<Link href={"/privacy-policy"} className="text-xs text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
							Privacy Policy
						</Link>
						<Link href={"/terms"} className="text-xs text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
							Terms & Conditions
						</Link>
					</div>

					<div className="flex gap-2 justify-center md:justify-start">
						<BrandIcon className="rounded-full transition-transform hover:-translate-y-0.5 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="https://gaddr.com" src="/icons/gaddr-icon.svg" alt="gaddr" />
						<BrandIcon className="rounded-full transition-transform hover:-translate-y-0.5 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="https://x.com" src="/icons/twitter.svg" alt="twitter" />
						<BrandIcon className="rounded-full transition-transform hover:-translate-y-0.5 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="https://www.linkedin.com/company/gaddr" src="/icons/linkedin.svg" alt="linkedin" />
						<BrandIcon className="rounded-full transition-transform hover:-translate-y-0.5 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="https://www.instagram.com" src="/icons/instagram.svg" alt="instagram" />
						<BrandIcon className="rounded-full transition-transform hover:-translate-y-0.5 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="https://www.tiktok.com" src="/icons/tiktok.svg" alt="tiktok" />
					</div>
				</div>

				<div className="">
					<p className="text-xs text-foreground mx-[9px] mt-4 text-center md:text-left">
						{new Date().getFullYear()} Gaddr Search & Me. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
