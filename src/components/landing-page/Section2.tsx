import React from "react";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "../ui/button";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";

const CompanyCarouselImages = ["breakit", "mashable", "synsam", "schibsted", "academedia"];

const DiscoveryImages = [
	"discovery-image-1.svg",
	"discovery-image-2.svg",
	"discovery-image-3.svg",
	"discovery-image-4.svg",
	"discovery-image-5.svg",
	"discovery-image-6.svg",
	"discovery-image-7.svg",
	["discovery-image-8.svg", "discovery-image-8-blured.svg"],
	"discovery-image-9.svg",
];

export default function Section2() {
	return (
		<div className="w-full bg-[#F0EBFF] relative">
			{/* Company Carousel */}
			<div className="w-full py-4 lg:py-6 bg-white z-10" style={{ boxShadow: "0px 4px 8px 0px #737373" }}>
				<Carousel
					opts={{ loop: true }}
					plugins={[
						Autoplay({
							delay: 2000,
							stopOnInteraction: true,
							stopOnMouseEnter: true,
							active: true,
						}),
					]}
					className="w-full max-w-7xl mx-auto"
				>
					<CarouselContent>
						{CompanyCarouselImages.map((img, i) => (
							<CarouselItem key={i} className="flex justify-center p-4 basis-auto lg:basis-1/5">
								<Image
									src={`/images/${img}.svg`}
									alt={img}
									width={160}
									height={40}
									className="object-contain w-24 md:w-40"
									loading="lazy"
								/>
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			</div>

			{/* DISCOVERY SECTION */}
			<div className="relative overflow-hidden py-12 md:py-32">
				<h2 className="text-xl md:text-2xl font-bold mb-8 text-center">Universal Unified Discovery</h2>

				{/* MOBILE: Carousel version */}
				<div className="md:hidden px-4">
					<Carousel
						opts={{ loop: true }}
						plugins={[
							Autoplay({
								delay: 2500,
								stopOnInteraction: false,
							}),
						]}
					>
						<CarouselContent>
							{DiscoveryImages.map((img, i) => (
								<CarouselItem key={i} className="basis-3/4">
									<div
										className="w-full h-[420px] rounded-lg overflow-hidden"
										style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
									>
										{typeof img === "string" ? (
											<Image
												src={`/images/${img}`}
												alt={`Discovery ${i}`}
												width={400}
												height={600}
												className="w-full h-full object-cover"
												loading="lazy"
											/>
										) : (
											<div className="relative w-full h-full">
												<div className="w-full h-full flex items-start justify-center absolute">
													<Image
														src={`/images/${img[0]}`}
														alt=""
														width={400}
														height={600}
														className="translate-y-[4%]"
													/>
												</div>
												<Image
													src={`/images/${img[1]}`}
													alt=""
													width={400}
													height={600}
													className="h-full w-full object-cover"
												/>
											</div>
										)}
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
					</Carousel>
				</div>

				{/* DESKTOP: grid */}
				<div className="hidden md:grid grid-cols-4 gap-4 max-w-6xl px-4 mx-auto z-10">
					{/* Column 1 */}
					<div className="flex flex-col gap-4 h-full">
						<Image
							src={`/images/${DiscoveryImages[0]}`}
							alt=""
							width={400}
							height={600}
							className="h-7/12 w-full object-cover"
						/>
						<Image
							src={`/images/${DiscoveryImages[1]}`}
							alt=""
							width={400}
							height={600}
							className="h-5/12 w-full object-cover"
						/>
					</div>

					{/* Column 2 */}
					<div className="flex flex-col gap-4 h-full">
						<Image
							src={`/images/${DiscoveryImages[2]}`}
							alt=""
							width={400}
							height={600}
							className="h-3/12 w-full object-cover"
						/>
						<Image
							src={`/images/${DiscoveryImages[3]}`}
							alt=""
							width={400}
							height={600}
							className="h-9/12 w-full object-cover"
						/>
					</div>

					{/* Column 3 */}
					<div className="flex flex-col gap-4 h-full">
						<Image
							src={`/images/${DiscoveryImages[4]}`}
							alt=""
							width={400}
							height={600}
							className="h-4/12 w-full object-cover"
						/>
						<Image
							src={`/images/${DiscoveryImages[5]}`}
							alt=""
							width={400}
							height={600}
							className="h-4/12 w-full object-cover"
						/>
						<Image
							src={`/images/${DiscoveryImages[6]}`}
							alt=""
							width={400}
							height={600}
							className="h-4/12 w-full object-cover"
						/>
					</div>

					{/* Column 4 */}
					<div className="flex flex-col gap-4 h-full">
						<div className="relative w-full h-7/12">
							<div className="w-full h-full flex items-center justify-center absolute">
								<Image
									src={`/images/${DiscoveryImages[7][0]}`}
									alt=""
									width={400}
									height={600}
									className="translate-y-[4%]"
								/>
							</div>
							<Image
								src={`/images/${DiscoveryImages[7][1]}`}
								alt=""
								width={400}
								height={600}
								className="h-full w-full object-cover"
							/>
						</div>

						<Image
							src={`/images/${DiscoveryImages[8]}`}
							alt=""
							width={400}
							height={600}
							className="h-5/12 w-full object-cover"
						/>
					</div>
				</div>

				{/* CTA Button */}
				<div className="flex justify-center mt-14">
					<Link href="/discover">
						<Button size="lg">Explore More</Button>
					</Link>
				</div>

				{/* Background Shapes */}
				<Image
					src={`/images/pyramid.svg`}
					alt=""
					width={400}
					height={400}
					className="absolute -top-30 -right-40 hidden sm:block"
				/>
				<Image
					src={`/images/cube.svg`}
					alt=""
					width={300}
					height={300}
					className="absolute -bottom-30 -left-15 hidden sm:block"
				/>
			</div>
		</div>
	);
}
