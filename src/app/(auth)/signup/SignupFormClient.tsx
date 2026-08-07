"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { AuthCard, AuthCheckbox, AuthInput } from "@/components/authentication";
import { Turnstile } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/button";
import { getIpAddress } from "@/utils/ipAddress.util";
import { apiClient } from "@/services/apiClient.service";
import { RegisterResponseType } from "@/types/auth/signup.type";
import { apiErrorMessage, parseApiError } from "@/utils/api-error.util";
import type { ApiError } from "@/types/error.types";
import { isTurnstileConfigurationSafe } from "@/utils/turnstile.util";

interface SignupProps {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
	agree: boolean;
}

const validationSchema = Yup.object({
	firstName: Yup.string()
		.matches(/^[A-Za-z]+$/, "First name must contain only letters")
		.min(2, "First name must be at least 2 characters")
		.required("First name is required"),
	lastName: Yup.string()
		.matches(/^[A-Za-z]+$/, "Last name must contain only letters")
		.min(2, "Last name must be at least 2 characters")
		.required("Last name is required"),
	email: Yup.string()
		.trim("Email cannot have spaces")
		.email("Invalid email address")
		.required("Email is required")
		.matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Please enter a valid email format (example@domain.com)"),
	password: Yup.string()
		.min(8, "Password must be at least 8 characters")
		.matches(/[A-Z]/, "Password must contain at least one capital letter")
		.matches(/[0-9]/, "Password must contain at least one number")
		.required("Password is required"),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref("password")], "Passwords must match")
		.required("Confirm password is required"),
	agree: Yup.boolean().oneOf([true], "You must agree to the Terms and Privacy Policy"),
});

