"use client";

import dynamic from "next/dynamic";
import { LandingHeader, Section2 } from "@/components/landing-page";
import ReviewsSection from "@/components/landing-page/ReviewsSection";
import LandingFooter from "@/components/landing-page/LandingFooter";

// Lazy load below-the-fold sections for better performance
const Section3 = dynamic(() => import("@/components/landing-page/Section3"));
const Section4 = dynamic(() => import("@/components/landing-page/Section4"));
const Section5 = dynamic(() => import("@/components/landing-page/Section5"));

export default function Home() {
	return (
		<div className="overflow-x-hidden">
			<LandingHeader />
			<Section2 />
			<Section3 />
			<Section4 />
			<Section5 />
			<ReviewsSection />
			<LandingFooter />
		</div>
	);
}
