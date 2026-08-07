"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import {
	BarChart3,
	CalendarClock,
	Globe2,
	Image as ImageIcon,
	Lock,
	MapPin,
	Send,
	ShoppingBag,
	Sparkles,
	Video as VideoIcon,
	Wand2,
	Users,
	X,
} from "lucide-react";
import { cn } from "@/utils/cn.util";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { apiClient } from "@/services/apiClient.service";
import { uploadVideo } from "@/services/api/upload-video.service";
import {
	createVideoThumbnail,
	validateVideoFile,
} from "@/utils/media.utils";
import {
	CommunityMediaEditor,
	type CommunityMediaDraft,
	type CommunityMusicSelection,
} from "./CommunityMediaEditor";
import type {
	ComposeInput,
	CommunityProfile,
	DisclosureKind,
	PostKind,
	Visibility,
} from "@/types/community.type";

const MAX_BODY = 5000;
const MAX_POLL_OPTIONS = 6;

const VISIBILITY_OPTIONS: Array<{
	value: Visibility;
	icon: typeof Globe2;
	key: string;
}> = [
	{ value: "public", icon: Globe2, key: "visibility.public" },
	{ value: "followers", icon: Users, key: "visibility.followers" },
	{ value: "close_friends", icon: Lock, key: "visibility.closeFriends" },
	{ value: "brand_partners", icon: Lock, key: "visibility.brandPartners" },
];

export interface ComposerProps {
	profile?: CommunityProfile | null;
	/** Reply target. Sets `parentId` and narrows the visibility choices. */
	replyTo?: { id: string; handle: string; visibility: Visibility } | null;
	repostOf?: { id: string; handle: string } | null;
	/** Platforms the user has connected, offered as simulcast targets. */
	connectedPlatforms?: string[];
	onPosted?: (postId: string) => void;
	onCancel?: () => void;
	submit: (input: ComposeInput) => Promise<{ id: string }>;
	className?: string;
	autoFocus?: boolean;
}

/**
 * The one composer.
 *
 * Text, photos, video, a poll, a place, a product, a schedule, a visibility
 * choice, a disclosure and any number of external platforms — one form,
 * because the alternative is five forms that each forget something different.
 *
 * Publishing here always succeeds regardless of what is connected: external
 * targets are recorded and dispatched afterwards, so a dead token on another
 * platform can never block a post on this one.
 */