export default function SignupPage() {
	const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
	const isTurnstileConfigured = isTurnstileConfigurationSafe(turnstileSiteKey);
	const tErrors = useTranslations("errors");
	const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [emailApiError, setEmailApiError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const lastCheckedEmail = useRef<string | null>(null);
	const router = useRouter();
	const [tsSize, setTsSize] = useState<"normal" | "compact" | "flexible">("flexible");

	useEffect(() => {
		const updateSize = () => {
			if (window.innerWidth < 390) {
				setTsSize("compact");
			} else {
				setTsSize("flexible");
			}
		};

		updateSize();
		window.addEventListener("resize", updateSize);

		return () => window.removeEventListener("resize", updateSize);
	}, []);

	const formik = useFormik<SignupProps>({
		initialValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			confirmPassword: "",
			agree: false,
		},
		validationSchema,
		onSubmit: async (values, { setStatus, resetForm }) => {
			setIsLoading(true);
			setStatus({});

			if (!turnstileToken) {
				toast.error("Please complete the security check.");
				setIsLoading(false);
				return;
			}

			try {
				const ipAddress = await getIpAddress();
				const response: RegisterResponseType = await apiClient.Account.registerNewUserAsync(
					{
						email: values.email,
						password: values.password,
						firstName: values.firstName,
						lastName: values.lastName,
						userAgent: navigator.userAgent,
						ipAddress,
					},
					turnstileToken
				);

				if (response?.success) {
					toast.success("Your account has been created successfully!");
					router.push(`/confirm-email/${values.email}`);
					resetForm();
				} else {
					const errorMessage = response?.error || "Registration failed. Please try again later.";
					toast.error(errorMessage);
					setStatus({ apiError: errorMessage });
				}
			} catch (error) {
				const apiErr = error as ApiError;
				const parsed = parseApiError(apiErr);
				if (apiErr.response?.status === 409) {
					// A 409 here means "that email is taken", and the backend's own wording is
					// more useful than anything generic — `parseApiError` already vets 4xx text
					// before passing it through, so `detail` is safe to show when present.
					setEmailApiError(parsed.detail ?? tErrors("emailTaken"));
				} else {
					const errorMessage = apiErrorMessage(parsed, tErrors);
					toast.error(errorMessage);
					setStatus({ apiError: errorMessage });
				}
			} finally {
				setIsLoading(false);
			}
		},
		
	});

	return (
		<>
			<AuthCard>
				<div className="pt-12 pb-6 px-6 max-[425px]:px-6 max-[425px]:pt-6 max-sm:pb-1.5">
					<div className="mx-auto text-center max-sm:flex flex-col">
						<p className="text-foreground mb-2">
							<span className="font-bold text-2xl max-[390px]:hidden">Create an account</span>
							<span className="font-bold text-2xl hidden max-[390px]:inline">Welcome! 👋</span>
						</p>
						<p className="text-base text-muted-foreground mb-4">
							<span className="max-[390px]:hidden">Welcome!👋 Sign up to get started</span>
							<span className="hidden max-[390px]:inline">Sign up to get started</span>
						</p>
						<div className="border border-primary-light mx-[34]"></div>
						<p className="mt-4 mb-3 text-base font-normal leading-5 text-primary max-[390px]:flex flex-col justify-center">
							Already have an account?{" "}
							<Link href="/login" className="font-bold text-gradient-from underline">
								Sign in
							</Link>
						</p>
					</div>

					<form onSubmit={formik.handleSubmit} noValidate>
						<div className="flex max-sm:flex-col">
							<div className="flex-1 max-sm:w-full mr-4 max-sm:mr-0">
								<AuthInput
									label="First name"
									type="text"
									name="firstName"
									placeholder="Enter first name..."
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.firstName}
									error={formik.touched.firstName ? formik.errors.firstName : undefined}
									aria-label="First name"
								/>
							</div>
							<div className="flex-1 max-sm:w-full">
							<AuthInput
								label="Last name"
								type="text"
								name="lastName"
								placeholder="Enter last name..."
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.lastName}
								error={formik.touched.lastName ? formik.errors.lastName : undefined}
								aria-label="Last name"
							/>
							</div>
						</div>

						<AuthInput
							label="Email"
							type="email"
							name="email"
							placeholder="Enter email..."
							onChange={(e) => {
								formik.handleChange(e);
								setEmailApiError(null);
							}}
							onBlur={async (e) => {
								formik.handleBlur(e);
								const currentEmail = formik.values.email.trim();
								const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
								if (!emailPattern.test(currentEmail)) return;
								if (lastCheckedEmail.current === currentEmail) return;
								lastCheckedEmail.current = currentEmail;
								const { success, result, message } = await apiClient.Account.emailInUseAsync(currentEmail);
								if (success) {
									if (result === true) {
										setEmailApiError("Email already exists");
										formik.setFieldError("email", "");
									}
								} else {
									setEmailApiError(message || "Error checking email");
								}
							}}
							value={formik.values.email}
							error={emailApiError ?? (formik.touched.email ? formik.errors.email : undefined)}
							placeholderIcon="/icons/email.svg"
							altText="email icon"
							aria-label="Email"
						/>

					<AuthInput
						label="Password"
						type={showPassword ? "text" : "password"}
						name="password"
						placeholder="Enter password..."
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.password}
						error={formik.touched.password ? formik.errors.password : undefined}
						placeholderIcon="/icons/password.svg"
						altText="password icon"
						aria-label="Password"
						rightElement={
							<button
								type="button"
								tabIndex={-1}
								className="text-muted-foreground hover:text-foreground cursor-pointer"
								onMouseDown={() => setShowPassword((p) => !p)}
								aria-label={showPassword ? "Hide password" : "Show password"}
							>
								{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						}
					/>
						<p className="text-xs text-start font-normal mb-2 mt-2 text-muted-foreground">
							*Minimum 8 characters, including a capital letter and a number
						</p>

					<AuthInput
						label="Re-type password"
						type={showConfirmPassword ? "text" : "password"}
						name="confirmPassword"
						placeholder="Confirm password..."
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.confirmPassword}
						error={formik.touched.confirmPassword ? formik.errors.confirmPassword : undefined}
						placeholderIcon="/icons/password.svg"
						altText="password icon"
						aria-label="Confirm password"
						rightElement={
							<button
								type="button"
								tabIndex={-1}
								className="text-muted-foreground hover:text-foreground cursor-pointer"
								onMouseDown={() => setShowConfirmPassword((p) => !p)}
								aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
							>
								{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						}
					/>

						<div className=" mt-4 mb-2">
							<AuthCheckbox
								name="agree"
								label={
									<>
										I agree{" "}
										<Link href="/terms" className="text-primary">
											Terms of Service
										</Link>{" "}
										and{" "}
										<Link href="/privacy-policy" className="text-primary">
											Privacy Policy
										</Link>
									</>
								}
								checked={formik.values.agree}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								error={formik.errors.agree}
								touched={formik.touched.agree}
							/>
						</div>

						<div className="mt-4 mb-4 flex justify-center">
							{isTurnstileConfigured ? <Turnstile
								siteKey={turnstileSiteKey!}
								options={{ size: tsSize }}
								onSuccess={(token) => {
									setTurnstileToken(token);
								}}
								onError={() => {
									toast.error("Turnstile verification failed, please try again.");
									setTurnstileToken(null);
								}}
								onExpire={() => {
									toast.error("Security check expired. Please verify again.");
									setTurnstileToken(null);
								}}
							/> : (
								<p role="alert" className="text-sm text-destructive">
									Security verification is not configured. Please contact support.
								</p>
							)}
						</div>

						{formik.status?.apiError && (
							<div
								role="alert"
								className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mt-4 text-sm"
								aria-live="polite"
							>
								{formik.status.apiError}
							</div>
						)}

						<Button
							type="submit"
							size={"default"}
							label={isLoading ? "Signing up..." : "Create account"}
							className="w-full h-13 bg-primary hover:bg-primary/90 text-base"
							loading={isLoading}
						/>
					</form>
				</div>
			</AuthCard>
		</>
	);
}
