import Image from "next/image";
import Link from "next/link";
import BrandIcon from "@/components/icons/BrandIcon";

const Footer = () => {
	return (
		<footer className="py-8 w-full border-t border-[#8260FF40]">
			<div className="px-5 max-w-7xl mx-auto">
				<div className="flex flex-col md:flex-row place-content-between gap-6 md:gap-4">
					<div className="flex gap-3 justify-center md:justify-start items-center">
						<Link href="/">
							<Image src="/images/gaddr.svg" alt="gaddr" width={120} height={100} />
						</Link>
						<p className="text-xs text-[#333333]">Your social media, unified.</p>
					</div>

					<div className="flex gap-6 justify-center flex-wrap">
						<Link href={""} className="text-xs text-[#333333]">
							Help Center
						</Link>
						<Link href={""} className="text-xs text-[#333333]">
							Contact Us
						</Link>
						<Link href={""} className="text-xs text-[#333333]">
							Privacy & Terms
						</Link>
					</div>

					<div className="flex gap-2 justify-center md:justify-start">
						<BrandIcon href=" " src="/icons/gaddr-icon.svg" alt="gaddr" />
						<BrandIcon href=" " src="/icons/twitter.svg" alt="twitter" />
						<BrandIcon href=" " src="/icons/linkedin.svg" alt="linkedin" />
						<BrandIcon href=" " src="/icons/instagram.svg" alt="instagram" />
						<BrandIcon href=" " src="/icons/tiktok.svg" alt="tiktok" />
					</div>
				</div>

				<div className="">
					<p className="text-xs text-[#333333] mx-[9px] mt-4 text-center md:text-left">
						{new Date().getFullYear()} Gaddr Search & Me. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
