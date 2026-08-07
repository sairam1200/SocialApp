"use client";
import dynamic from "next/dynamic";
import { LandingHeader, Section2 } from "@/components/landing-page";
import ReviewsSection from "@/components/landing-page/ReviewsSection";
import LandingFooter from "@/components/landing-page/LandingFooter";
// import Section3 from "@/components/landing-page/Section3";
// import Section4 from "@/components/landing-page/Section4";
// import Section5 from "@/components/landing-page/Section5";


const sectionPlaceholder = (
  <div className="w-full h-64 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse rounded-lg bg-[length:200%_100%]" />
);

const Section3 = dynamic(() => import("@/components/landing-page/Section3"), {
  loading: () => sectionPlaceholder,
});
const Section4 = dynamic(() => import("@/components/landing-page/Section4"), {
  loading: () => sectionPlaceholder,
});
const Section5 = dynamic(() => import("@/components/landing-page/Section5"), {
  loading: () => sectionPlaceholder,
});

export default function Home() {
	return (
		<div className="landing-shell overflow-x-hidden">
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
