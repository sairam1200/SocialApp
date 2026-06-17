import React from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";

export default function Section3() {
	return (
		<div
			className="w-full relative
        bg-[linear-gradient(117deg,#0D0932_28.21%,#501F98_75.34%)]
        px-4 py-12 md:py-24
        md:px-6
        flex justify-center
        overflow-hidden"
		>
			<div
				className="pointer-events-none absolute inset-0 
          bg-[url('/images/landing-bg-pattern.png')]
          bg-repeat bg-top opacity-[0.05]"
			/>

			<div className="relative max-w-7xl w-full flex flex-col md:flex-row md:justify-between items-center gap-10">
				<div className="flex flex-col md:w-1/2 text-left text-[#FAFAFA] order-1 md:order-1">
					<h2 className="font-bold text-xl md:text-2xl mb-5">One Username for all your profiles.</h2>

					<p className="text-sm md:text-base mb-8">
						Find billions of profiles and content — while verifying your true digital identity and eliminating
						imitators.
					</p>

					<div className="hidden md:flex">
						<Link href="/discover">
							<Button size="lg">Explore More</Button>
						</Link>
					</div>
				</div>

				<div className="flex justify-center md:w-1/2 order-2 md:order-2">
					<Image
						src="/images/landing-accounts.svg"
						alt="One Username for all your profiles"
						width={444}
						height={294}
						loading="lazy"
						fetchPriority="high"
						className="w-[336px] md:w-[444px] h-auto"
						sizes="(min-width: 768px) 444px, 336px"
					/>
				</div>

				<div className="flex justify-center w-full order-3 md:hidden">
					<Link href="/discover">
						<Button size="lg">Explore More</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
