"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/cn.util";

export interface WhyThisPostProps {
	reasons: string[];
	className?: string;
}

/**
 * "Why am I seeing this?"
 *
 * The ranker returns machine-readable reasons; this turns them into sentences
 * and points at the controls. A feed that will not say why it chose something
 * is a feed the reader cannot actually control, whatever the settings screen
 * claims.
 */
export function WhyThisPost({ reasons, className }: WhyThisPostProps) {
	const t = useTranslations("community");
	const [open, setOpen] = useState(false);

	if (reasons.length === 0) return null;

	return (
		<div className={cn("relative", className)}>
			<button
				type="button"
				onClick={() => setOpen((value) => !value)}
				aria-expanded={open}
				aria-label={t("whyThisPost")}
				data-testid="why-this-post"
				className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
			>
				<Info className="size-3.5" aria-hidden />
				<span className="hidden sm:inline">{t(`reason.${reasons[0]}`)}</span>
			</button>

			{open && (
				<div className="absolute bottom-full right-0 z-20 mb-2 w-72 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg">
					<p className="text-sm font-medium">{t("whyThisPost")}</p>
					<ul className="mt-2 space-y-1 text-sm text-muted-foreground">
						{reasons.map((reason) => (
							<li key={reason} className="flex gap-2">
								<span aria-hidden>·</span>
								<span>{t(`reason.${reason}`)}</span>
							</li>
						))}
					</ul>
					<Link
						href="/settings/feed"
						className="mt-3 inline-block text-sm text-primary hover:underline"
					>
						{t("adjustFeed")}
					</Link>
				</div>
			)}
		</div>
	);
}
