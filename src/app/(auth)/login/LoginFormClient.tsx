"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { getDeviceId } from "@/utils/deviceId.util";
import {setCookie} from "@/utils/cookie.util";
import {COOKIE_NAMES} from "@/constants/globals";
import {
	AuthCard,
	AuthCheckbox,
	AuthInput,
	SocialAuthButton,
} from "@/components/authentication";
import { apiClient } from "@/services/apiClient.service";
import { getIpAddress } from "@/utils/ipAddress.util";
import HorizontalDivider from "@/components/dividers/HorizontalDivider";
import { Button } from "@/components/ui/button";
const deviceId = getDeviceId();
const loginSchema = z.object({
	email: z
		.string()
		.trim()
		.min(1, "Email is required")
		.email("Invalid email address"),

	password: z
		.string()
		.min(1, "Password is required"),

	rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginApiResponse = {
	success: boolean;
	message?: string;
};

function LoginForm() {
	const [isLoginLoading, setIsLoginLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [isFacebookLoading, setIsFacebookLoading] = useState(false);
	const [apiError, setApiError] = useState<string | null>(null);
	const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
	const turnstileRef = useRef<TurnstileInstance>(null);

	// Adjust challenge size for smaller screens.
	const [tsSize, setTsSize] = useState<
		"normal" | "compact" | "flexible"
	>("flexible");

	const router = useRouter();
	const searchParams = useSearchParams();

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

		return () => {
			window.removeEventListener("resize", updateSize);
		};
	}, []);

	const {
		handleSubmit,
		formState: { errors, touchedFields },
		reset,
		setValue,
		control,
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
			rememberMe: false,
		},
		mode: "onBlur",
	});

	const onSubmit = async (
		values: LoginFormValues
	) => {
		setApiError(null);

		if (!turnstileToken) {
			toast.error(
				"Please complete the security verification."
			);
			return;
		}

		setIsLoginLoading(true);

		try {
			const ipAddress =
				await getIpAddress();

			// Login
			const loginResponse =
				await apiClient.Token.loginAsync({
					email: values.email.trim(),
					password: values.password,
					userAgent:
						navigator.userAgent,
					deviceId,
					ipAddress,
				}, turnstileToken);


			if (!loginResponse?.succeeded) {
				const errorMessage =
					loginResponse?.message ||
					"Login failed. Please check your credentials.";

				setApiError(errorMessage);

				toast.error(errorMessage);

				setTurnstileToken(null);
				turnstileRef.current?.reset();

				return;
			}

			// Store access token
			if (loginResponse.access_token) {
				localStorage.setItem(
					"accessToken",
					loginResponse.access_token
				);
				document.cookie =
					`access_token=${loginResponse.access_token}; Path=/; SameSite=Lax`;
			}

			// Store refresh token
			if (loginResponse.refresh_token) {
				await setCookie(
					COOKIE_NAMES.REFRESH_TOKEN,
					loginResponse.refresh_token,
					{
						secure:
							process.env.NODE_ENV ===
							"production",
						sameSite: "lax",
					}
				);
				document.cookie =
					`refresh_token=${loginResponse.refresh_token}; Path=/; Secure; SameSite=Lax`;
			}

			// Load current user
			const currentUser =
				await apiClient.Token.currentAsync();

			console.log(
				"CURRENT USER",
				currentUser
			);

			if (!currentUser?.id) {
				throw new Error(
					"Unable to load current user."
				);
			}

			// Save user
			localStorage.setItem(
				"currentUser",
				JSON.stringify(currentUser)
			);
			toast.dismiss();
			toast.success(
				"Login successful!",
			);

			reset();

			// Onboarding redirect
			if (
				currentUser.onboardingStep !==
				"Completed"
			) {
				router.replace(
					"/onboarding"
				);
				return;
			}

			router.replace("/discover");
			router.refresh();

		} catch (error) {
			console.error(
				"LOGIN ERROR",
				error
			);

			const errorMessage =
				error instanceof Error
					? error.message
					: "An unexpected error occurred.";

			setApiError(errorMessage);

			//toast.error(errorMessage);

			setTurnstileToken(null);
			turnstileRef.current?.reset();
		} finally {
			setIsLoginLoading(false);

			setValue(
				"password",
				""
			);
		}
	};

	// OAuth starts from server routes to keep provider config centralized.
	const handleGoogleSignIn = () => {
		setIsGoogleLoading(true);
		const redirect =
			searchParams.get("redirect");

		window.location.href = redirect
			? `/api/oauth/google?returnTo=${encodeURIComponent(
				redirect
			)}`
			: "/api/oauth/google";
	};

	const handleFacebookSignIn = () => {
		setIsFacebookLoading(true);
		const redirect =
			searchParams.get("redirect");

		window.location.href = redirect
			? `/api/oauth/facebook?returnTo=${encodeURIComponent(
				redirect
			)}`
			: "/api/oauth/facebook";
	};

	return (
		<AuthCard width="max-w-[500px]">
			<div className="px-6 pt-8 pb-[19px] max-sm:pt-6">
				<div className="mx-auto text-center select-none max-sm:flex flex-col">
					<h1 className="font-bold text-2xl">
						Welcome back! 👋
					</h1>

					<p className="text-base text-[#595959] mb-4">
						Sign in to continue
					</p>

					<div className="border border-[#B9B3F2] mx-[34]"></div>

					<p className="mt-4 text-base leading-5 max-[450px]:flex flex-col justify-center">
						<span className="text-[#6400BF]">
							Don&apos;t have an account?
						</span>

						<Link
							href="/signup"
							className="font-bold text-[#0F13B9] underline"
						>
							Create free account
						</Link>
					</p>
				</div>

				<form
					onSubmit={handleSubmit(onSubmit)}
					noValidate
					className="w-full"
				>
					<Controller
						name="email"
						control={control}
						render={({ field }) => (
							<AuthInput
								label="Email"
								type="email"
								placeholder="Enter email..."
								name={field.name}
								value={field.value}
								onChange={field.onChange}
								onBlur={field.onBlur}
								error={
									touchedFields.email
										? errors.email?.message
										: undefined
								}
								placeholderIcon="/icons/email.svg"
							/>
						)}
					/>

					<Controller
						name="password"
						control={control}
						render={({ field }) => (
							<AuthInput
								label="Password"
								type="password"
								placeholder="Enter password..."
								name={field.name}
								value={field.value}
								onChange={field.onChange}
								onBlur={field.onBlur}
								error={
									touchedFields.password
										? errors.password?.message
										: undefined
								}
								placeholderIcon="/icons/password.svg"
							/>
						)}
					/>

					<div className="mt-4 mb-4 flex justify-center">
						<Turnstile
							ref={turnstileRef}
							siteKey={
								process.env
									.NEXT_PUBLIC_TURNSTILE_SITE_KEY!
							}
							options={{
								size: tsSize,
							}}
							onSuccess={(token) => {
								setTurnstileToken(token);
							}}
							onError={() => {
								toast.error(
									"Security verification failed. Please try again."
								);
								setTurnstileToken(null);
							}}
							onExpire={() => {
								toast.error(
									"Security verification expired. Please verify again."
								);
								setTurnstileToken(null);
							}}
						/>
					</div>

					{apiError && (
						<div
							role="alert"
							aria-live="polite"
							className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mt-4 text-sm"
						>
							{apiError}
						</div>
					)}

					<div className="flex items-center place-content-between mt-4 max-[360px]:flex-col max-[360px]:items-start">
						<Controller
							name="rememberMe"
							control={control}
							render={({ field }) => (
								<AuthCheckbox
									label="Remember me"
									name={field.name}
									checked={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									error={errors.rememberMe?.message}
									touched={
										touchedFields.rememberMe
									}
									labelStyle="text-sm"
								/>
							)}
						/>

						<Link
							href="/forgot-password"
							className="text-sm font-semibold underline text-[#512FB6] hover:text-[#6400BF] transition-colors"
						>
							Lost your password?
						</Link>
					</div>

					<Button
						type="submit"
						size="default"
						label={
							isLoginLoading
								? "Signing in..."
								: "Sign in"
						}
						className="w-full h-13 bg-[#512FB6] my-6 text-base"
						loading={isLoginLoading}
						disabled={!turnstileToken}
					/>
				</form>

				<div className="relative mb-6">
					<HorizontalDivider
						text="OR"
						width="w-full"
						className="mb-4"
					/>
				</div>

				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
					<SocialAuthButton
						type="button"
						label={
							isGoogleLoading
								? "Connecting..."
								: "Sign in with Google"
						}
						iconSrc="/icons/google.svg"
						altText="Google icon"
						width={20}
						height={20}
						loading={isGoogleLoading}
						onClick={handleGoogleSignIn}
					/>

					<SocialAuthButton
						type="button"
						label={
							isFacebookLoading
								? "Connecting..."
								: "Sign in with Facebook"
						}
						iconSrc="/icons/facebook.svg"
						altText="Facebook icon"
						width={20}
						height={20}
						loading={isFacebookLoading}
						onClick={handleFacebookSignIn}
					/>
				</div>
			</div>
		</AuthCard>
	);
}

function LoginFormWithSuspense() {
	return (
		<Suspense
			fallback={
				<AuthCard width="max-w-[500px]">
					<div className="px-6 pt-8 pb-[19px] max-sm:pt-6">
						<div className="mx-auto text-center">
							<h1 className="font-bold text-2xl">
								Welcome back! 👋
							</h1>

							<p className="text-base text-[#595959] mb-4">
								Loading...
							</p>
						</div>
					</div>
				</AuthCard>
			}
		>
			<LoginForm />
		</Suspense>
	);
}

export default function LoginPage() {
	return <LoginFormWithSuspense />;
}