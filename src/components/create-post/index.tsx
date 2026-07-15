import React, { useState, useCallback, useRef } from "react";
import DialogContainer from "../dialog/DialogContainer";
import { Button } from "../ui/button";
import ComposeStep from "./ComposeStep";
import { CreatePostFormValues, MediaFile } from "@/types/media.types";
import { cn } from "@/utils/cn.util";
import * as Yup from "yup";
import { Formik } from "formik";
import CustomizeStep from "./CustomizeStep";
import SettingsStep from "./SettingsStep";
import { SearchSelectionModal } from "./SearchSelectionModal";
import { PlatformId, platformMap } from "@/constants/platforms";
import { PLATFORM_POST_TYPES } from "@/types/media.types";
import { ALLOWED_VIDEO_MIME_TYPES } from "@/utils/media.utils";
import { useYoutubeDiscover } from "@/hooks/useYoutubeDiscover";
import { useFacebookDiscover } from "@/hooks/discovery/useFacebookDiscover";
import { useInstagramDiscover } from "@/hooks/discovery/useInstagramDiscover";
import { useLinkedInDiscover } from "@/hooks/discovery/useLinkedinDiscover";
import { usePinterestDiscover } from "@/hooks/discovery/usePinterestDiscover";
import { useConnectedPlatforms } from "@/hooks/useConnectedPlatforms";
import { usePublishContent, usePublishStatus, PublishJobStatus } from "@/hooks/api/usePublishContent";
import toast from "react-hot-toast";

