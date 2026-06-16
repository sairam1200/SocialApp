"use client";

import React from "react";
import Image from "next/image";
import ThumbsUp from "@/components/svg/thumbsup.svg";
import Star from "@/components/svg/Star.svg";
import Autoplay from "embla-carousel-autoplay";

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

export default function ReviewsSection() {
	const reviews = [
		{
			rating: 5,
			text: "“Following people in one place like Gaddr, could really be more effective. I think that’s the future”",
			name: "Linda Hörnfeldt",
			title: "Founder Influencers Sweden",
			image: "/images/linda_testimonial.svg",
		},
		{
			rating: 5,
			text: "“Gaddr is like a swiss knife. Everything in one place”",
			name: "Alexis Piippo",
			title: "CEO Karlex. Founder TropSe",
			image: "/images/alexis_testimonial.svg",
		},
		{
			rating: 4,
			text: "“Thanks to Gaddr, we are now able to have all of our social profiles on one. We want our customers to get the quickest access to all our channels including support”",
			name: "Nova and Daniella",
			title: "Founders YourHappyPeriod",
			image: "/images/nova_testimonial.svg",
		},
		{
			rating: 4,
			text: "“Gaddr is Fantastic! You have gathered all your platforms in one portal!”",
			name: "Simon",
			title: "Pro Gramer",
			image: "/images/simon_testimonial.svg",
		},
	];

	return (
		<div className="w-full bg-[#F0EBFF] py-12 md:py-24 relative overflow-hidden">
			<div className="max-w-7xl mx-auto px-5">
				<h2 className="text-xl md:text-2xl font-bold text-black-default mb-10">Endorsements that speak volumes</h2>

				<Carousel
					plugins={[
						Autoplay({
							delay: 4000,
							stopOnInteraction: true,
							stopOnMouseEnter: true,
						}),
					]}
					opts={{
						align: "start",
						loop: true,
					}}
					className="w-full"
				>
					<CarouselContent className="-ml-4">
						{reviews.map((rev, i) => (
							<CarouselItem key={i} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
								<div
									className="bg-white rounded-t-lg border overflow-hidden flex flex-col h-full"
									style={{ boxShadow: "0px 34.72px 76.2px 0px #450E1529" }}
								>
									<div className="p-6 flex-1 flex flex-col">
										<div className="flex items-center justify-between gap-2 mb-5">
											<div className="flex items-center">
												{Array.from({ length: 5 }).map((_, idx) => (
													<Star
														key={idx}
														className={`scale-80 ${
															idx < rev.rating
																? "text-[#381D8C] fill-[#381D8C]"
																: "text-black-default fill-black-default"
														}`}
													/>
												))}
											</div>

											<div className="flex items-center gap-1 text-xs font-bold text-black-default">
												<ThumbsUp className="scale-75" />
												Testimonial
											</div>
										</div>

										<p className="text-gray-800 text-sm leading-relaxed">{rev.text}</p>
									</div>

									<div
										className="text-white px-6 py-4 flex items-center gap-3"
										style={{
											background: "linear-gradient(132deg, #6400BF 37.13%, #0F13B9 80.11%)",
										}}
									>
										<div className="w-10 h-10 rounded-full overflow-hidden">
											<Image
												src={rev.image}
												width={40}
												height={40}
												alt={rev.name}
												className="object-cover w-full h-full"
											/>
										</div>

										<div className="flex flex-col">
											<span className="text-sm font-semibold">{rev.name}</span>
											<span className="text-xs opacity-90">{rev.title}</span>
										</div>
									</div>
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			</div>

			<Image
				src={`/images/sphere.svg`}
				alt="Image"
				width={300}
				height={300}
				className="absolute -top-10 -right-10 w-[120px] sm:w-40 md:w-[220px]"
				loading="lazy"
				aria-hidden="true"
			/>

			<Image
				src={`/images/cylinder.svg`}
				alt="Image"
				width={300}
				height={300}
				className="absolute -bottom-10 -left-5 w-[120px] sm:w-40 md:w-[220px]"
				loading="lazy"
				aria-hidden="true"
			/>
		</div>
	);
}
