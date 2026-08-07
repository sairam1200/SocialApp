import React, { useState, useCallback, useRef } from "react";
import DialogContainer from "../dialog/DialogContainer";
import { Button } from "../ui/button";
import ComposeStep from "./ComposeStep";
import { CreatePostFormValues, MediaFile } from "@/types/media.types";
import { cn } from "@/utils/cn.util";
import * as Yup from "yup";
import { Formik, FormikProps } from "formik";
import CustomizeStep from "./CustomizeStep";
import SettingsStep from "./SettingsStep";
import { SearchSelectionModal } from "./SearchSelectionModal";
import { PlatformId, platformMap } from "@/constants/platforms";
import { PLATFORM_POST_TYPES } from "@/types/media.types";
import { ALLOWED_VIDEO_MIME_TYPES, createVideoThumbnail } from "@/utils/media.utils";
import { usePublishStatus, PublishJobStatus } from "@/hooks/api/usePublishContent";
import { browserTimezone, useCreatePost, usePublishChannels } from "@/hooks/api/usePublishing";
import type { CreatePostTarget, PostFormat } from "@/types/publishing.types";
import { apiClient } from "@/services/apiClient.service";
import { useUploadActions } from "@/providers/UploadProvider";
import toast from "react-hot-toast";
import { devError, devLog } from "@/utils/devLogger";

const mediaFileSchema: Yup.ObjectSchema<MediaFile> = Yup.object({
	file: Yup.mixed<File>()
		.required("File is required")
		.test("video-mime", "Unsupported video format. Please choose MP4, MOV, WebM, AVI, MKV, WMV, or MPEG.", (value) => {
			if (!value) return true;
			if (value.type.startsWith("video/") && !(ALLOWED_VIDEO_MIME_TYPES as readonly string[]).includes(value.type)) {
				return false;
			}
			return true;
		}),
	previewUrl: Yup.string().required("Preview URL is required"),
	type: Yup.string()
		.oneOf(["image", "video"] as const)
		.required("Type is required"),
	id: Yup.string().required("ID is required"),
	serverUrl: Yup.string().optional().default(undefined),
	uploadId: Yup.string().optional().default(undefined),
	r2Key: Yup.string().optional().default(undefined),
	fileSize: Yup.number().optional().default(undefined),
	uploadStatus: Yup.string()
		.oneOf(["local", "uploading", "checking", "converting", "completed", "error"] as const)
		.optional()
		.default(undefined),
	uploadProgress: Yup.number().optional().default(undefined),
	uploadError: Yup.string().optional().default(undefined),
});

const createBaseContentSchema = (platforms: PlatformId[]) =>
	Yup.object({
		caption: Yup.string()
			.trim()
			.nullable()
			.notRequired()
			.test("youtube-caption-length", "YouTube description must be 5000 characters or less", (value) => {
				if (platforms.includes("youtube") && value && value.length > 5000) {
					return false;
				}
				return true;
			}),
		mediaFiles: Yup.array()
			.of(mediaFileSchema)
			.defined()
			.test("instagram-media", "Instagram posts require at least one media file", (value) => {
				if (platforms.includes("instagram")) {
					return (value?.length ?? 0) > 0;
				}
				return true;
			}),
		location: Yup.object().nullable().notRequired(),
		sound: Yup.object().nullable().notRequired(),
	});

