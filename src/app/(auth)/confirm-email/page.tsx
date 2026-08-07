"use client";
import { useState } from "react";
import { useFormik } from "formik";
import { z } from "zod";
import { toFormikValidation } from "@/utils/zodFormikAdapter.util";
import toast from "react-hot-toast";
import { AuthInput } from "@/components/authentication";
import { Button } from "@/components/ui/button";
import { SendVerificationRequestType } from "@/types/auth/signup.type";
import { getIpAddress } from "@/utils/ipAddress.util";
import { apiClient } from "@/services/apiClient.service";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

const validationSchema = z.object({
	email: z
		.string()
		.trim()
		.min(1, "Email is required")
		.refine(
			(value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value),
			{ message: "Invalid email address" }
		),
});

export default function ConfirmEmailPage() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const emailFromQuery = searchParams.get("email") ?? "";

	const formik = useFormik<{ email: string }>({
		enableReinitialize: true,
		initialValues: {
			email: emailFromQuery,
		},
		validate: toFormikValidation(validationSchema),
		validateOnChange: false,
		validateOnBlur: true,
		onSubmit: async (values, { setStatus, resetForm }) => {
			setIsLoading(true);
			setStatus({});

			const ipAddress = await getIpAddress();
			const sendVerificationPayload: SendVerificationRequestType = {
				userAgent: navigator.userAgent,
				ipAddress,
				email: values.email.trim(),
			};

			try {
				// Email confirmation can be initiated before a user has a session.
				await apiClient.Account.sendReactivationVerificationAsync(sendVerificationPayload);
				toast.success("Verification email sent successfully!");
				router.push(`/confirm-email/${values.email}`);
				resetForm();
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
				toast.error(errorMessage);
				setStatus({ apiError: errorMessage });
			} finally {
				setIsLoading(false);
			}
		},
	});

	const isButtonDisabled = isLoading;

	return (
		<>
			<div className="px-6 pt-8 pb-[19px] max-sm:pt-6">
				<h1 className="text-center text-2xl font-bold">Email Verification</h1>
				<div className="text-center text-base text-muted-foreground mt-2">
					<p>Please enter your email to receive verification code</p>
				</div>

				<form onSubmit={formik.handleSubmit} noValidate className="w-full">
					<AuthInput
						label="Email"
						type="email"
						name="email"
						placeholder="Enter email..."
						onBlur={formik.handleBlur}
						onChange={formik.handleChange}
						value={formik.values.email}
						error={formik.touched.email ? formik.errors.email : undefined}
						placeholderIcon="/icons/email.svg"
					/>
					<div className={`text-center ${isButtonDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
						<Button
							type="submit"
							size="default"
							label={isLoading ? "Sending..." : "Send Code"}
							className="w-full h-13 bg-primary my-6 text-base"
							loading={isLoading}
							disabled={isButtonDisabled}
						/>
					</div>
				</form>
			</div>
		</>
	);
}
