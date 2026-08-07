"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Play, ShoppingBag } from "lucide-react";
import { cn } from "@/utils/cn.util";
import type { PostMedia, ProductTag } from "@/types/community.type";
import { formatMinor } from "./PostCard";

export interface PostMediaGridProps {
	media: PostMedia[];
	products?: ProductTag[];
	className?: string;
}

/**
 * Media layout by count: 1 full-bleed, 2 side by side, 3 with a lead, 4 in a
 * grid. Beyond four the rest are counted on the last tile.
 *
 * Aspect ratios are fixed per layout rather than derived from the asset, so the
 * page does not reflow as images load — layout shift in a feed is the thing
 * that makes people tap the wrong post.
 */
export function PostMediaGrid({ media, products = [], className }: PostMediaGridProps) {
	const t = useTranslations("community");
	if (media.length === 0) return null;

	const visible = media.slice(0, 4);
	const overflow = media.length - visible.length;

	const layout =
		visible.length === 1
			? "grid-cols-1"
			: visible.length === 2
				? "grid-cols-2"
				: "grid-cols-2";

	return (
		<div
			className={cn(
				"grid gap-1 overflow-hidden rounded-xl border border-border",
				layout,
				className,
			)}
			data-testid="post-media"
		>
			{visible.map((item, index) => {
				const isLead = visible.length === 3 && index === 0;
				const tags = products.filter((p) => p.mediaIndex === index);

				return (
					<MediaTile
						key={item.id}
						media={item}
						products={tags}
						overflowCount={index === visible.length - 1 ? overflow : 0}
						overflowLabel={t("morePhotos", { count: overflow })}
						className={cn(
							visible.length === 1 && "aspect-[16/10]",
							visible.length === 2 && "aspect-square",
							visible.length >= 3 && "aspect-square",
							isLead && "row-span-2 aspect-auto",
						)}
					/>
				);
			})}
		</div>
	);
}

interface MediaTileProps {
	media: PostMedia;
	products: ProductTag[];
	overflowCount: number;
	overflowLabel: string;
	className?: string;
}

function MediaTile({
	media,
	products,
	overflowCount,
	overflowLabel,
	className,
}: MediaTileProps) {
	const [failed, setFailed] = useState(false);
	const isVideo = media.kind === "video";
	const source = isVideo ? (media.thumbnailUrl ?? media.url) : media.url;

	return (
		<figure
			className={cn("relative overflow-hidden bg-muted", className)}
			style={
				media.placeholderColor
					? { backgroundColor: media.placeholderColor }
					: undefined
			}
		>
			{!failed ? (
				isVideo ? (
					<video
						src={media.url}
						poster={media.thumbnailUrl}
						controls
						playsInline
						preload="metadata"
						className="h-full w-full object-cover"
						onError={() => setFailed(true)}
						aria-label={media.altText ?? "Video"}
					/>
				) : (
					<Image
						src={source}
						// Alt text is required by the composer for images; an empty string
						// here is the correct fallback for decorative media, not a
						// placeholder like "image".
						alt={media.altText ?? ""}
						fill
						sizes="(max-width: 640px) 100vw, 600px"
						className="object-cover"
						onError={() => setFailed(true)}
					/>
				)
			) : (
				<span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
					{media.altText ?? ""}
				</span>
			)}

			{isVideo && (
				<span className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<span className="rounded-full bg-black/55 p-3">
						<Play className="size-6 fill-white text-white" aria-hidden />
					</span>
				</span>
			)}

			{products.map((product) => (
				<a
					key={product.productId}
					href={product.url ?? "#"}
					target="_blank"
					rel="noopener noreferrer"
					className="absolute inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-background/95 px-2.5 py-1 text-xs font-medium shadow-md backdrop-blur hover:bg-background"
					style={{
						left: `${(product.x ?? 0.5) * 100}%`,
						top: `${(product.y ?? 0.5) * 100}%`,
					}}
				>
					<ShoppingBag className="size-3" aria-hidden />
					<span className="max-w-[10rem] truncate">{product.title}</span>
					{product.priceMinor && (
						<span>{formatMinor(product.priceMinor, product.currency)}</span>
					)}
				</a>
			))}

			{overflowCount > 0 && (
				<span className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-semibold text-white">
					{overflowLabel}
				</span>
			)}
		</figure>
	);
}
