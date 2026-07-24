"use client";
import { useState, useEffect, useRef } from "react";
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
import { parseApiError } from "@/utils/api-error.util";
import type { ApiError } from "@/types/error.types";

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
				//console.log("KEY:", process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
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
					if (response.accessToken) {
						localStorage.setItem("accessToken", response.accessToken);
					}
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
				if (apiErr.response?.status === 409) {
					const backendMsg = parseApiError(apiErr) || "This email is already registered.";
					setEmailApiError(backendMsg);
				} else {
					const errorMessage = parseApiError(apiErr);
					toast.error(errorMessage);
					setStatus({ apiError: errorMessage });
				}
			} finally {
				setIsLoading(false);
			}
			//console.log(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
		},
		
	});

	return (
		<>
			<AuthCard>
				<div className="pt-12 pb-6 px-6 max-[425px]:px-6 max-[425px]:pt-6 max-sm:pb-1.5">
					<div className="mx-auto text-center max-sm:flex flex-col">
						<p className="text-[#0D0D0D] mb-2">
							<span className="font-bold text-2xl max-[390px]:hidden">Create an account</span>
							<span className="font-bold text-2xl hidden max-[390px]:inline">Welcome! 👋</span>
						</p>
						<p className="text-base text-[#595959] mb-4">
							<span className="max-[390px]:hidden">Welcome!👋 Sign up to get started</span>
							<span className="hidden max-[390px]:inline">Sign up to get started</span>
						</p>
						<div className="border border-[#B9B3F2] mx-[34]"></div>
						<p className="mt-4 mb-3 text-base font-normal leading-5 text-[#6400BF] max-[390px]:flex flex-col justify-center">
							Already have an account?{" "}
							<Link href="/login" className="font-bold text-[#0F13B9] underline">
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
						rightElement={
							<button
								type="button"
								tabIndex={-1}
								className="text-gray-500 hover:text-gray-700 cursor-pointer"
								onMouseDown={() => setShowPassword((p) => !p)}
							>
								{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						}
					/>
						<p className="text-xs text-start font-normal mb-2 mt-2 text-[#595959]">
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
						rightElement={
							<button
								type="button"
								tabIndex={-1}
								className="text-gray-500 hover:text-gray-700 cursor-pointer"
								onMouseDown={() => setShowConfirmPassword((p) => !p)}
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
										<Link href="/terms" className="text-[#6400BF]">
											Terms of Service
										</Link>{" "}
										and{" "}
										<Link href="/privacy-policy" className="text-[#6400BF]">
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
							<Turnstile
								siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
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
							/>
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
							className="w-full h-13 bg-[#512FB6] text-base "
							loading={isLoading}
						/>
					</form>
				</div>
			</AuthCard>
		</>
	);
}
