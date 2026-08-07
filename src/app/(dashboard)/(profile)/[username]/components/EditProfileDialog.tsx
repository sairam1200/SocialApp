"use client";

import { Formik, Form } from "formik";
import * as yup from "yup";
import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { UserProfileType } from "@/types/account/profile.type";
import { apiClient } from "@/services/apiClient.service";
import toast from "react-hot-toast";
import { useState } from "react";

const validationSchema = yup.object({
	firstName: yup.string().required("First name is required").max(50, "Name is too long"),
	lastName: yup.string().required("Last name is required").max(50, "Name is too long"),
	gender: yup.string().required("Gender is required"),
	bio: yup.string().max(300, "Bio must be at most 300 characters"),
});

type DialogTypes = {
	open: boolean;
	onClose: () => void;
	openPhotoDialog: () => void;
	user: UserProfileType | undefined;
	onSuccess?: (updatedData: Partial<FormValues>) => void;
};

type FormValues = {
	firstName: string;
	lastName: string;
	gender: string;
	bio: string;
};

export default function EditProfileDialog({ open, onClose, openPhotoDialog, user, onSuccess }: DialogTypes) {

	const initialValues: FormValues = {
		firstName: user?.firstName ?? "",
		lastName: user?.lastName ?? "",
		gender: user?.gender ?? "",
		bio: user?.bio ?? "",
	};
	const [isLoading, setIsLoading] = useState(false);

	return (
		<DialogContainer
			open={open}
			onClose={onClose}
			title="Edit Profile"
			description=""
			closeOnOverlayClick={false}
			closeOnEsc
		>
			<Formik
				initialValues={initialValues}
				enableReinitialize
				validationSchema={validationSchema}
				onSubmit={async (values) => {
					const cleanedValues: Partial<FormValues> = Object.fromEntries(
						Object.entries(values).filter(([, v]) => v?.trim?.() !== "")
					);

					setIsLoading(true);

					const result = await apiClient.User.updateBasicInfoAsync(cleanedValues);
					if (result.success) {
						toast.success("Profile updated successfully");
						onSuccess?.(cleanedValues);
						onClose();
					} else {
						toast.error(result.error ?? "An unexpected error occurred. Please try again.");
					}

					setIsLoading(false);
				}}
			>
				{({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
					<Form className="space-y-3">
						{/* Profile photo */}
						<div className="flex items-center gap-4 cursor-pointer mb-5" onClick={openPhotoDialog}>
							<div className="shadow-md shadow-[#6136FF40] rounded-full group">
								<UserAvatar src={user?.photo} alt="User avatar" size="lg" />
							</div>
							<div className="flex flex-1 justify-between items-center gap-3">
								<p className="flex flex-col gap-1">
									<span className="text-sm">Edit Profile Picture</span>
									<span className="text-gray-neutral text-xs">Your profile picture is visible to everyone</span>
								</p>
								<ChevronRight size={20} />
							</div>
						</div>

						{/* Name */}
						<div className="flex gap-3">
							<div className="flex-1 min-w-0">
								<Input
									label="First Name"
									name="firstName"
									type="text"
									placeholder="First Name"
									value={values.firstName}
									onChange={handleChange}
									onBlur={handleBlur}
									error={touched.firstName && errors.firstName ? errors.firstName : ""}
								/>
							</div>
							<div className="flex-1 min-w-0">
								<Input
									label="Last Name"
									name="lastName"
									type="text"
									placeholder="Last Name"
									value={values.lastName}
									onChange={handleChange}
									onBlur={handleBlur}
									error={touched.lastName && errors.lastName ? errors.lastName : ""}
								/>
							</div>
						</div>

						{/* Gender */}
						<div>
							<Select
								label="Gender"
								placeholder="Select your gender"
								name="gender"
								value={values.gender}
								onValueChange={(value) => setFieldValue("gender", value)}
								error={touched.gender && errors.gender ? errors.gender : ""}
								options={[
									{ value: "male", label: "Male" },
									{ value: "female", label: "Female" },
									{ value: "other", label: "Other" },
									{ value: "prefer-not-to-say", label: "Prefer not to say" },
								]}
							/>
						</div>

						{/* Bio */}
						<div className="relative">
							<Textarea
								label="Bio"
								name="bio"
								placeholder="Edit bio"
								rows={5}
								value={values.bio}
								onChange={handleChange}
								onBlur={handleBlur}
								error={touched.bio && errors.bio ? errors.bio : ""}
							/>
							<div className="text-right text-xs text-[#595959] mt-1 absolute bottom-2 right-2">
								{values.bio?.length || 0} / 300
							</div>
						</div>

						{/* Buttons */}
						<div className="w-full flex justify-end mt-5 gap-3">
							<Button type="button" className="bg-white border border-primary text-primary" onClick={onClose}>
								Cancel
							</Button>
							<Button type="submit" loading={isLoading} disabled={isLoading}>
								{"Done"}
							</Button>
						</div>
					</Form>
				)}
			</Formik>
		</DialogContainer>
	);
}