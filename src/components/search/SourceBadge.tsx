"use client";

import GaddrLogo from "@/components/svg/gaddr-logo-xs.svg";
import { cn } from "@/utils/cn.util";
import { renderPlatformIcon } from "@/lib/card-helpers";
import type { SearchSource } from "@/types/unified-search.type";

export interface SourceBadgeProps {
	source: SearchSource;
	size?: "sm" | "md";
	className?: string;
}

/**
 * Where a result came from.
 *
 * Our own content carries the Gaddr mark and a tinted chip; everything else
 * gets the platform's own icon in a neutral one. That asymmetry is the point —
 * a reader scanning a mixed list should be able to tell at a glance which
 * results play here and which are links off-site, without reading the label.
 *
 * `isNative` comes from the API rather than being inferred from the URL,
 * because "ours" is a product fact, not a hostname fact: a job aggregated by
 * Gaddr Jobs is ours and hosted elsewhere at the same time.
 */
export function SourceBadge({ source, size = "sm", className }: SourceBadgeProps) {
	const isSmall = size === "sm";

	return (
		<span
			data-testid="source-badge"
			data-platform={source.platform}
			data-native={source.isNative}
			title={source.label}
			className={cn(
				"inline-flex shrink-0 items-center gap-1 rounded-full font-medium",
				isSmall ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
				source.isNative
					? "bg-secondary text-primary"
					: "bg-muted text-muted-foreground",
				className,
			)}
		>
			{source.isNative ? (
				<GaddrLogo
					aria-hidden
					className={cn("shrink-0", isSmall ? "h-3 w-auto" : "h-3.5 w-auto")}
				/>
			) : (
				<span aria-hidden className="inline-flex items-center justify-center">
					{renderPlatformIcon(
						source.platform,
						isSmall ? "size-3" : "size-3.5",
					)}
				</span>
			)}
			{source.label}
		</span>
	);
}