const createPlatformOverrideSchema = (
	platform: PlatformId,
	selectedPlatforms: PlatformId[]
) =>
	Yup.object({
		caption: Yup.string().trim().nullable().optional(),

		mediaFiles: Yup.array()
			.of(mediaFileSchema)
			.optional()
			.test(
				"platform-media",
				`${platform} requires media`,
				(value, context) => {
					const baseFiles =
						context?.options?.context?.baseContent?.mediaFiles ?? [];

					const totalFiles = (value?.length ?? 0) + baseFiles.length;

					if (platform === "instagram") {
						return totalFiles > 0;
					}

					if (platform === "youtube") {
						return totalFiles > 0;
					}

					return true;
				}
			),

		tags: Yup.array().of(Yup.string()).optional(),

		location: Yup.object().nullable().optional(),

		sound: Yup.object().nullable().optional(),

		postType: Yup.string()
			.oneOf(PLATFORM_POST_TYPES[platform])
			.required("Post type is required"),

		title: Yup.string()
			.trim()
			.when([], {
				is: () => platform === "youtube",
				then: (schema) =>
					schema
						.max(100, "YouTube title must be 100 characters or less")
						.required("YouTube title is required"),
				otherwise: (schema) => schema.notRequired(),
			}),

		visibility: Yup.string()
			.oneOf(["public", "private", "unlisted"])
			.when([], {
				is: () => platform === "youtube",
				then: (schema) => schema.required("Visibility is required"),
				otherwise: (schema) => schema.notRequired(),
			}),

		boardId: Yup.string().when([], {
			is: () => platform === "pinterest",
			then: (schema) => schema.required("Choose a Pinterest board"),
			otherwise: (schema) => schema.notRequired(),
		}),
	});

const createPostStepSchema = (step: number, platforms: PlatformId[]) => {
	switch (step) {
		case 0: // Compose step
			return Yup.object({
				platforms: Yup.array().of(Yup.string()).min(1, "Select at least one platform").required(),
				baseContent: createBaseContentSchema(platforms),
			});

		case 1: // Customize step
			return Yup.object({
				platformOverrides: Yup.lazy((value) => {
					if (!value) return Yup.object().nullable();

					return Yup.object(
						Object.keys(value).reduce<Record<string, Yup.AnySchema>>(
							(acc, platform) => {
								acc[platform] = createPlatformOverrideSchema(
									platform as PlatformId,
									platforms
								);
								return acc;
							},
							{}
						)
					).nullable();
				}),
			});

		case 2: // Settings step
			return Yup.object({
				postSchedule: Yup.boolean(),
				postScheduleDate: Yup.date()
					.nullable()
					.when("postSchedule", {
						is: true,
						then: (schema) =>
							schema
								.required("Please select a date and time")
								.test("is-future", "Scheduled time must be in the future", (value) => {
									if (!value) return false;
									return value > new Date();
								}),
						otherwise: (schema) => schema.notRequired(),
					}),
				privacy: Yup.string().required("Privacy is required"),
				platformPrivacy: Yup.object().nullable().notRequired(),
			});

		default:
			return Yup.object({});
	}
};

/**
 * What kind of post this is, from what the composer actually holds.
 *
 * Derived rather than asked, because the answer is already implied by the media
 * and a separate control would let the two disagree. No media is a text post,
 * which is the ordinary case on LinkedIn, X and Threads and was impossible here
 * until the publish path stopped requiring a video.
 */
function derivePostFormat(media: MediaFile[]): PostFormat {
	if (media.length === 0) return "text";
	if (media.length > 1) return "carousel";
	return media[0].type === "video" ? "video" : "image";
}

type CreatePostProps = {
	close: () => void;
	open: boolean;
	/**
	 * Seeds the schedule when the composer is opened from a calendar slot.
	 *
	 * Clicking an empty Tuesday 09:00 and then having to re-enter Tuesday 09:00
	 * is the kind of small friction that makes a calendar decorative.
	 */
	initialScheduleAt?: Date | null;
};

const steps = [
	{ key: "compose", label: "Compose" },
	{ key: "customize", label: "Customize" },
	{ key: "settings", label: "Settings" },
] as const;

const TOTAL_STEPS = steps.length;

