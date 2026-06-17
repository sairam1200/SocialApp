import React from "react";
import Image from "next/image";

export default function Section3() {
	return (
		<div
			className="w-full relative
        bg-[linear-gradient(117deg,#0D0932_28.21%,#501F98_75.34%)]
        px-4 py-12
        md:px-6 md:py-24
        flex justify-center
        overflow-hidden"
		>
			<div className="pointer-events-none absolute inset-0 bg-[url('/images/landing-bg-pattern.png')] bg-repeat bg-top opacity-[0.05]" />

			<div className="relative max-w-7xl w-full flex flex-col md:flex-row md:justify-between items-center gap-10">
				{/* LEFT: Text */}
				<div className="flex flex-col w-full text-left text-[#FAFAFA] md:w-1/2">
					<h2 className="font-bold text-xl md:text-2xl mb-4">
						Manage all your Social Media from your Mobile or Desktop
					</h2>

					<p className="text-sm md:text-base mb-6">
						Access our web-based platform to manage your social media, keep track of your social presence through
						analytics, post content on multiple platforms at the same time, and more.
					</p>
				</div>

				{/* RIGHT: Image */}
				<div className="flex justify-center md:w-1/2">
					<Image
						src="/images/laptop-mobile.svg"
						alt="Manage your social media from any device"
						width={567}
						height={350}
						loading="lazy"
						fetchPriority="high"
						className="w-[324px] md:w-[567px] h-auto"
						sizes="(min-width: 768px) 567px, 324px"
					/>
				</div>
			</div>
		</div>
	);
}
