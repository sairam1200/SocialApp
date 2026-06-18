import React from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { useState } from "react";
export default function Section4() {
	const [svgLoaded, setSvgLoaded] = useState(false);
	return (
		<>
			<div className="w-full relative bg-white overflow-hidden py-12 md:py-32">
				<div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-12">
					<div className="lg:w-5/12 text-left z-10 text-black-default">
						<h2 className="text-xl md:text-2xl font-bold mb-3">Universal Unified Discovery</h2>
						<p className="text-base md:text-xl font-semibold mb-4 text-primary md:text-black-default">
							Loaded with powerful features
						</p>
						<p className="text-sm md:text-base mb-12 max-w-lg mx-auto">
							Search, surf, and discover content across your selected social media platforms — all from one place. Stay
							inspired and updated without hopping between apps. Save time, spark ideas. Try it for free!
						</p>

						<Button size="lg" className="hidden md:block">
							Get Demo Now
						</Button>
					</div>

					<div className="md:w-7/12 relative flex items-center justify-center md:justify-end">
						<Image
							src={`/images/2d-shape-cube.svg`}
							alt="Decorative background shape"
							width={400}
							height={500}
							className="absolute md:top-1/2 md:-translate-y-[60%] md:-left-20 md:-translate-x-3 z-0 pointer-events-none select-none"
							loading="lazy"
							aria-hidden="true"
						/>

						<div className="relative max-w-full md:max-w-4xl">
							{/* Fast WebP placeholder */}
							<Image
								src="/images/platform-image.webp"
								alt="Platform"
								width={1100}
								height={720}
								priority
								className={`absolute inset-0 w-full h-auto transition-opacity duration-500 ${svgLoaded ? "opacity-0" : "opacity-100"
									}`}
							/>

							{/* Heavy SVG */}
							<Image
								src="/images/platform-image.svg"
								alt="Platform"
								width={1100}
								height={720}
								onLoad={() => setSvgLoaded(true)}
								className={`w-full h-auto transition-opacity duration-500 ${svgLoaded ? "opacity-100" : "opacity-0"
									}`}
							/>
						</div>
					</div>

					<Button size="lg" className="md:hidden">
						Get Demo Now
					</Button>
				</div>
			</div>

			<div className="w-full  bg-[#F0EBFF] overflow-hidden py-24 md:py-32 flex items-center justify-center">
				<div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 text-black-default">
					<h2 className="text-lg md:text-3xl font-bold mb-4">
						10,000+ Users Worldwide! <span>🎉</span>
					</h2>
					<p className="text-sm md:text-lg md:font-semibold mb-12">
						Creators, explorers, business owners, and dreamers from every corner of the world
					</p>
					<Button size="lg" className="">
						Join Community Now
					</Button>

					<Image
						src={`/images/avatar-img-1.svg`}
						alt="Avatar"
						width={72}
						height={72}
						className="absolute -top-14 left-0 md:-left-5 w-12 h-12 md:w-20 md:h-20"
						loading="lazy"
						aria-hidden="true"
					/>

					<Image
						src={`/images/avatar-img-2.svg`}
						alt="Avatar"
						width={72}
						height={72}
						className="absolute -top-14 right-0 md:-right-5 w-12 h-12 md:w-20 md:h-20"
						loading="lazy"
						fetchPriority="low"
						aria-hidden="true"
					/>

					<Image
						src={`/images/avatar-img-3.svg`}
						alt="Avatar"
						width={72}
						height={72}
						className="absolute -bottom-10 left-14 w-12 h-12 md:w-20 md:h-20"
						loading="lazy"
						fetchPriority="low"
						aria-hidden="true"
					/>

					<Image
						src={`/images/avatar-img-1.svg`}
						alt="Avatar"
						width={72}
						height={72}
						className="absolute -bottom-10 right-14 w-12 h-12 md:w-20 md:h-20"
						loading="lazy"
						fetchPriority="low"
						aria-hidden="true"
					/>

					<Image
						src={`/images/pyramid.svg`}
						alt="Pyramid 3D shape"
						width={60}
						height={60}
						className="absolute -left-5 bottom-5"
						loading="lazy"
						fetchPriority="low"
						aria-hidden="true"
					/>

					<Image
						src={`/images/sphere.svg`}
						alt="Cube 3D shape"
						width={50}
						height={50}
						className="absolute -top-20 left-1/3"
						loading="lazy"
						fetchPriority="low"
						aria-hidden="true"
					/>

					<Image
						src={`/images/cube.svg`}
						alt="Cylinder 3D shape"
						width={50}
						height={50}
						className="absolute top-1/2 -right-5"
						loading="lazy"
						fetchPriority="low"
						aria-hidden="true"
					/>

					<Image
						src={`/images/cylinder.svg`}
						alt="Sphere 3D shape"
						width={60}
						height={60}
						className="absolute bottom-0 right-1/4"
						loading="lazy"
						fetchPriority="low"
						aria-hidden="true"
					/>
				</div>
			</div>
		</>
	);
}
