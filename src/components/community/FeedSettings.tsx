"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Pin, RotateCcw, VolumeX } from "lucide-react";
import { cn } from "@/utils/cn.util";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/services/apiClient.service";
import type { FeedPreferences, SourceWeights } from "@/types/community.type";
import { useFeedPreferences, useSetFeedPreferences } from "@/hooks/useCommunity";

const SOURCES: Array<keyof SourceWeights> = [
	"following",
	"topicAffinity",
	"coEngagement",
	"trending",
	"similarAuthors",
	"fresh",
];

/**
 * The algorithm controls.
 *
 * This screen is the product promise made concrete: every number the ranker
 * uses is here, named, with a plain-language explanation of what it does. A
 * feed you cannot inspect is a feed you do not control, however many toggles
 * the settings page has.
 *
 * Values are clamped server-side as well — this is a convenience, not the
 * enforcement.
 */
export function FeedSettings() {
	const t = useTranslations("community");
	const { data, isLoading } = useFeedPreferences();
	const save = useSetFeedPreferences();

	const [draft, setDraft] = useState<FeedPreferences | null>(null);

	useEffect(() => {
		if (data?.preferences && !draft) setDraft(data.preferences);
	}, [data?.preferences, draft]);

	if (isLoading || !draft) {
		return (
			<div className="mx-auto max-w-[640px] py-8" aria-busy="true">
				<div className="h-8 w-40 animate-pulse rounded bg-muted" />
				<div className="mt-6 space-y-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="h-14 animate-pulse rounded-xl bg-muted/50" />
					))}
				</div>
			</div>
		);
	}

	const patch = (changes: Partial<FeedPreferences>) =>
		setDraft((current) => (current ? { ...current, ...changes } : current));

	const commit = async (changes: Partial<FeedPreferences>) => {
		patch(changes);
		try {
			await save.mutateAsync({ ...draft, ...changes });
		} catch {
			toast.error(t("postFailed"));
		}
	};

	return (
		<div className="mx-auto w-full max-w-[640px] py-8">
			<header>
				<h1 className="text-2xl font-bold">{t("feedSettingsTitle")}</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{t("feedSettingsSubtitle")}
				</p>
			</header>

			{/* ------------------------------------------------------- sources */}
			<section className="mt-8">
				<h2 className="text-sm font-semibold">{t("sources")}</h2>
				<p className="mt-1 text-xs text-muted-foreground">{t("sourcesHelp")}</p>

				<ul className="mt-4 space-y-4">
					{SOURCES.map((source) => (
						<li key={source}>
							<Slider
								id={`source-${source}`}
								label={t(`source.${source}`)}
								value={draft.sources[source]}
								min={0}
								max={2}
								step={0.1}
								format={(value) =>
									value === 0 ? t("off") : `${Math.round(value * 100)}%`
								}
								onChange={(value) =>
									patch({ sources: { ...draft.sources, [source]: value } })
								}
								onCommit={(value) =>
									commit({ sources: { ...draft.sources, [source]: value } })
								}
							/>
						</li>
					))}
				</ul>
			</section>

			{/* -------------------------------------------------------- tuning */}
			<section className="mt-10">
				<h2 className="text-sm font-semibold">{t("tuning")}</h2>

				<ul className="mt-4 space-y-5">
					<li>
						<Slider
							id="recency"
							label={t("recencyHalfLife")}
							help={t("recencyHalfLifeHelp")}
							value={draft.recencyHalfLifeHours}
							min={1}
							max={168}
							step={1}
							format={(value) => `${value} h`}
							onChange={(value) => patch({ recencyHalfLifeHours: value })}
							onCommit={(value) => commit({ recencyHalfLifeHours: value })}
						/>
					</li>
					<li>
						<Slider
							id="diversity"
							label={t("diversity")}
							help={t("diversityHelp")}
							value={draft.diversityLambda}
							min={0}
							max={1}
							step={0.05}
							format={(value) => `${Math.round(value * 100)}%`}
							onChange={(value) => patch({ diversityLambda: value })}
							onCommit={(value) => commit({ diversityLambda: value })}
						/>
					</li>
					<li>
						<Slider
							id="max-per-author"
							label={t("maxPerAuthor")}
							value={draft.maxPostsPerAuthor}
							min={1}
							max={10}
							step={1}
							format={(value) => String(value)}
							onChange={(value) => patch({ maxPostsPerAuthor: value })}
							onCommit={(value) => commit({ maxPostsPerAuthor: value })}
						/>
					</li>
					<li>
						<Slider
							id="exploration"
							label={t("exploration")}
							help={t("explorationHelp")}
							value={draft.explorationStrength}
							min={0}
							max={1}
							step={0.05}
							format={(value) =>
								value === 0 ? t("off") : `${Math.round(value * 100)}%`
							}
							onChange={(value) => patch({ explorationStrength: value })}
							onCommit={(value) => commit({ explorationStrength: value })}
						/>
					</li>
					<li>
						<Slider
							id="sponsored"
							label={t("sponsoredEvery")}
							help={t("sponsoredEveryHelp")}
							value={draft.sponsoredEveryN}
							min={0}
							max={30}
							step={1}
							format={(value) => (value === 0 ? t("off") : `1 / ${value}`)}
							onChange={(value) => patch({ sponsoredEveryN: value })}
							onCommit={(value) => commit({ sponsoredEveryN: value })}
						/>
					</li>
					<li className="flex items-center justify-between gap-4">
						<label htmlFor="out-of-network" className="text-sm">
							{t("includeOutOfNetwork")}
						</label>
						<input
							id="out-of-network"
							type="checkbox"
							checked={draft.includeOutOfNetwork}
							onChange={(event) =>
								void commit({ includeOutOfNetwork: event.target.checked })
							}
							className="size-5 accent-[var(--primary)]"
						/>
					</li>
				</ul>
			</section>

			{/* -------------------------------------------------------- topics */}
			{data?.topics && data.topics.length > 0 && (
				<section className="mt-10">
					<h2 className="text-sm font-semibold">{t("yourTopics")}</h2>
					<p className="mt-1 text-xs text-muted-foreground">
						{t("yourTopicsHelp")}
					</p>

					<ul className="mt-4 space-y-1">
						{data.topics.map((topic) => (
							<li
								key={topic.topic}
								className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-muted/50"
							>
								<span className="min-w-0 flex-1">
									<span className="block truncate text-sm">{topic.topic}</span>
									<span
										aria-hidden
										className="mt-1 block h-1 rounded-full bg-primary/25"
										style={{
											width: `${Math.min(100, (topic.weight / 20) * 100)}%`,
										}}
									/>
								</span>

								<TopicToggle
									topic={topic.topic}
									active={topic.isPinned}
									icon={Pin}
									label={t("pin")}
									field="isPinned"
								/>
								<TopicToggle
									topic={topic.topic}
									active={topic.isMuted}
									icon={VolumeX}
									label={t("mute")}
									field="isMuted"
								/>
							</li>
						))}
					</ul>
				</section>
			)}

			<div className="mt-10">
				<Button
					variant="secondary"
					size="sm"
					label={t("resetToDefaults")}
					icon={<RotateCcw className="size-4" />}
					onClick={() => {
						if (!data?.defaults) return;
						setDraft(data.defaults);
						void commit(data.defaults);
						toast.success(t("preferencesSaved"));
					}}
				/>
			</div>
		</div>
	);
}

