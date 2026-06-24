import React, { useState, useCallback } from "react";
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
import { PlatformId } from "@/constants/platforms";
import { PLATFORM_POST_TYPES } from "@/types/media.types";
import { apiClient } from "@/services/apiClient.service";
import { YoutubeVideoStatusResponse } from "@/types/social/youtube.type";
import { useYoutubeDiscover } from "@/hooks/useYoutubeDiscover";
import { useRetryUpload } from "@/hooks/api/useYoutube";
import { useChunkedUpload } from "@/hooks/upload/useChunkedUpload";
import YoutubeUploadProgress from "./YoutubeUploadProgress";
import toast from "react-hot-toast";

const mediaFileSchema: Yup.ObjectSchema<MediaFile> = Yup.object({
	file: Yup.mixed<File>().required("File is required"),
	previewUrl: Yup.string().required("Preview URL is required"),
	type: Yup.string()
		.oneOf(["image", "video"] as const)
		.required("Type is required"),
	id: Yup.string().required("ID is required"),
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
	const { profile: youtubeProfile } = useYoutubeDiscover();
	const { upload: chunkedUpload, state: uploadState, reset: resetUpload } = useChunkedUpload();
	const [activeStep, setActiveStep] = useState(0);
	const [activeSearchModal, setActiveSearchModal] = useState<"location" | "sound" | null>(null);
	const [customizePlatformId, setCustomizePlatformId] = useState<PlatformId | null>(null);
	const [uploadPhase, setUploadPhase] = useState<"idle" | "uploading" | "progress" | "complete" | "error">("idle");
	const [uploadVideoId, setUploadVideoId] = useState<string | null>(null);
	const [uploadError, setUploadError] = useState<string>("");
	const retryMutation = useRetryUpload();

	const goNext = () => {
		setActiveStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
	};

	const goBack = () => {
		setActiveStep((prev) => Math.max(prev - 1, 0));
	};

	const handleUploadComplete = useCallback((_status: YoutubeVideoStatusResponse) => {
		setUploadPhase("complete");
		setTimeout(() => close(), 2000);
	}, [close]);

	const handleUploadError = useCallback((error: string) => {
		setUploadPhase("error");
		setUploadError(error);
	}, []);

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

				const youtubePlatform = values.platforms.find((p) => p === "youtube");

				if (!youtubePlatform) {
					console.log("Form submitted:", values);
					setSubmitting(false);
					close();
					return;
				}

				setUploadPhase("uploading");

				const override = values.platformOverrides?.[youtubePlatform];
				const base = values.baseContent;
				const youtubeAccountId = youtubeProfile?.id ?? "";

				try {
					const videoFile = override?.mediaFiles?.[0] ?? base.mediaFiles[0];
					if (!videoFile) {
						setUploadPhase("error");
						setUploadError("No video file selected.");
						setSubmitting(false);
						return;
					}

					const result = await chunkedUpload(videoFile.file, {
						accountId: youtubeAccountId,
						title: override?.title ?? "",
						description: override?.caption ?? base.caption ?? "",
						tags: override?.tags,
						visibility: (values.platformPrivacy?.youtube as string) ?? "public",
						publishAt: values.postSchedule && values.postScheduleDate
							? values.postScheduleDate.toISOString()
							: undefined,
					});
					setUploadVideoId(result.videoId);
					setUploadPhase("progress");
				} catch (err: unknown) {
					setUploadPhase("error");
					setUploadError( "Failed to start upload. Please try again.");
				} finally {
					setSubmitting(false);
				}
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
					onClose={uploadPhase === "uploading" ? () => {} : close}
					title={uploadPhase === "idle" ? "Create Post" : "Uploading to YouTube"}
					closeOnOverlayClick={false}
					footer={
						uploadPhase === "idle" ? (
							<div className="flex justify-between gap-4">
								<Button label="Cancel" variant="text" onClick={close} />
								<div className="flex gap-3">
									<Button variant="secondary" label="Back" hidden={activeStep === 0} onClick={goBack} />
									<Button label={activeStep === TOTAL_STEPS - 1 ? "Publish" : "Next"} onClick={formik.submitForm} />
								</div>
							</div>
						) : uploadPhase === "uploading" ? (
							<div className="flex justify-end">
								<Button label="Please wait..." disabled />
							</div>
						) : uploadPhase === "complete" ? (
							<div className="flex justify-end">
								<Button label="Close" onClick={close} />
							</div>
						) : (
							<div className="flex justify-end gap-3">
								<Button label="Try Again" onClick={() => {
									if (uploadVideoId) {
										retryMutation.mutate(uploadVideoId);
										setUploadPhase("progress");
									} else {
										resetUpload();
										setUploadPhase("idle");
										setUploadError("");
										formik.submitForm();
									}
								}} />
								<Button label="Cancel" variant="text" onClick={close} />
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
					) : uploadPhase === "uploading" ? (
						<div className="py-8 space-y-4">
							<div className="flex items-center justify-center">
								<div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
							</div>
							{uploadState.phase === "initializing" && (
								<p className="text-center text-sm text-muted-foreground">Initializing upload session...</p>
							)}
							{uploadState.phase === "uploading" && (
								<div className="space-y-2">
									<p className="text-center text-sm text-muted-foreground">
										Uploading media files... {uploadState.progress}%
									</p>
									<div className="w-full max-w-xs mx-auto bg-muted rounded-full h-2 overflow-hidden">
										<div
											className="bg-primary h-full rounded-full transition-all duration-300"
											style={{ width: `${uploadState.progress}%` }}
										/>
									</div>
								</div>
							)}
							{uploadState.phase === "finalizing" && (
								<p className="text-center text-sm text-muted-foreground">Finalizing upload...</p>
							)}
						</div>
					) : uploadPhase === "progress" && uploadVideoId ? (
						<div className="py-4">
							<YoutubeUploadProgress
								videoId={uploadVideoId}
								onComplete={handleUploadComplete}
								onError={handleUploadError}
							/>
						</div>
					) : uploadPhase === "complete" ? (
						<div className="py-8 text-center space-y-2">
							<p className="text-lg text-green-600">✅ Upload Complete</p>
							<p className="text-sm text-muted-foreground">Your video has been uploaded to YouTube.</p>
						</div>
					) : (
						<div className="py-8 text-center space-y-2">
							<p className="text-lg text-destructive">❌ Upload Failed</p>
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
