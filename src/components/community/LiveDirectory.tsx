"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import {
	Check,
	Clock,
	Copy,
	Radio,
	RotateCcw,
	Settings2,
	Users,
} from "lucide-react";
import { cn } from "@/utils/cn.util";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { apiClient } from "@/services/apiClient.service";
import type { StreamIngest } from "@/types/community.type";
import { useLiveCategories, useLiveStreams } from "@/hooks/useCommunity";

type LiveSort = "viewers" | "recent";

const SORTS: Array<{ value: LiveSort; icon: typeof Users; key: string }> = [
	{ value: "viewers", icon: Users, key: "sortByViewers" },
	{ value: "recent", icon: Clock, key: "sortByRecent" },
];

/**
 * Who is live, and how to become one of them.
 *
 * Browsable the way a live directory has to be: by category, and by *both*
 * orderings. Busiest-first is the obvious one and the reason big channels stay
 * big; most-recently-started is the only ordering in which a channel with four
 * viewers is ever found at all. A directory with one of them is a directory
 * where discovery goes one way.
 *
 * Category and sort live in the URL, so a reader who watches one category can
 * bookmark it and a link to it means the same thing tomorrow.
 */
export function LiveDirectory({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
	const t = useTranslations("community");
	const router = useRouter();
	const searchParams = useSearchParams();

	const category = searchParams.get("category") ?? "";
	const sort: LiveSort = searchParams.get("sort") === "recent" ? "recent" : "viewers";

	const { data: streams, isLoading } = useLiveStreams({ category, sort });
	const { data: categories } = useLiveCategories();

	const setParam = (key: string, value: string | null) => {
		const params = new URLSearchParams(searchParams.toString());
		if (!value) params.delete(key);
		else params.set(key, value);
		const query = params.toString();
		router.replace(query ? `/community/live?${query}` : "/community/live", {
			scroll: false,
		});
	};

	return (
		<div className="mx-auto w-full max-w-[1100px] py-6">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">{t("liveTitle")}</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						{t("liveSubtitle")}
					</p>
				</div>
				{isAuthenticated && (
					<Link href="/community/live/setup">
						<Button
							size="sm"
							variant="secondary"
							label={t("goLive")}
							icon={<Settings2 className="size-4" />}
						/>
					</Link>
				)}
			</header>

			<div className="mt-5 flex flex-wrap items-center justify-between gap-3">
				{/* Categories, and the way back out of one. */}
				<div
					className="flex flex-wrap gap-1.5"
					role="group"
					aria-label={t("browseCategories")}
				>
					<button
						type="button"
						aria-pressed={!category}
						data-testid="live-category-all"
						onClick={() => setParam("category", null)}
						className={cn(
							"rounded-full border px-3 py-1 text-xs transition-colors",
							category
								? "border-border text-muted-foreground hover:border-primary/50"
								: "border-primary bg-primary/10 text-primary",
						)}
					>
						{t("allCategories")}
					</button>
					{(categories ?? []).map((entry) => {
						const active = category.toLowerCase() === entry.category.toLowerCase();
						return (
							<button
								key={entry.category}
								type="button"
								aria-pressed={active}
								data-testid={`live-category-${entry.category}`}
								onClick={() => setParam("category", active ? null : entry.category)}
								className={cn(
									"rounded-full border px-3 py-1 text-xs transition-colors",
									active
										? "border-primary bg-primary/10 text-primary"
										: "border-border text-muted-foreground hover:border-primary/50",
								)}
							>
								{entry.category}
								<span className="ml-1.5 tabular-nums opacity-60">
									{entry.count}
								</span>
							</button>
						);
					})}
				</div>

				<div
					role="tablist"
					aria-label={t("liveSort")}
					className="flex gap-1 rounded-full border border-border p-1"
				>
					{SORTS.map(({ value, icon: Icon, key }) => (
						<button
							key={value}
							role="tab"
							type="button"
							aria-selected={sort === value}
							data-testid={`live-sort-${value}`}
							onClick={() => setParam("sort", value === "viewers" ? null : value)}
							className={cn(
								"inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
								sort === value
									? "bg-primary text-white"
									: "text-muted-foreground hover:bg-muted",
							)}
						>
							<Icon className="size-3.5" aria-hidden />
							{t(key)}
						</button>
					))}
				</div>
			</div>

			{isLoading && (
				<ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<li key={i} className="aspect-video animate-pulse rounded-2xl bg-muted/50" />
					))}
				</ul>
			)}

			{!isLoading && (streams?.length ?? 0) === 0 && (
				<div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
					<p className="text-sm text-muted-foreground">
						{category ? t("noOneLiveIn", { category }) : t("noOneLive")}
					</p>
					{category && (
						<button
							type="button"
							onClick={() => setParam("category", null)}
							className="mt-3 text-sm text-primary hover:underline"
						>
							{t("allCategories")}
						</button>
					)}
				</div>
			)}

			<ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{(streams ?? []).map((stream) => (
					<li key={stream.id}>
						<Link
							href={`/community/live/${stream.channelKey}`}
							className="group block overflow-hidden rounded-2xl border border-border transition-colors hover:border-primary"
						>
							<span className="relative block aspect-video bg-muted">
								{stream.thumbnailUrl && (
									<Image
										src={stream.thumbnailUrl}
										alt=""
										fill
										sizes="(max-width: 640px) 100vw, 300px"
										className="object-cover"
									/>
								)}
								<span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-destructive px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
									<Radio className="size-3 animate-pulse" aria-hidden />
									{t("live")}
								</span>
								<span className="absolute bottom-2 right-2 rounded-full bg-black/65 px-2 py-0.5 text-[11px] text-white">
									{t("viewers", { count: stream.viewersCount })}
								</span>
							</span>

							<span className="flex items-start gap-2 p-3">
								<UserAvatar
									src={stream.owner.avatarUrl}
									alt={stream.owner.displayName}
									size="sm"
								/>
								<span className="min-w-0">
									<span className="block truncate text-sm font-medium">
										{stream.title ?? stream.owner.displayName}
									</span>
									<span className="block truncate text-xs text-muted-foreground">
										{stream.owner.displayName}
										{stream.category ? ` · ${stream.category}` : ""}
									</span>
								</span>
							</span>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}

/**
 * Stream setup — the one-click OBS handoff and the manual fallback.
 *
 * The deep link is an accelerator, not the only route: the `obs://` handler is
 * not registered on every install, so the copyable fields are always there and
 * never behind a disclosure.
 */
export function StreamSetup() {
	const t = useTranslations("community");
	const [ingest, setIngest] = useState<StreamIngest | null>(null);
	const [loading, setLoading] = useState(true);
	const [revealed, setRevealed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		void apiClient.Community.getIngest()
			.then((result) => {
				if (!cancelled) setIngest(result);
			})
			.catch(() => undefined)
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		// Guarded against a fast unmount: setting state on an unmounted
		// component is a warning at best and a leak at worst.
		return () => {
			cancelled = true;
		};
	}, []);

	const rotate = async () => {
		if (!window.confirm(t("rotateKeyHelp"))) return;
		try {
			setIngest(await apiClient.Community.rotateIngestKey());
			toast.success(t("preferencesSaved"));
		} catch {
			toast.error(t("postFailed"));
		}
	};

	if (loading) {
		return (
			<div className="mx-auto max-w-[640px] py-8" aria-busy="true">
				<div className="h-48 animate-pulse rounded-2xl bg-muted/50" />
			</div>
		);
	}

	if (!ingest?.configured) {
		return (
			<div className="mx-auto max-w-[640px] py-8">
				<h1 className="text-2xl font-bold">{t("streamSetup")}</h1>
				<p className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
					{t("streamingUnconfigured")}
				</p>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-[640px] py-8">
			<h1 className="text-2xl font-bold">{t("streamSetup")}</h1>

			<a
				href={ingest.obsDeepLink}
				className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0px_2px_3px_0px_#6136FF40] transition-transform active:scale-[0.98]"
			>
				<Radio className="size-4" aria-hidden />
				{t("oneClickObs")}
			</a>
			<p className="mt-2 text-xs text-muted-foreground">{t("obsHelp")}</p>

			<dl className="mt-6 space-y-3">
				<CopyRow label={t("serverUrl")} value={ingest.rtmpUrl} />
				<CopyRow label="SRT" value={ingest.srtUrl} secret />
				<CopyRow label="WHIP" value={ingest.whipUrl} />
				<CopyRow
					label={t("streamKey")}
					value={ingest.streamKey}
					secret
					revealed={revealed}
					onReveal={() => setRevealed(true)}
				/>
			</dl>

			<Button
				className="mt-6"
				variant="secondary"
				size="sm"
				label={t("rotateKey")}
				icon={<RotateCcw className="size-4" />}
				onClick={rotate}
			/>

			<section className="mt-8">
				<h2 className="text-sm font-semibold">{t("recommendedSettings")}</h2>
				<ul className="mt-3 divide-y divide-border rounded-xl border border-border">
					{ingest.recommendedSettings.map((setting) => (
						<li
							key={setting.name}
							className="flex items-center justify-between px-4 py-2.5 text-sm"
						>
							<span className="font-medium">{setting.name}</span>
							<span className="tabular-nums text-muted-foreground">
								{setting.height}p · {setting.videoBitrateKbps} kbps
								{setting.framerate ? ` · ${setting.framerate} fps` : ""}
							</span>
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}

/**
 * A copyable field.
 *
 * Secrets are masked until revealed and never rendered into the DOM in full
 * before that — a stream key on screen during a stream is how channels get
 * hijacked live, on camera.
 */
function CopyRow({
	label,
	value,
	secret,
	revealed,
	onReveal,
}: {
	label: string;
	value: string;
	secret?: boolean;
	revealed?: boolean;
	onReveal?: () => void;
}) {
	const t = useTranslations("community");
	const [copied, setCopied] = useState(false);
	const hidden = secret && !revealed;

	return (
		<div className="flex items-center gap-2 rounded-xl border border-border p-3">
			<div className="min-w-0 flex-1">
				<dt className="text-xs text-muted-foreground">{label}</dt>
				<dd className="truncate font-mono text-sm">
					{hidden ? "••••••••••••••••••••" : value}
				</dd>
			</div>

			{hidden && onReveal && (
				<button
					type="button"
					onClick={onReveal}
					className="shrink-0 rounded-full px-3 py-1.5 text-xs text-primary hover:bg-muted"
				>
					{t("copy")}
				</button>
			)}

			<button
				type="button"
				aria-label={t("copy")}
				onClick={async () => {
					await navigator.clipboard.writeText(value);
					setCopied(true);
					setTimeout(() => setCopied(false), 1500);
				}}
				className={cn(
					"shrink-0 rounded-full p-2 transition-colors hover:bg-muted",
					copied ? "text-primary" : "text-muted-foreground",
				)}
			>
				{copied ? <Check className="size-4" /> : <Copy className="size-4" />}
			</button>
		</div>
	);
}
