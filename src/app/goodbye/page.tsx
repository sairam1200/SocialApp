"use client";

import Link from "next/link";
import CheckCircle from "@/components/svg/check-circle.svg";
import Footer from "@/components/layouts/Footer";
import { Button } from "@/components/ui/button";
import GaddrLogoXS from "@/components/svg/gaddr-logo-xs.svg";
import GaddrLogo from "@/components/svg/gaddr-logo-l.svg";

export default function GoodbyePage() {
	return (
		<div className="min-h-screen flex flex-col bg-background">
			{/* HEADER */}
			<header className="bg-background py-2 px-4 md:py-2 md:px-12 lg:py-4 lg:px-25 w-full flex items-center justify-center">
				<div className="flex items-center w-full max-w-7xl">
					<Link href="/">
						<div className="hidden md:block">
							<GaddrLogo />
						</div>
						<div className="md:hidden">
							<GaddrLogoXS />
						</div>
					</Link>
				</div>
			</header>

			{/* MAIN CONTENT */}
			<div className="flex-1">
				<section className="flex flex-col bg-background text-foreground py-10 md:py-14 xl:pt-[131px] items-center">
					<div className="max-w-[846px] p-6 flex flex-col items-center mx-auto">
						<CheckCircle />

						<h1 className="text-center font-bold font-montserrat text-[24px] leading-[30px] md:text-[28px] md:leading-[34px] lg:text-[32px] lg:leading-[38.4px] mb-8 max-w-[670px]">
							Your account has been successfully deleted
						</h1>

						<p className="text-center text-[14px] font-opensans leading-[22px] md:text-[15px] md:leading-[23px] lg:text-[16px] lg:leading-6 mb-8 max-w-[580px]">
							Your account has been deactivated and will be permanently removed in 30 days. If you change your mind, you
							can log in again until then.
						</p>

						<h2 className="text-center text-[18px] font-opensans leading-6 md:text-[20px] md:leading-[26px] lg:text-[24px] lg:leading-[28.8px] mb-4 md:mb-8">
							Thank you for being part of our community.
						</h2>

						<div className="py-8 flex flex-col items-center md:flex-row  flex-wrap gap-4 md:gap-12 self-center justify-center">
							{/* TODO: add actual redirect for links */}
							<Link href="/recovery">
								<Button label="Account recovery" variant="secondary" />
							</Link>

							<Link href="/feedback">
								<Button label="Send Feedback" variant="secondary" />
							</Link>
						</div>
					</div>
				</section>
			</div>

			{/*  FOOTER  */}
			<Footer />
		</div>
	);
}
