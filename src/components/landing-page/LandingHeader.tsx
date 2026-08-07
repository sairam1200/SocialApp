import  { FC } from "react";
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
			className="landing-hero-surface relative z-[70] w-full overflow-visible pb-[131px] md:min-h-[626px] md:pb-40
        flex flex-col items-center
			px-[27px] md:px-[45px] pt-6 md:pt-7"
		>
			<div
				className=" pointer-events-none absolute inset-0
            bg-[url('/images/landing-bg-pattern.webp')]
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
							bg-primary gradient-bg-primary px-6 py-[7.5px] text-[12px] leading-[18px] font-bold text-primary-foreground
                            md:px-8 md:py-4 md:text-[16px] md:leading-5 md:font-montserrat md:font-semibold
							cursor-pointer transition-all hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
