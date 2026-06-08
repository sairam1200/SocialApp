"use client";

import React, { FC } from "react";
import GaddrLogo from "@/components/svg/gaddr-logo.svg";
import { SearchBar } from "./LandingSearch";
import LandingPrimaryNav from "./LandingPrimaryNav";
import { useRouter } from "next/navigation";

const suggestions = ["Hidden Gems in Turkey", "Smart Travel", "Monetize your Instagram", "AI-Optimize your Business"];

const LandingHeader: FC = () => {
	const router = useRouter();

	const handleSearch = (query: string) => {
		router.push(`/discover?q=${encodeURIComponent(query)}`);
	};

	return (
		<header
			className="relative w-full pb-[131px] md:min-h-[626px] md:pb-40
        bg-[linear-gradient(117deg,#0D0932_28.21%,#501F98_75.34%)] flex flex-col items-center
        px-[27px] md:px-[45px] pt-6 md:pt-7 overflow-hidden"
		>
			<div
				className=" pointer-events-none absolute inset-0
            bg-[url('/images/landing-bg-pattern.png')]
            bg-repeat bg-top opacity-[0.05]"
			/>

			<div className="max-w-7xl w-full">
				<LandingPrimaryNav />
			</div>

			{/* Header content */}
			<div className="flex flex-col items-center text-center mt-10 md:mt-16">
				<GaddrLogo className="w-[180px] h-[67px] md:w-[255px] md:h-[92px] mb-6 md:mb-[18px]" />
				<SearchBar onSearch={handleSearch} />

				<div
					className="flex flex-wrap justify-center
                    gap-x-[13px] gap-y-3.5 md:gap-4 mt-10"
				>
					{suggestions.map((t) => (
						<button
							key={t}
							onClick={() => handleSearch(t)}
							className="rounded-full shadow-[0_2px_3px_0px_#6136FF40]
                            bg-[#970EB6] px-6 py-[7.5px] text-[12px] leading-[18px] font-bold text-[#FAFAFA]
                            md:px-8 md:py-4 md:text-[16px] md:leading-5 md:font-montserrat md:font-semibold
                            md:bg-[linear-gradient(271.34deg,#C536FF_9.45%,#6136FF_67.39%),linear-gradient(0deg,rgba(13,13,13,0.16),rgba(13,13,13,0.16))] cursor-pointer"
						>
							{t}
						</button>
					))}
				</div>
			</div>
		</header>
	);
};

export default LandingHeader;