const mediaFileSchema: Yup.ObjectSchema<MediaFile> = Yup.object({
	file: Yup.mixed<File>()
		.required("File is required")
		.test("video-mime", "Unsupported video format. Please upload an MP4 or Apple MOV video encoded with H.264 video and AAC audio.", (value) => {
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

type CreatePostProps = {
	close: () => void;
	open: boolean;
};

const steps = [
	{ key: "compose", label: "Compose" },
	{ key: "customize", label: "Customize" },
	{ key: "settings", label: "Settings" },
] as const;

const TOTAL_STEPS = steps.length;

function CreatePostDialog({ close, open }: CreatePostProps) {
	const { connectedPlatforms } = useConnectedPlatforms();
	const { profile: youtubeProfile } = useYoutubeDiscover({ enabled: connectedPlatforms.includes('youtube') });
	const { profile: facebookProfile } = useFacebookDiscover({ enabled: connectedPlatforms.includes('facebook') });
	const { profile: instagramProfile } = useInstagramDiscover({ enabled: connectedPlatforms.includes('instagram') });
	const { profile: linkedinProfile } = useLinkedInDiscover({ enabled: connectedPlatforms.includes('linkedin') });
	const { profile: pinterestProfile } = usePinterestDiscover({ enabled: connectedPlatforms.includes('pinterest') });
	const publishMutation = usePublishContent();
	const [activeStep, setActiveStep] = useState(0);
	const [activeSearchModal, setActiveSearchModal] = useState<"location" | "sound" | null>(null);
	const [customizePlatformId, setCustomizePlatformId] = useState<PlatformId | null>(null);
	const [uploadPhase, setUploadPhase] = useState<"idle" | "publishing" | "complete" | "error">("idle");
	const [uploadError, setUploadError] = useState<string>("");
	const [publishJobIds, setPublishJobIds] = useState<string[]>([]);
	const [publishErrors, setPublishErrors] = useState<Record<string, string>>({});
	const createdUrlsRef = useRef<Set<string>>(new Set());

	const handleClose = useCallback(() => {
		createdUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
		createdUrlsRef.current.clear();
		close();
	}, [close]);

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
				postSchedule: false,
				postScheduleDate: null,
				privacy: "public",
				platformPrivacy: {},
			}}
			onSubmit={async (values, { setSubmitting }) => {
				if (activeStep < TOTAL_STEPS - 1) {
					goNext();
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
				const videoFile = base.mediaFiles[0];
				if (!videoFile || videoFile.type !== "video") {
					setUploadPhase("error");
					setUploadError("No video file selected.");
					setSubmitting(false);
					return;
				}

				if (!videoFile.uploadId) {
					setUploadPhase("error");
					setUploadError("Video not uploaded yet. Please go back and re-upload.");
					setSubmitting(false);
					return;
				}

				setUploadPhase("publishing");

				const platformAccountMap: Partial<Record<PlatformId, string>> = {
					youtube: youtubeProfile?.id,
					facebook: facebookProfile?.id,
					instagram: instagramProfile?.id,
					linkedin: linkedinProfile?.id,
					pinterest: pinterestProfile?.id,
				};

				const jobIds: string[] = [];
				const errors: Record<string, string> = {};

				for (const platform of selectedPlatforms) {
					const platformOverride = values.platformOverrides?.[platform];
					const linkedAccountId = platformAccountMap[platform] ?? "";
					if (!linkedAccountId) {
						errors[platform] = `No connected account for ${platformMap[platform as PlatformId]?.name ?? platform}`;
						continue;
					}
					try {
					const publishResult = await publishMutation.mutateAsync({
						linkedAccountId,
						platform,
						uploadId: videoFile.uploadId,
						title: platformOverride?.title ?? "",
						description: platformOverride?.caption ?? base.caption ?? "",
						tags: platformOverride?.tags,
						visibility: (values.platformPrivacy?.[platform] as 'public' | 'private' | 'unlisted') ?? "public",
						publishAt: values.postSchedule && values.postScheduleDate
							? values.postScheduleDate.toISOString()
							: undefined,
						postType: platformOverride?.postType,
					});
						jobIds.push(publishResult.publishJobId);
					} catch (err) {
						errors[platform] = err instanceof Error ? err.message : "Publish failed";
					}
				}

				setPublishJobIds(jobIds);
				setPublishErrors(errors);

				if (jobIds.length > 0 && Object.keys(errors).length === 0) {
					setUploadPhase("complete");
				} else if (jobIds.length > 0) {
					setUploadPhase("complete");
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
						uploadPhase === "complete" ? "Publish Complete" :
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
								<Button label="Try Again" onClick={() => {
									setUploadPhase("idle");
									setUploadError("");
									formik.submitForm();
								}} />
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
									{publishJobIds.map((jobId) => (
										<PublishPlatformProgress key={jobId} publishJobId={jobId} />
									))}
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
							<p className="text-lg text-green-600">✅ Publish Complete</p>
							<p className="text-sm text-muted-foreground">Your content has been published.</p>
						</div>
					) : (
						<div className="py-8 text-center space-y-2">
							<p className="text-lg text-destructive">❌ Publish Failed</p>
							<p className="text-sm text-muted-foreground">{uploadError || "An unexpected error occurred."}</p>
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

function PublishPlatformProgress({ publishJobId }: { publishJobId: string }) {
	const { data: status } = usePublishStatus(publishJobId);

	if (!status) {
		return (
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<div className="size-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
				<span>Initializing...</span>
			</div>
		);
	}

	const isFailed = status.status === "failed";
	const isComplete = status.status === "completed";
	const platformName = platformMap[status.platform as PlatformId]?.name ?? status.platform;

	return (
		<div className="space-y-1">
			<div className="flex justify-between text-sm">
				<span className={isFailed ? "text-destructive" : isComplete ? "text-green-600" : "text-foreground"}>
					{isComplete ? "✅ " : isFailed ? "❌ " : ""}
					{platformName}: {status.statusMessage || status.status}
				</span>
				<span className="text-muted-foreground">{status.progress}%</span>
			</div>
			<div className="h-1.5 bg-muted rounded-full overflow-hidden">
				<div
					className={`h-full rounded-full transition-all duration-500 ${
						isFailed ? "bg-destructive" : isComplete ? "bg-green-500" : "bg-primary"
					}`}
					style={{ width: `${status.progress}%` }}
				/>
			</div>
			{isFailed && status.lastError && (
				<p className="text-xs text-destructive">{status.lastError}</p>
			)}
		</div>
	);
}
