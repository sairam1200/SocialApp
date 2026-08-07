"use client";

import { useTranslations } from "next-intl";
import GaddrLogo from "@/components/svg/gaddr-logo-xs.svg";
import { gaddrLabs, gaddrProducts } from "@/modules/gaddr-platform/estate";
import { GaddrSwitcher } from "@/modules/gaddr-platform/react";
import { useState } from "react";
import { cn } from "@/utils/cn.util";

/**
 * The Gaddr product switcher.
 *
 * **The list is not written here.** `src/modules/gaddr-platform/` is a
 * byte-for-byte copy of the shared platform contract, kept in step by
 * `bun run contract:push` from the Jobs repository, and every Gaddr product
 * holds the same copy. Adding a product there adds it to every product's menu
 * at once. Do not add one here; there is nowhere here to add it.
 *
 * This replaced a local three-product list that had already drifted: it knew
 * nothing about Gaddr Work, Gaddr Code or the AI incubator, and it advertised
 * `pay.gaddr.com`, which does not resolve. That drift is exactly what the
 * contract exists to prevent.
 *
 * **The trigger is unchanged.** The rotated pill with the animated conic ring
 * arrived on `main` while this was in progress and is kept exactly as it was,
 * passed through `triggerClassName`. Only the contents of the panel changed.
 * The ring is a `before` pseudo-element rather than a sibling div, because the
 * trigger is now one element owned by the shared component.
 *
 * `compact` is the sidebar-footer placement, where the panel opens upward or it
 * would render off the bottom of the screen.
 */
export function GaddrProductSwitcher({
	compact = false,
}: {
	compact?: boolean;
}) {
	const t = useTranslations();
	const [bounceStopped, setBounceStopped] = useState(false);

	return (
		<div
			className="relative z-[60]"
			onPointerLeave={() => setBounceStopped(false)}
			onClickCapture={() => setBounceStopped(true)}
		>
		<GaddrSwitcher
			products={gaddrProducts({ currentProductId: "search" })}
			labs={gaddrLabs()}
			t={(key) => t(key)}
			placement={compact ? "above" : "below"}
			triggerClassName={cn(
				"group relative isolate flex h-10 w-18 items-center justify-center gap-1 rounded-full bg-background px-2 text-foreground transition-all [&>svg]:shrink-0",
				!bounceStopped && "hover:animate-hover-bounce-soft",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				"before:absolute before:inset-[-2px] before:-z-10 before:rounded-full before:opacity-0 before:transition-opacity",
				"before:animate-gaddr-glow before:[background:conic-gradient(from_0deg,#512fb6,#A288FF,#7C3AED,#512fb6)]",
				"hover:before:opacity-100 hover:before:[animation-duration:1.5s]",
			)}
			brand={
				<GaddrLogo
					className="h-5 w-7 shrink-0 scale-125"
					aria-hidden="true"
					data-testid="gaddr-product-switcher"
				/>
			}
		/>
		</div>
	);
}
