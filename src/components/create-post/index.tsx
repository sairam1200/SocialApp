import React, { useState } from "react";
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
		caption: Yup.string().trim().nullable().notRequired(),
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
	const [activeStep, setActiveStep] = useState(0);
	const [activeSearchModal, setActiveSearchModal] = useState<"location" | "sound" | null>(null);
	const [customizePlatformId, setCustomizePlatformId] = useState<PlatformId | null>(null);

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
			validationSchema={Yup.lazy((values: CreatePostFormValues) =>
				createPostStepSchema(activeStep, values?.platforms || [])
			)}
			validateOnMount
			validateOnChange
			onSubmit={(values) => {
				if (activeStep < TOTAL_STEPS - 1) {
					goNext();
				} else {
					console.log("Form submitted:", values);
					// TODO: call post API
				}
			}}
		>
			{(formik) => (
				<DialogContainer
					open={open}
					onClose={close}
					title="Create Post"
					closeOnOverlayClick={false}
					footer={
						<div className="flex justify-between gap-4">
							<Button label="Cancel" variant="text" onClick={close} />

							<div className="flex gap-3">
								<Button variant="secondary" label="Back" hidden={activeStep === 0} onClick={goBack} />

								<Button label={activeStep === TOTAL_STEPS - 1 ? "Publish" : "Next"} onClick={formik.submitForm} />
							</div>
						</div>
					}
				>
					{CurrentStepComponent && (
						<CurrentStepComponent
							formik={formik}
							setActiveSearchModal={setActiveSearchModal}
							setCustomizePlatformId={setCustomizePlatformId}
							customizePlatformId={customizePlatformId}
						/>
					)}

					{/* Steps */}
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