interface SliderProps {
	id: string;
	label: string;
	help?: string;
	value: number;
	min: number;
	max: number;
	step: number;
	format: (value: number) => string;
	onChange: (value: number) => void;
	onCommit: (value: number) => void;
}

/**
 * A labelled range input.
 *
 * `onChange` updates locally on every drag frame; `onCommit` fires on release.
 * Saving on every frame would be a request per pixel.
 */
function Slider({
	id,
	label,
	help,
	value,
	min,
	max,
	step,
	format,
	onChange,
	onCommit,
}: SliderProps) {
	return (
		<div>
			<div className="flex items-baseline justify-between gap-3">
				<label htmlFor={id} className="text-sm">
					{label}
				</label>
				<span
					className={cn(
						"text-xs tabular-nums",
						value === 0 ? "text-muted-foreground" : "text-primary",
					)}
				>
					{format(value)}
				</span>
			</div>
			{help && <p className="mt-0.5 text-xs text-muted-foreground">{help}</p>}
			<input
				id={id}
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
				onPointerUp={(event) =>
					onCommit(Number((event.target as HTMLInputElement).value))
				}
				onKeyUp={(event) =>
					onCommit(Number((event.target as HTMLInputElement).value))
				}
				className="mt-2 w-full accent-[var(--primary)]"
			/>
		</div>
	);
}

function TopicToggle({
	topic,
	active,
	icon: Icon,
	label,
	field,
}: {
	topic: string;
	active: boolean;
	icon: typeof Pin;
	label: string;
	field: "isPinned" | "isMuted";
}) {
	const [on, setOn] = useState(active);

	return (
		<button
			type="button"
			aria-pressed={on}
			aria-label={`${label}: ${topic}`}
			title={label}
			onClick={async () => {
				const next = !on;
				setOn(next);
				try {
					await apiClient.Community.setTopicPreference(topic, { [field]: next });
				} catch {
					setOn(!next);
				}
			}}
			className={cn(
				"rounded-full p-2 transition-colors hover:bg-muted",
				on ? "text-primary" : "text-muted-foreground",
			)}
		>
			<Icon className="size-4" aria-hidden />
		</button>
	);
}
