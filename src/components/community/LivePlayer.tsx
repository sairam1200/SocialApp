"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import toast from "react-hot-toast";
import { Maximize2, Minimize2, Radio, Send } from "lucide-react";
import { cn } from "@/utils/cn.util";
import { ShareIcon } from "@/components/ui/share-icon";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { apiClient } from "@/services/apiClient.service";
import { communityKeys } from "@/hooks/useCommunity";

export interface LivePlayerProps {
	channelKey: string;
	isAuthenticated?: boolean;
}

/**
 * The live player, with chat.
 *
 * Playback is plain HLS. Safari plays `.m3u8` natively; everywhere else needs
 * Media Source Extensions, which is what `hls.js` provides — loaded lazily so
 * its ~150 kB does not land on every page that merely links here.
 *
 * No proprietary player and no vendor SDK: the URL comes from our own control
 * plane and any HLS-capable client can consume it. That is the point of
 * building on open standards rather than someone's embed.
 */
export function LivePlayer({ channelKey, isAuthenticated = false }: LivePlayerProps) {
	const t = useTranslations("community");
	const videoRef = useRef<HTMLVideoElement>(null);
	const [message, setMessage] = useState("");
	// Theatre mode: the video takes the full width and chat moves under it.
	// Every live platform has this because a 320px chat column costs a third of
	// the picture, and a viewer who is watching rather than talking wants it back.
	const [theatre, setTheatre] = useState(false);

	const { data: stream, isLoading } = useQuery({
		queryKey: communityKeys.stream(channelKey),
		queryFn: () => apiClient.Community.getStream(channelKey),
		enabled: Boolean(channelKey),
		refetchInterval: 30_000,
	});

	const { data: chat, refetch: refetchChat } = useQuery({
		queryKey: ["community", "stream-chat", stream?.id],
		queryFn: () => apiClient.Community.getStreamChat(stream!.id, 100),
		enabled: Boolean(stream?.id) && Boolean(stream?.chatEnabled),
		refetchInterval: 5_000,
	});

	useEffect(() => {
		const video = videoRef.current;
		const source = stream?.playback?.llHlsUrl ?? stream?.playback?.hlsUrl;
		if (!video || !source) return;

		// Native HLS — Safari and most of iOS. No library needed.
		if (video.canPlayType("application/vnd.apple.mpegurl")) {
			video.src = source;
			return;
		}

		let destroy: (() => void) | undefined;
		let cancelled = false;

		void import("hls.js")
			.then(({ default: Hls }) => {
				if (cancelled || !Hls.isSupported()) return;
				const hls = new Hls({
					lowLatencyMode: true,
					// A live edge that is too tight stalls on any jitter; too loose
					// and "low latency" stops meaning anything.
					liveSyncDurationCount: 3,
				});
				hls.loadSource(source);
				hls.attachMedia(video);
				destroy = () => hls.destroy();
			})
			.catch(() => {
				// hls.js failing to load is not fatal — the poster and chat still
				// work, and Safari never needed it.
			});

		return () => {
			cancelled = true;
			destroy?.();
		};
	}, [stream?.playback?.hlsUrl, stream?.playback?.llHlsUrl]);

	const send = async () => {
		if (!stream?.id || !message.trim()) return;
		const body = message.trim();
		setMessage("");
		try {
			await apiClient.Community.postStreamChat(stream.id, { body });
			await refetchChat();
		} catch {
			// Restore what they typed rather than losing it to a failed send.
			setMessage(body);
		}
	};

	if (isLoading) {
		return (
			<div className="mx-auto max-w-[1100px] py-6" aria-busy="true">
				<div className="aspect-video animate-pulse rounded-2xl bg-muted/50" />
			</div>
		);
	}

	if (!stream) {
		return (
			<div className="mx-auto max-w-[640px] rounded-2xl border border-border p-10 text-center">
				<h1 className="text-lg font-semibold">{t("profileNotFound")}</h1>
				<Link
					href="/community/live"
					className="mt-3 inline-block text-sm text-primary hover:underline"
				>
					{t("liveTitle")}
				</Link>
			</div>
		);
	}

	const isLive = stream.status === "live";

	return (
		<div
			className={cn(
				"mx-auto w-full py-6",
				theatre ? "max-w-[1600px]" : "max-w-[1100px]",
			)}
		>
			<div
				className={cn(
					"grid gap-4",
					theatre ? "grid-cols-1" : "lg:grid-cols-[1fr_320px]",
				)}
			>
				<div>
					<div className="relative overflow-hidden rounded-2xl bg-black">
						<video
							ref={videoRef}
							controls
							playsInline
							poster={stream.thumbnailUrl}
							className="aspect-video w-full"
							data-testid="live-video"
						>
							<track kind="captions" />
						</video>

						{isLive && (
							<span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
								<Radio className="size-3 animate-pulse" aria-hidden />
								{t("live")}
							</span>
						)}

						<div className="absolute right-3 top-3 flex gap-1.5">
							<button
								type="button"
								aria-pressed={theatre}
								aria-label={t(theatre ? "exitTheatre" : "theatreMode")}
								title={t(theatre ? "exitTheatre" : "theatreMode")}
								data-testid="theatre-toggle"
								onClick={() => setTheatre((on) => !on)}
								className="rounded-full bg-black/60 p-2 text-white backdrop-blur transition-colors hover:bg-black/80"
							>
								{theatre ? (
									<Minimize2 className="size-4" aria-hidden />
								) : (
									<Maximize2 className="size-4" aria-hidden />
								)}
							</button>
							<button
								type="button"
								aria-label={t("copyLink")}
								title={t("copyLink")}
								data-testid="share-channel"
								onClick={async () => {
									await navigator.clipboard.writeText(window.location.href);
									toast.success(t("linkCopied"));
								}}
								className="rounded-full bg-black/60 p-2 text-white backdrop-blur transition-colors hover:bg-black/80"
							>
								<ShareIcon className="size-4" />
							</button>
						</div>
					</div>

					<div className="mt-4 flex items-start gap-3">
						<Link href={`/community/${stream.owner.handle}`} className="shrink-0">
							<UserAvatar
								src={stream.owner.avatarUrl}
								alt={stream.owner.displayName}
								size="md"
							/>
						</Link>
						<div className="min-w-0">
							<h1 className="truncate text-lg font-semibold">
								{stream.title ?? stream.owner.displayName}
							</h1>
							<p className="text-sm text-muted-foreground">
								<Link
									href={`/community/${stream.owner.handle}`}
									className="hover:underline"
								>
									{stream.owner.displayName}
								</Link>
								{stream.category && (
									<>
										{" · "}
										{/* Straight back to everyone else streaming this. */}
										<Link
											href={`/community/live?category=${encodeURIComponent(stream.category)}`}
											className="hover:underline"
											data-testid="channel-category"
										>
											{stream.category}
										</Link>
									</>
								)}
								{isLive ? ` · ${t("viewers", { count: stream.viewersCount })}` : ""}
							</p>
						</div>
					</div>
				</div>

				{stream.chatEnabled && (
					<aside className="flex h-[520px] flex-col rounded-2xl border border-border">
						<h2 className="border-b border-border px-4 py-3 text-sm font-semibold">
							{t("chat")}
						</h2>

						<ul className="flex-1 space-y-2 overflow-y-auto p-3">
							{(chat ?? []).map((entry) => (
								<li key={entry.id} className="text-sm">
									<Link
										href={`/community/${entry.author.handle}`}
										className="font-medium text-primary hover:underline"
									>
										{entry.author.displayName}
									</Link>
									<span className="ml-1.5 break-words">{entry.body}</span>
								</li>
							))}
						</ul>

						{isAuthenticated ? (
							<form
								className="flex gap-2 border-t border-border p-3"
								onSubmit={(event) => {
									event.preventDefault();
									void send();
								}}
							>
								<label htmlFor="chat-input" className="sr-only">
									{t("chatPlaceholder")}
								</label>
								<input
									id="chat-input"
									value={message}
									onChange={(event) => setMessage(event.target.value.slice(0, 500))}
									placeholder={t("chatPlaceholder")}
									className="min-w-0 flex-1 rounded-full border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
								/>
								<Button
									type="submit"
									size="icon-sm"
									aria-label={t("sendMessage")}
									icon={<Send className="size-4" />}
									disabled={!message.trim()}
								/>
							</form>
						) : (
							<p className={cn("border-t border-border p-3 text-center text-xs text-muted-foreground")}>
								<Link href="/login" className="text-primary hover:underline">
									{t("chatPlaceholder")}
								</Link>
							</p>
						)}
					</aside>
				)}
			</div>
		</div>
	);
}