export function Composer({
	profile,
	replyTo,
	repostOf,
	connectedPlatforms = [],
	onPosted,
	onCancel,
	submit,
	className,
	autoFocus,
}: ComposerProps) {
	const t = useTranslations("community");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const [body, setBody] = useState("");
	const [title, setTitle] = useState("");
	const [visibility, setVisibility] = useState<Visibility>(
		replyTo?.visibility ?? "public",
	);
	const [pollOptions, setPollOptions] = useState<string[] | null>(null);
	const [place, setPlace] = useState<string>("");
	const [mediaDrafts, setMediaDrafts] = useState<CommunityMediaDraft[]>([]);
	const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
	const [music, setMusic] = useState<CommunityMusicSelection | undefined>();
	const [scheduledFor, setScheduledFor] = useState<string>("");
	const [isSponsored, setIsSponsored] = useState(false);
	const [disclosure, setDisclosure] = useState<DisclosureKind>("paid_partnership");
	const [platforms, setPlatforms] = useState<string[]>([]);
	const [busy, setBusy] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<number | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const kind: PostKind = useMemo(() => {
		if (repostOf) return "repost";
		if (replyTo) return "comment";
		if (pollOptions) return "poll";
		if (mediaDrafts.some((media) => media.kind === "video")) return "video";
		if (mediaDrafts.length > 0) return "photo";
		return "update";
	}, [mediaDrafts, pollOptions, replyTo, repostOf]);

	const remaining = MAX_BODY - body.length;
	const canSubmit =
		!busy &&
		(body.trim().length > 0 ||
			title.trim().length > 0 ||
			mediaDrafts.length > 0 ||
			Boolean(repostOf) ||
			(pollOptions?.filter(Boolean).length ?? 0) >= 2);

	const handleSubmit = useCallback(
		async (publish: boolean) => {
			if (busy) return;
			setBusy(true);
			try {
				const media = await uploadCommunityMedia(mediaDrafts, setUploadProgress);
				const input: ComposeInput = {
					kind,
					title: title.trim() || undefined,
					body: body.trim() || undefined,
					visibility,
					parentId: replyTo?.id,
					repostOfId: repostOf?.id,
					media,
					pollOptions: pollOptions?.filter((o) => o.trim().length > 0),
					place: place.trim() ? { name: place.trim() } : undefined,
					scheduledFor: scheduledFor
						? new Date(scheduledFor).toISOString()
						: null,
					publish,
					isSponsored,
					disclosure: isSponsored ? disclosure : undefined,
					externalPlatforms: platforms.length > 0 ? platforms : undefined,
					music,
				};

				const result = await submit(input);
				toast.success(
					publish
						? scheduledFor
							? t("scheduled")
							: t("posted")
						: t("draftSaved"),
				);

				setBody("");
				setTitle("");
				mediaDrafts.forEach((draft) => URL.revokeObjectURL(draft.previewUrl));
				setMediaDrafts([]);
				setMusic(undefined);
				setPollOptions(null);
				setPlace("");
				setScheduledFor("");
				setPlatforms([]);
				setIsSponsored(false);
				onPosted?.(result.id);
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : t("postFailed"),
				);
			} finally {
				setUploadProgress(null);
				setBusy(false);
			}
		},
		[
			body,
			title,
			busy,
			disclosure,
			isSponsored,
			kind,
			mediaDrafts,
			music,
			onPosted,
			place,
			platforms,
			pollOptions,
			replyTo?.id,
			repostOf?.id,
			scheduledFor,
			submit,
			t,
			visibility,
		],
	);

	const editingDraft = editingMediaId
		? mediaDrafts.find((draft) => draft.id === editingMediaId)
		: undefined;

	const saveEditedMedia = (
		file: File,
		meta: {
			altText: string;
			duration?: number;
			width?: number;
			height?: number;
			music?: CommunityMusicSelection;
			previewUrl: string;
		},
	) => {
		if (!editingMediaId) return;
		setMediaDrafts((current) =>
			current.map((draft) => {
				if (draft.id !== editingMediaId) return draft;
				URL.revokeObjectURL(draft.previewUrl);
				return { ...draft, file, ...meta };
			}),
		);
		setMusic(meta.music);
		setEditingMediaId(null);
	};

	return (
		<div
			className={cn(
				"rounded-2xl border border-border bg-card p-4 text-card-foreground",
				className,
			)}
			data-testid="composer"
		>
			<div className="flex gap-3">
				<UserAvatar
					src={profile?.avatarUrl}
					alt={profile?.displayName ?? ""}
					size="md"
					className="shrink-0"
				/>

				<div className="min-w-0 flex-1">
					{!replyTo && (
						<>
							<label htmlFor="composer-title" className="sr-only">Post title</label>
							<input
								id="composer-title"
								value={title}
								onChange={(event) => setTitle(event.target.value.slice(0, 200))}
								placeholder="Post title"
								maxLength={200}
								className="mb-2 w-full bg-transparent text-base font-semibold outline-none placeholder:text-muted-foreground"
							/>
						</>
					)}
					<label htmlFor="composer-body" className="sr-only">
						{replyTo ? t("writeReply") : t("whatsHappening")}
					</label>
					<textarea
						id="composer-body"
						ref={textareaRef}
						value={body}
						autoFocus={autoFocus}
						onChange={(event) => setBody(event.target.value.slice(0, MAX_BODY))}
						placeholder={
							replyTo
								? t("replyingTo", { handle: replyTo.handle })
								: "Description"
						}
						rows={replyTo ? 2 : 3}
						className="w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground"
					/>

					{mediaDrafts.length > 0 && (
						<ul className="mt-2 space-y-2">
							{mediaDrafts.map((media, index) => (
								<li
									key={media.id}
									className="flex items-center gap-2 rounded-lg border border-border p-2"
								>
									<div className="relative size-14 shrink-0 overflow-hidden rounded bg-muted">
										{media.kind === "video" ? (
											<video src={media.previewUrl} muted playsInline className="h-full w-full object-cover" />
										) : (
											<img src={media.previewUrl} alt="" className="h-full w-full object-cover" />
										)}
									</div>
									<span className="w-12 shrink-0 text-[10px] font-medium uppercase text-muted-foreground">
										{media.kind}
									</span>
									{/* Alt text sits next to the asset, not behind a menu.
									    Accessibility that requires hunting is accessibility
									    nobody adds. */}
									<input
										value={media.altText}
										onChange={(event) =>
											setMediaDrafts((current) =>
												current.map((m, i) =>
													i === index
														? { ...m, altText: event.target.value }
														: m,
												),
											)
										}
										placeholder={t("altTextPlaceholder")}
										aria-label={t("altText")}
										className="min-w-0 flex-1 rounded border border-input bg-transparent px-2 py-1 text-xs outline-none focus:border-primary"
									/>
										<button
										 type="button"
										 onClick={() =>
											setMediaDrafts((current) => {
												const removed = current[index];
												if (removed) URL.revokeObjectURL(removed.previewUrl);
												return current.filter((_, i) => i !== index);
											})
										 }
										aria-label={t("removeMedia")}
										className="rounded p-1 text-muted-foreground hover:bg-muted"
									>
										<X className="size-4" />
									</button>
									<button type="button" onClick={() => setEditingMediaId(media.id)} className="rounded p-1 text-muted-foreground hover:bg-muted" aria-label="Edit media" title="Edit media">
										<Wand2 className="size-4" />
									</button>
								</li>
							))}
						</ul>
					)}

					{pollOptions && (
						<div className="mt-3 space-y-2">
							{pollOptions.map((option, index) => (
								<div key={index} className="flex items-center gap-2">
									<input
										value={option}
										onChange={(event) =>
											setPollOptions((current) =>
												(current ?? []).map((o, i) =>
													i === index ? event.target.value : o,
												),
											)
										}
										placeholder={t("pollOption", { number: index + 1 })}
										aria-label={t("pollOption", { number: index + 1 })}
										className="flex-1 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
									/>
									{pollOptions.length > 2 && (
										<button
											type="button"
											onClick={() =>
												setPollOptions((current) =>
													(current ?? []).filter((_, i) => i !== index),
												)
											}
											aria-label={t("removeOption")}
											className="rounded p-1 text-muted-foreground hover:bg-muted"
										>
											<X className="size-4" />
										</button>
									)}
								</div>
							))}
							<div className="flex gap-2">
								{pollOptions.length < MAX_POLL_OPTIONS && (
									<button
										type="button"
										onClick={() =>
											setPollOptions((current) => [...(current ?? []), ""])
										}
										className="text-sm text-primary hover:underline"
									>
										{t("addOption")}
									</button>
								)}
								<button
									type="button"
									onClick={() => setPollOptions(null)}
									className="text-sm text-muted-foreground hover:underline"
								>
									{t("removePoll")}
								</button>
							</div>
						</div>
					)}

					{place !== "" && (
						<div className="mt-3 flex items-center gap-2">
							<MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden />
							<input
								value={place}
								onChange={(event) => setPlace(event.target.value)}
								placeholder={t("addPlace")}
								aria-label={t("addPlace")}
								className="flex-1 rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm outline-none focus:border-primary"
							/>
						</div>
					)}

					{isSponsored && (
						<div className="mt-3 rounded-lg bg-secondary/50 p-3">
							<label
								htmlFor="composer-disclosure"
								className="block text-xs font-medium"
							>
								{t("disclosureLabel")}
							</label>
							<select
								id="composer-disclosure"
								value={disclosure}
								onChange={(event) =>
									setDisclosure(event.target.value as DisclosureKind)
								}
								className="mt-1 w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm"
							>
								<option value="paid_partnership">
									{t("disclosure.paidPartnership")}
								</option>
								<option value="gifted">{t("disclosure.gifted")}</option>
								<option value="affiliate">{t("disclosure.affiliate")}</option>
								<option value="own_brand">{t("disclosure.ownBrand")}</option>
							</select>
							<p className="mt-1.5 text-xs text-muted-foreground">
								{t("disclosureHelp")}
							</p>
						</div>
					)}

					{connectedPlatforms.length > 0 && (
						<fieldset className="mt-3">
							<legend className="text-xs font-medium text-muted-foreground">
								{t("alsoPublishTo")}
							</legend>
							<div className="mt-1.5 flex flex-wrap gap-1.5">
								{connectedPlatforms.map((platform) => {
									const on = platforms.includes(platform);
									return (
										<button
											key={platform}
											type="button"
											aria-pressed={on}
											onClick={() =>
												setPlatforms((current) =>
													on
														? current.filter((p) => p !== platform)
														: [...current, platform],
												)
											}
											className={cn(
												"rounded-full border px-3 py-1 text-xs capitalize transition-colors",
												on
													? "border-primary bg-primary/10 text-primary"
													: "border-border text-muted-foreground hover:border-primary/50",
											)}
										>
											{platform}
										</button>
									);
								})}
							</div>
							<p className="mt-1 text-xs text-muted-foreground">
								{t("simulcastNote")}
							</p>
						</fieldset>
					)}

					{scheduledFor !== "" && (
						<div className="mt-3 flex items-center gap-2">
							<CalendarClock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
							<input
								type="datetime-local"
								value={scheduledFor}
								onChange={(event) => setScheduledFor(event.target.value)}
								aria-label={t("scheduleFor")}
								className="rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm outline-none focus:border-primary"
							/>
							<button
								type="button"
								onClick={() => setScheduledFor("")}
								className="text-xs text-muted-foreground hover:underline"
							>
								{t("clear")}
							</button>
						</div>
					)}

					{/* ------------------------------------------------------ toolbar */}
					<div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
						<div className="flex flex-wrap items-center gap-0.5">
							<input
								ref={fileInputRef}
								type="file"
								accept="image/jpeg,image/png,image/webp,image/gif,video/*"
								multiple
								className="sr-only"
								onChange={(event) => {
									const files = Array.from(event.target.files ?? []);
									files.forEach((file) => {
										if (file.type.startsWith("video/")) {
											const validation = validateVideoFile(file);
											if (!validation.valid) {
												toast.error(validation.error);
												return;
											}
										}
										if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
											toast.error("Choose an image or video file.");
											return;
										}
										const draft: CommunityMediaDraft = {
											id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
											file,
											previewUrl: URL.createObjectURL(file),
											kind: file.type.startsWith("video/") ? "video" : "image",
											altText: "",
										};
										setMediaDrafts((current) => [...current, draft]);
										setEditingMediaId(draft.id);
									});
									if (event.target) event.target.value = "";
								}}
							/>
							<ToolButton
								icon={ImageIcon}
								label={t("addPhoto")}
								onClick={() => fileInputRef.current?.click()}
							/>
							<ToolButton
								icon={VideoIcon}
								label="Add a video"
								onClick={() => fileInputRef.current?.click()}
							/>
							<ToolButton
								icon={BarChart3}
								label={t("addPoll")}
								active={Boolean(pollOptions)}
								onClick={() =>
									setPollOptions((current) => (current ? null : ["", ""]))
								}
							/>
							<ToolButton
								icon={MapPin}
								label={t("addPlace")}
								active={place !== ""}
								onClick={() => setPlace((current) => (current === "" ? " " : ""))}
							/>
							<ToolButton
								icon={CalendarClock}
								label={t("scheduleFor")}
								active={scheduledFor !== ""}
								onClick={() =>
									setScheduledFor((current) =>
										current ? "" : defaultScheduleValue(),
									)
								}
							/>
							<ToolButton
								icon={ShoppingBag}
								label={t("markSponsored")}
								active={isSponsored}
								onClick={() => setIsSponsored((value) => !value)}
							/>
						</div>

						<div className="flex items-center gap-2">
							<label htmlFor="composer-visibility" className="sr-only">
								{t("whoCanSee")}
							</label>
							<select
								id="composer-visibility"
								value={visibility}
								onChange={(event) =>
									setVisibility(event.target.value as Visibility)
								}
								className="rounded-full border border-border bg-transparent px-3 py-1.5 text-xs"
							>
								{VISIBILITY_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{t(option.key)}
									</option>
								))}
							</select>

							{onCancel && (
								<Button
									variant="text"
									label={t("cancel")}
									onClick={onCancel}
									type="button"
								/>
							)}
							<Button
								variant="secondary"
								size="sm"
								label={t("saveDraft")}
								type="button"
								disabled={!canSubmit}
								onClick={() => handleSubmit(false)}
							/>
							<Button
								size="sm"
								type="button"
								disabled={!canSubmit}
								loading={busy}
								onClick={() => handleSubmit(true)}
								label={scheduledFor ? t("schedule") : t("post")}
								icon={<Send className="size-4" />}
								data-testid="composer-submit"
							/>
						</div>
					</div>

					{remaining < 300 && (
						<p
							className={cn(
								"mt-1 text-right text-xs",
								remaining < 0 ? "text-destructive" : "text-muted-foreground",
							)}
						>
							{remaining}
						</p>
					)}
					{uploadProgress !== null && (
						<p className="mt-2 text-xs text-muted-foreground">Uploading media… {uploadProgress}%</p>
					)}
				</div>
			</div>
			{editingDraft && (
				<CommunityMediaEditor
					draft={editingDraft}
					onClose={() => setEditingMediaId(null)}
					onSave={saveEditedMedia}
				/>
			)}
		</div>
	);
}

