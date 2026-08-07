"use client";

import Image from "next/image";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import {
	EmailShareButton,
	FacebookShareButton,
	LinkedinShareButton,
	TwitterShareButton,
	WhatsappShareButton,
} from "react-share";
import CopyIcon from "@/components/svg/copy.svg";
import { ShareIcon } from "@/components/ui/share-icon";
import { UserAvatar } from "@/components/ui/user-avatar";
import { buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/utils/cn.util";

const socialShare = [
	{ platform: "facebook", Button: FacebookShareButton },
	{ platform: "x", Button: TwitterShareButton },
	{ platform: "linkedin", Button: LinkedinShareButton },
	{ platform: "whatsapp", Button: WhatsappShareButton },
	{ platform: "email", Button: EmailShareButton },
];

export interface SharePopupPreview {
	avatarSrc?: string | null;
	name?: ReactNode;
	handle?: string;
}

export interface SharePopupProps {
	/** A path or absolute URL for the item being shared. */
	url?: string | null;
	heading?: string;
	title?: string;
	triggerLabel?: string;
	/** Keep the trigger icon-only, useful in dense card headers. */
	iconOnly?: boolean;
	count?: number;
	preview?: SharePopupPreview;
	testId?: string;
	className?: string;
	/** Optional analytics/share handler for the copy action. */
	onCopy?: () => Promise<void> | void;
	/** Optional analytics handler for social share actions. */
	onSocialShare?: (platform: string) => Promise<void> | void;
}

function resolveShareUrl(value: string | null | undefined): string {
	if (!value || typeof window === "undefined") return value ?? "";
	if (/^https?:\/\//i.test(value)) return value;

	return new URL(value, window.location.origin).toString();
}

export default function SharePopup({
	url,
	heading = "Share",
	title = "Gaddr",
	triggerLabel = "Share",
	iconOnly = false,
	count,
	preview,
	testId,
	className,
	onCopy,
	onSocialShare,
}: SharePopupProps) {
	const [shareUrl, setShareUrl] = useState("");
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		setShareUrl(resolveShareUrl(url));
	}, [url]);

	const copyUrl = shareUrl || url || "";
	const triggerClassName = cn(
		buttonVariants({
			variant: "outline",
			size: iconOnly && count === undefined ? "icon-sm" : "sm",
		}),
		"border-primary/40 bg-background text-primary shadow-none hover:border-primary hover:bg-accent hover:text-accent-foreground",
		className,
	);

	const handleTriggerClick = (event: MouseEvent<HTMLButtonElement>) => {
		// Card click handlers must not treat opening the popover as opening the card.
		event.stopPropagation();
	};

	const copyToClipboard = async () => {
		if (!copyUrl) return;

		try {
			if (onCopy) {
				await onCopy();
			} else {
				await navigator.clipboard.writeText(copyUrl);
			}
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// Clipboard access can be blocked by browser permissions or context.
		}
	};

	const previewName = typeof preview?.name === "string" ? preview.name : "Profile avatar";

	return (
		<Popover>
			{iconOnly ? (
				<PopoverTrigger
					type="button"
					title={triggerLabel}
					aria-label={`${triggerLabel}${count && count > 0 ? ` (${count})` : ""}`}
					data-testid={testId}
					data-result-action="share"
					onClick={handleTriggerClick}
					className={triggerClassName}
				>
					<ShareIcon className="size-4" />
					{count !== undefined && count > 0 && <span className="tabular-nums">{count}</span>}
				</PopoverTrigger>
			) : (
				<>
					<PopoverTrigger
						type="button"
						title={triggerLabel}
						aria-label={triggerLabel}
						data-testid={testId}
						data-result-action="share"
						onClick={handleTriggerClick}
						className={cn(triggerClassName, "sm:hidden")}
					>
						<ShareIcon className="size-4" />
					</PopoverTrigger>
					<PopoverTrigger
						type="button"
						title={triggerLabel}
						data-testid={testId ? `${testId}-desktop` : undefined}
						data-result-action="share"
						onClick={handleTriggerClick}
						className={cn(triggerClassName, "hidden sm:flex")}
					>
						<ShareIcon className="size-4" />
						{triggerLabel}
					</PopoverTrigger>
				</>
			)}

			<PopoverContent
				align="end"
				className="w-80"
				onClick={(event) => event.stopPropagation()}
			>
				<h2 className="text-sm font-bold text-foreground">{heading}</h2>

				{preview && (
					<div className="mt-3 flex items-center gap-3 rounded-md border border-border bg-muted/40 p-2">
						<div className="rounded-full shadow-md shadow-primary/25">
							<UserAvatar src={preview.avatarSrc} alt={previewName} size="sm" />
						</div>
						<div className="min-w-0">
							<h3 className="truncate text-xs font-bold text-foreground">
								{preview.name}
							</h3>
							{preview.handle && (
								<p className="truncate text-xs text-muted-foreground">@{preview.handle.replace(/^@/, "")}</p>
							)}
						</div>
					</div>
				)}

				<div className="mt-5">
					<p className="mb-2 text-sm font-bold text-foreground">Link</p>
					<div className="relative flex items-center gap-2">
						<span className="min-w-0 flex-1 truncate rounded-md border border-border bg-muted/30 p-2 text-xs text-foreground">
							{copyUrl || "Link unavailable"}
						</span>
						{copied ? (
							<span className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-md border border-border bg-popover p-1 text-xs text-foreground">
								Link copied!
							</span>
						) : (
							<button
								type="button"
								onClick={() => void copyToClipboard()}
								disabled={!copyUrl}
								aria-label="Copy link"
								className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
							>
								<CopyIcon aria-hidden />
							</button>
						)}
					</div>
				</div>

				<div className="mt-5">
					<p className="mb-2 text-sm font-bold text-foreground">Share on social media</p>
					<div className="grid grid-cols-3 gap-3">
						{socialShare.map(({ platform, Button }) => (
							<Button
								key={platform}
								url={shareUrl || copyUrl}
								title={title}
								className="cursor-pointer"
								onClick={() => void onSocialShare?.(platform)}
							>
								<Image src={`/images/${platform}_share_button.svg`} width={100} height={60} alt={platform} />
							</Button>
						))}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