function CreatePostDialog({ close, open, initialScheduleAt }: CreatePostProps) {
	// One call for every publishable account, rather than one bespoke profile
	// hook per platform. That map is why TikTok, X and Threads could not be
	// selected here for a release after they became publishable on the server.
	const { data: publishChannels } = usePublishChannels();
	const createPostMutation = useCreatePost();
	const { cancelUpload, dismissUpload } = useUploadActions();
	const formikRef = useRef<FormikProps<CreatePostFormValues>>(null);
	const channelByPlatform = React.useMemo(
		() => new Map((publishChannels?.channels ?? []).map((channel) => [channel.platform, channel])),
		[publishChannels],
	);
	const [activeStep, setActiveStep] = useState(0);
	const [activeSearchModal, setActiveSearchModal] = useState<"location" | "sound" | null>(null);
	const [customizePlatformId, setCustomizePlatformId] = useState<PlatformId | null>(null);
	const [uploadPhase, setUploadPhase] = useState<"idle" | "publishing" | "complete" | "error">("idle");
	const [uploadError, setUploadError] = useState<string>("");
	const [publishJobIds, setPublishJobIds] = useState<string[]>([]);
	const [publishErrors, setPublishErrors] = useState<Record<string, string>>({});
	/** A scheduled post has no worker yet, so the progress bar would sit at zero for a week. */
	const [scheduledForLater, setScheduledForLater] = useState(false);
	const [terminalJobs, setTerminalJobs] = useState<Record<string, PublishJobStatus>>({});
	const createdUrlsRef = useRef<Set<string>>(new Set());

	const handleClose = useCallback(() => {
		const mediaFiles = formikRef.current?.values.baseContent.mediaFiles ?? [];
		mediaFiles.forEach((media) => {
			cancelUpload(media.id);
			dismissUpload(media.id);
		});
		formikRef.current?.resetForm();
		setActiveStep(0);
		setUploadPhase("idle");
		setUploadError("");
		setPublishJobIds([]);
		setPublishErrors({});
		setScheduledForLater(false);
		setTerminalJobs({});
		createdUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
		createdUrlsRef.current.clear();
		close();
	}, [cancelUpload, close, dismissUpload]);

	const handleTerminalJob = useCallback((status: PublishJobStatus) => {
		setTerminalJobs((current) => {
			if (current[status.id]?.status === status.status && current[status.id]?.lastError === status.lastError) return current;
			return { ...current, [status.id]: status };
		});
	}, []);

	const handlePublishStatus = useCallback((status: PublishJobStatus) => {
		setTerminalJobs((current) => {
			const previous = current[status.id];
			if (previous?.status === status.status && previous?.progress === status.progress && previous?.lastError === status.lastError && previous?.statusMessage === status.statusMessage) return current;
			return { ...current, [status.id]: status };
		});
	}, []);

	React.useEffect(() => {
		if (uploadPhase !== "publishing" || publishJobIds.length === 0) return;
		if (publishJobIds.some((jobId) => !terminalJobs[jobId])) return;
		const failed = Object.values(terminalJobs).some((job) => ["failed", "expired"].includes(job.status));
		if (failed || Object.keys(publishErrors).length > 0) {
			setUploadError("One or more platforms could not publish this video. Review the platform error and reconnect if required.");
		}
		setUploadPhase(failed || Object.keys(publishErrors).length > 0 ? "error" : "complete");
	}, [uploadPhase, publishJobIds, terminalJobs, publishErrors]);

	const goNext = () => {
		setActiveStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
	};

	const goBack = () => {
		setActiveStep((prev) => Math.max(prev - 1, 0));
	};

	const CurrentStepComponent = {
		compose: ComposeStep,
		customize: CustomizeStep,
		settings: SettingsStep,
	}[steps[activeStep].key];

	return (
		<Formik<CreatePostFormValues>
			initialValues={{
				platforms: [],
				baseContent: {
					caption: "",
					mediaFiles: [],
					location: null,
					sound: null,
				},
				platformOverrides: null,
				postSchedule: Boolean(initialScheduleAt),
				postScheduleDate: initialScheduleAt ?? null,
				privacy: "public",
				platformPrivacy: {},
			}}
			innerRef={formikRef}
			// Without this the second slot the user clicks reuses the first
			// slot's initial values, because Formik only reads them on mount.
			enableReinitialize
			 onSubmit={async (values, { setSubmitting, setFieldValue }) => {
				devLog("submit started", {
					activeStep,
					platforms: values.platforms,
					mediaCount: values.baseContent.mediaFiles.length,
					hasSchedule: values.postSchedule,
				});
				if (activeStep < TOTAL_STEPS - 1) {
					goNext();
					devLog("advanced to next step", { nextStep: activeStep + 1 });
					setSubmitting(false);
					return;
				}

				const selectedPlatforms = values.platforms;
				if (selectedPlatforms.length === 0) {
					toast.error("Select at least one platform");
					setSubmitting(false);
					return;
				}

				const base = values.baseContent;
				const media = base.mediaFiles;
				const primaryMedia = media[0];
				const postFormat = derivePostFormat(media);
				let primaryUploadId = primaryMedia?.uploadId;

				// Only the formats that carry a file need an upload. A text post on
				// LinkedIn or X has no media at all, and requiring one here is what
				// kept three of the six named platforms out of the composer.
				if (postFormat !== "text") {
					if (!primaryMedia) {
						setUploadPhase("error");
						setUploadError("No media selected.");
						setSubmitting(false);
						return;
					}
					// Image uploads are small, direct requests. If the user submits
					// while that request is still updating Formik, finish it here so
					// publishing never receives an empty uploadId.
					if (!primaryUploadId && primaryMedia.type === "image") {
						try {
							const imageFormData = new FormData();
							imageFormData.append("file", primaryMedia.file);
							const imageUpload = await apiClient.Integration.uploadMedia(imageFormData);
							primaryUploadId = imageUpload.uploadId;
							if (!primaryUploadId) {
								throw new Error("Image upload did not return an uploadId");
							}
							const updatedMedia = media.map((item) =>
								item.id === primaryMedia.id
									? {
											...item,
											serverUrl: imageUpload.publicUrl ?? imageUpload.url,
											uploadId: primaryUploadId,
											r2Key: imageUpload.r2Key,
											fileSize: imageUpload.fileSize ?? item.file.size,
											uploadStatus: "completed" as const,
											uploadProgress: 100,
										}
									: item,
							);
							await setFieldValue("baseContent.mediaFiles", updatedMedia, false);
						} catch (imageUploadError) {
							setUploadPhase("error");
							setUploadError(imageUploadError instanceof Error ? imageUploadError.message : "Image upload failed");
							setSubmitting(false);
							return;
						}
					}
					if (!primaryUploadId) {
						setUploadPhase("error");
						setUploadError("Media not uploaded yet. Please go back and re-upload.");
						setSubmitting(false);
						return;
					}
				} else if (!base.caption?.trim()) {
					setUploadPhase("error");
					setUploadError("A post with no media needs some text.");
					setSubmitting(false);
					return;
				}

				setUploadPhase("publishing");
				setTerminalJobs({});
				devLog("publishing selected platforms", {
					platforms: selectedPlatforms,
					postFormat,
					uploadId: primaryUploadId,
					mediaCount: media.length,
				});

				const targets: CreatePostTarget[] = [];
				const errors: Record<string, string> = {};
				let pinterestCoverImageUrl: string | undefined;

				// Per-channel preparation still happens one platform at a time: a
				// YouTube thumbnail and a Pinterest cover are uploads of their own and
				// have to exist before the post is created. The post itself is then a
				// single call, so five channels are one row on the calendar rather
				// than five unrelated ones.
				for (const platform of selectedPlatforms) {
					devLog("platform prepare started", { platform });
					const platformOverride = values.platformOverrides?.[platform];
					const channel = channelByPlatform.get(platform);
					if (!channel) {
						devLog("platform skipped: no publishable account", { platform });
						const name = platformMap[platform as PlatformId]?.name ?? platform;
						// Connected but with no publisher registered is a different
						// problem from not connected at all, and telling the user to
						// reconnect an account that is already connected wastes their
						// afternoon.
						errors[platform] = publishChannels?.connectedButNotPublishable.includes(platform)
							? `${name} is connected, but publishing to it is not available on this server yet.`
							: `No connected account for ${name}`;
						continue;
					}
					// A platform that is connected but gated, TikTok before its audit
					// for instance, says so here rather than three minutes into an
					// upload that the platform then refuses.
					if (channel.publishBlockedReason) {
						errors[platform] = `${platformMap[platform as PlatformId]?.name ?? platform}: ${channel.publishBlockedReason}`;
						continue;
					}
					let metadata: Record<string, unknown> | undefined;
					if (platform === "youtube" && platformOverride?.thumbnailFile?.file) {
						try {
							const thumbnailFormData = new FormData();
							thumbnailFormData.append("file", platformOverride.thumbnailFile.file);
							const thumbnailUrl = (await apiClient.Integration.uploadMedia(thumbnailFormData)).url;
							metadata = { thumbnailUrl };
							devLog("YouTube thumbnail uploaded", { hasUrl: Boolean(thumbnailUrl) });
						} catch (thumbnailError) {
							devError("YouTube thumbnail upload failed", {
								error: thumbnailError instanceof Error ? thumbnailError.message : String(thumbnailError),
							});
							errors[platform] = thumbnailError instanceof Error
								? `YouTube thumbnail failed: ${thumbnailError.message}`
								: "YouTube thumbnail failed";
							continue;
						}
					}
					if (platform === "pinterest") {
						if (!platformOverride?.boardId) {
							errors[platform] = "Choose a Pinterest board before publishing.";
							continue;
						}
						try {
							if (!pinterestCoverImageUrl) {
								const coverFile = platformOverride?.thumbnailFile?.file
									?? (primaryMedia && primaryMedia.type === "video"
										? await createVideoThumbnail(primaryMedia.previewUrl)
										: undefined);
								if (coverFile) {
									const formData = new FormData();
									formData.append("file", coverFile);
									pinterestCoverImageUrl = (await apiClient.Integration.uploadMedia(formData)).url;
									devLog("Pinterest cover image uploaded", { hasUrl: Boolean(pinterestCoverImageUrl) });
								}
							}
							metadata = { boardId: platformOverride.boardId, coverImageUrl: pinterestCoverImageUrl };
						} catch (coverError) {
							devError("Pinterest cover image upload failed", {
								error: coverError instanceof Error ? coverError.message : String(coverError),
							});
							errors[platform] = coverError instanceof Error ? `Pinterest cover image failed: ${coverError.message}` : "Pinterest cover image failed";
							continue;
						}
					}

					targets.push({
						linkedAccountId: channel.linkedAccountId,
						platform,
						uploadId: primaryUploadId,
						title: platformOverride?.title ?? "",
						description: platformOverride?.caption ?? base.caption ?? "",
						tags: platformOverride?.tags,
						visibility: (values.platformPrivacy?.[platform] as "public" | "private" | "unlisted") ?? values.privacy ?? "public",
						postFormat,
						postType: platformOverride?.postType,
						metadata,
					});
				}

				const jobIds: string[] = [];

				if (targets.length > 0) {
					try {
						const result = await createPostMutation.mutateAsync({
							targets,
							description: base.caption ?? "",
							postFormat,
							uploadId: primaryUploadId,
							publishAt: values.postSchedule && values.postScheduleDate
								? values.postScheduleDate.toISOString()
								: undefined,
							timezone: browserTimezone(),
						});
						for (const channelResult of result.channels) {
							if (channelResult.publishJobId) {
								jobIds.push(channelResult.publishJobId);
							} else if (channelResult.error) {
								// A channel the server rejected joins the ones the client
								// rejected, in the same list, so the user reads one set of
								// reasons rather than two.
								errors[channelResult.platform] = channelResult.error;
							}
						}
						devLog("post created", { groupId: result.groupId, accepted: result.accepted, rejected: result.rejected });
					} catch (err) {
						devError("create post request failed", {
							error: err instanceof Error ? err.message : String(err),
						});
						for (const target of targets) {
							errors[target.platform] = err instanceof Error ? err.message : "Publish failed";
						}
					}
				}

				setPublishJobIds(jobIds);
				setPublishErrors(errors);
				devLog("publish requests completed", {
					queuedJobCount: jobIds.length,
					failedPlatforms: Object.keys(errors),
				});

				if (jobIds.length > 0) {
					// The API only queues work. Stay on the progress view until every
					// worker reports a terminal status. A scheduled post reports
					// `scheduled` immediately and has no worker until its minute.
					setScheduledForLater(Boolean(values.postSchedule));
					setUploadPhase(values.postSchedule ? "complete" : "publishing");
				} else {
					setUploadPhase("error");
					setUploadError("Failed to publish to any platform.");
				}

				setSubmitting(false);
			}}
			validationSchema={Yup.lazy((values: CreatePostFormValues) =>
				createPostStepSchema(activeStep, values?.platforms || [])
			)}
			validateOnMount
			validateOnChange
		>
			{(formik) => (
				<DialogContainer
					open={open}
					onClose={uploadPhase === "publishing" ? () => {} : handleClose}
					title={
						uploadPhase === "idle" ? "Create Post" :
						uploadPhase === "publishing" ? "Publishing to Platforms" :
						uploadPhase === "complete" ? (scheduledForLater ? "Scheduled" : "Publish Complete") :
						"Publish Failed"
					}
					closeOnOverlayClick={false}
					footer={
						uploadPhase === "idle" ? (
							<div className="flex justify-between gap-4">
								<Button label="Cancel" variant="text" onClick={handleClose} />
								<div className="flex gap-3">
									<Button variant="secondary" label="Back" hidden={activeStep === 0} onClick={goBack} />
									<Button label={activeStep === TOTAL_STEPS - 1 ? "Publish" : "Next"} onClick={formik.submitForm} />
								</div>
							</div>
						) : uploadPhase === "publishing" ? (
							<div className="flex justify-end">
								<Button label="Please wait..." disabled />
							</div>
						) : uploadPhase === "complete" ? (
							<div className="flex justify-end">
								<Button label="Close" onClick={handleClose} />
							</div>
						) : (
							<div className="flex justify-end gap-3">
								<Button label="Start New Post" onClick={handleClose} />
								<Button label="Cancel" variant="text" onClick={handleClose} />
							</div>
						)
					}
				>
					{uploadPhase === "idle" ? (
						<>
							{CurrentStepComponent && (
								<CurrentStepComponent
									formik={formik}
									setActiveSearchModal={setActiveSearchModal}
									setCustomizePlatformId={setCustomizePlatformId}
									customizePlatformId={customizePlatformId}
									createdUrlsRef={createdUrlsRef}
								/>
							)}

							<div className="flex items-center gap-6 mt-5">
								{steps.map((step, index) => (
									<div
										key={step.key}
										className={cn(
											"flex items-center gap-2",
											activeStep === index ? "text-primary font-medium" : "text-[#737373]",
											activeStep > index && "text-primary font-normal"
										)}
									>
										<div
											className={cn(
												"size-3 rounded-full",
												activeStep === index ? "bg-primary" : "bg-transparent border-2 border-[#737373]",
												activeStep > index && "border-primary border-2"
											)}
										/>
										<span>{step.label}</span>
									</div>
								))}
							</div>
						</>
					) : uploadPhase === "publishing" ? (
						<div className="py-8 space-y-4">
							<div className="flex items-center justify-center">
								<div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
							</div>
							<p className="text-center text-sm text-muted-foreground">Publishing to platforms...</p>
							{publishJobIds.length > 0 && (
								<div className="mt-4 space-y-2 max-w-sm mx-auto">
									<PublishProgressSummary publishJobIds={publishJobIds} onStatus={handlePublishStatus} onTerminal={handleTerminalJob} />
								</div>
							)}
							{Object.keys(publishErrors).length > 0 && (
								<div className="mt-4 space-y-1">
									{Object.entries(publishErrors).map(([platform, error]) => (
										<p key={platform} className="text-xs text-destructive text-center">
											{platformMap[platform as PlatformId]?.name ?? platform}: {error}
										</p>
									))}
								</div>
							)}
						</div>
					) : uploadPhase === "complete" ? (
						<div className="py-8 text-center space-y-2">
							<p className="text-lg text-green-600">{scheduledForLater ? "Scheduled" : "Publish Complete"}</p>
							<p className="text-sm text-muted-foreground">
								{scheduledForLater
									? "It is on the calendar and will go out at the time you chose."
									: "Your content has been processed by all selected platforms."}
							</p>
							{!scheduledForLater && (
								<PublishProgressSummary publishJobIds={publishJobIds} onStatus={handlePublishStatus} />
							)}
						</div>
					) : (
						<div className="py-8 text-center space-y-2">
							<p className="text-lg text-destructive">❌ Publish Failed</p>
							<p className="text-sm text-muted-foreground">{uploadError || "An unexpected error occurred."}</p>
							<PublishProgressSummary publishJobIds={publishJobIds} onStatus={handlePublishStatus} />
							{Object.entries(publishErrors).map(([platform, error]) => <p key={platform} className="text-xs text-destructive">{platformMap[platform as PlatformId]?.name ?? platform}: {error}</p>)}
						</div>
					)}

					{activeSearchModal && (
						<SearchSelectionModal
							type={activeSearchModal}
							isOpen={activeSearchModal !== null}
							onClose={() => setActiveSearchModal(null)}
							onSelect={(data) => {
								if (activeStep === 0) {
									formik.setFieldValue(`baseContent.${activeSearchModal}`, data);
								} else {
									formik.setFieldValue(`platformOverrides.${customizePlatformId}.${activeSearchModal}`, data);
								}
								setActiveSearchModal(null);
							}}
						/>
					)}
				</DialogContainer>
			)}
		</Formik>
	);
}