async function uploadCommunityMedia(
	drafts: CommunityMediaDraft[],
	onProgress: (value: number) => void,
): Promise<NonNullable<ComposeInput["media"]>> {
	if (drafts.length === 0) return [];
	const result: NonNullable<ComposeInput["media"]> = [];
	for (let index = 0; index < drafts.length; index += 1) {
		const draft = drafts[index];
		const start = (index / drafts.length) * 100;
		const span = 100 / drafts.length;
		if (draft.kind === "video") {
			const uploaded = await uploadVideo(draft.file, (percent) => {
				onProgress(Math.round(start + (percent / 100) * span));
			});
			let thumbnailUrl: string | undefined;
			try {
				const thumbnail = await createVideoThumbnail(draft.previewUrl);
				const form = new FormData();
				form.append("file", thumbnail);
				thumbnailUrl = (await apiClient.Integration.uploadMedia(form)).url || undefined;
			} catch {
				// The video remains publishable when a cover frame cannot be generated.
			}
			result.push({
				kind: "video",
				url: uploaded.url,
				thumbnailUrl,
				altText: draft.altText || undefined,
				width: draft.width,
				height: draft.height,
				duration: draft.duration,
			});
		} else {
			const form = new FormData();
			form.append("file", draft.file);
			const uploaded = await apiClient.Integration.uploadMedia(form);
			if (!uploaded.url) throw new Error("Image upload did not return a URL.");
			result.push({
				kind: "image",
				url: uploaded.url,
				altText: draft.altText || undefined,
				width: draft.width,
				height: draft.height,
			});
			onProgress(Math.round(start + span));
		}
	}
	return result;
}

function ToolButton({
	icon: Icon,
	label,
	active,
	onClick,
}: {
	icon: typeof Sparkles;
	label: string;
	active?: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			aria-pressed={active}
			title={label}
			className={cn(
				"rounded-full p-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
				active ? "text-primary" : "text-muted-foreground",
			)}
		>
			<Icon className="size-[18px]" aria-hidden />
		</button>
	);
}

/**
 * Default schedule: the next round hour, at least an hour out.
 *
 * `datetime-local` wants a local-time string with no zone, so this is built
 * from local parts rather than `toISOString()` — which would shift the value by
 * the reader's offset and schedule the post at the wrong time.
 */
export function defaultScheduleValue(now = new Date()): string {
	const target = new Date(now.getTime() + 60 * 60 * 1000);
	target.setMinutes(0, 0, 0);
	const pad = (value: number) => String(value).padStart(2, "0");
	return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(
		target.getDate(),
	)}T${pad(target.getHours())}:${pad(target.getMinutes())}`;
}
