"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Handshake, Gift, Link2, Building2 } from "lucide-react";
import { cn } from "@/utils/cn.util";
import type { DisclosureKind } from "@/types/community.type";

const META: Record<
	Exclude<DisclosureKind, "none">,
	{ icon: typeof Handshake; key: string }
> = {
	paid_partnership: { icon: Handshake, key: "disclosure.paidPartnership" },
	gifted: { icon: Gift, key: "disclosure.gifted" },
	affiliate: { icon: Link2, key: "disclosure.affiliate" },
	own_brand: { icon: Building2, key: "disclosure.ownBrand" },
};

export interface DisclosureBadgeProps {
	disclosure: DisclosureKind;
	sponsorHandle?: string;
	sponsorName?: string;
	className?: string;
}

/**
 * The paid-partnership label.
 *
 * Rendered above the body, at full contrast, and never behind a "more"
 * affordance. The disclosure is stored on the post rather than derived at
 * render time precisely so it cannot be lost on the way to a client, an
 * export, or an Open Graph tag — dropping it here would undo that.
 */
export function DisclosureBadge({
	disclosure,
	sponsorHandle,
	sponsorName,
	className,
}: DisclosureBadgeProps) {
	const t = useTranslations("community");
	if (disclosure === "none") return null;

	const meta = META[disclosure];
	if (!meta) return null;
	const Icon = meta.icon;

	return (
		<p
			data-testid="disclosure-badge"
			className={cn(
				"inline-flex flex-wrap items-center gap-1.5 rounded-lg bg-secondary/60 px-2.5 py-1 text-xs font-medium text-foreground",
				className,
			)}
		>
			<Icon className="size-3.5 shrink-0 text-primary" aria-hidden />
			<span>{t(meta.key)}</span>
			{sponsorHandle && (
				<>
					<span aria-hidden className="text-muted-foreground">
						·
					</span>
					<Link
						href={`/community/${sponsorHandle}`}
						className="text-primary hover:underline"
					>
						{sponsorName ?? `@${sponsorHandle}`}
					</Link>
				</>
			)}
		</p>
	);
}