export default CreatePostDialog;

function PublishProgressSummary({ publishJobIds, onStatus, onTerminal }: { publishJobIds: string[]; onStatus: (status: PublishJobStatus) => void; onTerminal?: (status: PublishJobStatus) => void }) {
	const [statuses, setStatuses] = React.useState<Record<string, PublishJobStatus>>({});
	const handleStatus = React.useCallback((status: PublishJobStatus) => {
		setStatuses((current) => ({ ...current, [status.id]: status }));
		onStatus(status);
	}, [onStatus]);
	const progress = publishJobIds.length === 0 ? 0 : Math.round(publishJobIds.reduce((total, id) => total + (statuses[id]?.progress ?? 0), 0) / publishJobIds.length);

	return (
		<div className="space-y-3">
			<div className="flex justify-between text-sm">
				<span className="text-foreground">Overall publishing progress</span>
			</div>
			<div className="h-1.5 bg-muted rounded-full overflow-hidden">
				<div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
			</div>
			<div className="space-y-2">
				{publishJobIds.map((jobId) => <PublishPlatformProgress key={jobId} publishJobId={jobId} onStatus={handleStatus} onTerminal={onTerminal} />)}
			</div>
		</div>
	);
}

function PublishPlatformProgress({ publishJobId, onStatus, onTerminal }: { publishJobId: string; onStatus: (status: PublishJobStatus) => void; onTerminal?: (status: PublishJobStatus) => void }) {
	const { data: status, isError, error } = usePublishStatus(publishJobId);
	React.useEffect(() => {
		if (status && ["completed", "failed", "expired"].includes(status.status)) {
			devLog("platform job reached terminal status", {
				publishJobId,
				platform: status.platform,
				status: status.status,
				progress: status.progress,
				lastError: status.lastError,
			});
			onTerminal?.(status);
		}
	}, [status, onTerminal]);
	React.useEffect(() => {
		if (status) onStatus(status);
	}, [status, onStatus]);

	if (!status) {
		if (isError) {
			return <div className="text-sm text-destructive">Could not read publishing status: {error instanceof Error ? error.message : "status request failed"}</div>;
		}
		return (
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<div className="size-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
				<span>Initializing...</span>
			</div>
		);
	}

	const isFailed = status.status === "failed" || status.status === "expired";
	const isComplete = status.status === "completed";
	const platformName = platformMap[status.platform as PlatformId]?.name ?? status.platform;

	return (
		<div className="space-y-1">
			<div className="text-sm">
				<span className={isFailed ? "text-destructive" : isComplete ? "text-green-600" : "text-foreground"}>
					{isFailed ? "❌ " : ""}
					{platformName}: {status.statusMessage || status.status}
				</span>
			</div>
			{isFailed && status.lastError && (
				<div className="flex items-start justify-between gap-2">
					<p className="text-xs text-destructive">{status.lastError}</p>
					<button
						type="button"
						className="shrink-0 text-xs text-primary underline"
						onClick={async () => {
							try {
								const { authorizeURL } = await apiClient.Integration.connect(status.platform);
								window.location.assign(authorizeURL);
							} catch (reconnectError) {
								toast.error(reconnectError instanceof Error ? reconnectError.message : "Could not reconnect integration");
							}
						}}
					>
						Reconnect {platformName}
					</button>
				</div>
			)}
		</div>
	);
}
