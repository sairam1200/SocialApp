"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { getDeviceId } from "@/utils/deviceId.util";
import { loginAction, verifyTwoFactorAction } from "@/actions/token.actions";
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
import ReactivateAccountDialog from "@/components/authentication/ReactivateAccountDialog";
import { isTurnstileConfigurationSafe } from "@/utils/turnstile.util";
import { LOGIN_SUCCESS_TOAST_DURATION_MS } from "./login-feedback";
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),

  password: z.string().min(1, "Password is required"),

  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const isTurnstileConfigured = isTurnstileConfigurationSafe(turnstileSiteKey);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [reactivationCredentials, setReactivationCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isTwoFactorRequired, setIsTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const turnstileRef = useRef<TurnstileInstance>(null);
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");

  // Adjust challenge size for smaller screens.
  const [tsSize, setTsSize] = useState<"normal" | "compact" | "flexible">(
    "flexible",
  );

  const router = useRouter();

  const finishLogin = (onboardingCompleted: boolean) => {
    reset();
    if (!onboardingCompleted) {
      router.replace("/onboarding");
    } else {
      router.replace("/discover");
    }
    router.refresh();
    toast.success(t("loginSuccessful"), {
      duration: LOGIN_SUCCESS_TOAST_DURATION_MS,
    });
  };

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

  const onSubmit = async (values: LoginFormValues) => {
    setApiError(null);

    if (!turnstileToken) {
      toast.error(t("pleaseCompleteSecurity"));
      return;
    }

    setIsLoginLoading(true);

    try {
      const ipAddress = await getIpAddress();
      const deviceId = getDeviceId();

      const loginResponse = await loginAction({
        email: values.email.trim(),
        password: values.password,
        userAgent: navigator.userAgent,
        deviceId,
        ipAddress,
        turnstileToken,
      });

      if (loginResponse.isTwoFARequired) {
        setIsTwoFactorRequired(true);
        setTurnstileToken(null);
        turnstileRef.current?.reset();
        return;
      }

      if (!loginResponse?.succeeded) {
        if (loginResponse?.isDeactivated) {
          setReactivationCredentials({
            email: values.email.trim(),
            password: values.password,
          });
          return;
        }

        const errorMessage = t("loginFailed");

        setApiError(errorMessage);

        toast.error(errorMessage);

        setTurnstileToken(null);
        turnstileRef.current?.reset();

        return;
      }

      const onboardingCompleted = loginResponse.onboardingCompleted ?? true;
      finishLogin(onboardingCompleted);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("unexpectedError");

      setApiError(errorMessage);

      //toast.error(errorMessage);

      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setIsLoginLoading(false);

      setValue("password", "");
    }
  };

  const verifyTwoFactor = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(twoFactorCode)) {
      setApiError(t("twoFactorInvalid"));
      return;
    }

    setIsLoginLoading(true);
    setApiError(null);
    try {
      const result = await verifyTwoFactorAction({
        userOTP: twoFactorCode,
        deviceId: getDeviceId(),
        userAgent: navigator.userAgent,
        ipAddress: await getIpAddress(),
      });
      if (!result.succeeded) {
        setApiError(t("twoFactorFailed"));
        return;
      }
      finishLogin(result.onboardingCompleted ?? true);
    } catch {
      setApiError(t("twoFactorFailed"));
    } finally {
      setIsLoginLoading(false);
    }
  };

  const startOAuthFlow = async (platform: "google" | "facebook") => {
    const setLoading =
      platform === "google" ? setIsGoogleLoading : setIsFacebookLoading;
    setLoading(true);

    try {
      const callbackUrl = `${window.location.origin}/oauth-callback/${platform}`;
      const ipAddress = await getIpAddress();
      const deviceId = getDeviceId();

      const response = await apiClient.Token.connectAsync(
        platform,
        deviceId,
        navigator.userAgent,
        ipAddress,
        callbackUrl,
      );

      if (!response?.authorizeURL) {
        toast.error(t("unexpectedError"));
        setLoading(false);
        return;
      }

      window.location.href = response.authorizeURL;
    } catch {
      toast.error(t("loginFailed"));
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => startOAuthFlow("google");
  const handleFacebookSignIn = () => startOAuthFlow("facebook");

  if (isTwoFactorRequired) {
    return (
      <AuthCard width="max-w-[500px]">
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold">{t("twoFactorTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("twoFactorHint")}
          </p>
          <form onSubmit={verifyTwoFactor} className="mt-6 space-y-4">
            <AuthInput
              label={t("twoFactorCode")}
              type="text"
              name="twoFactorCode"
              value={twoFactorCode}
              onChange={(event) =>
                setTwoFactorCode(
                  event.target.value.replace(/\D/g, "").slice(0, 6),
                )
              }
              placeholder={t("twoFactorPlaceholder")}
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label={t("twoFactorCode")}
            />
            {apiError && (
              <p role="alert" className="text-sm text-destructive">
                {apiError}
              </p>
            )}
            <Button
              type="submit"
              label={
                isLoginLoading ? t("twoFactorVerifying") : t("twoFactorVerify")
              }
              loading={isLoginLoading}
              disabled={twoFactorCode.length !== 6}
              className="w-full"
            />
          </form>
        </div>
      </AuthCard>
    );
  }

  return (
    <>
      <AuthCard width="max-w-[500px]">
        <div className="px-6 pt-8 pb-[19px] max-sm:pt-6">
          <div className="mx-auto text-center select-none max-sm:flex flex-col">
            <h1 className="font-bold text-2xl">{t("welcomeBack")}</h1>

            <p className="text-base text-muted-foreground mb-4">
              {t("signInToContinue")}
            </p>

            <div className="border border-primary-light mx-[34]"></div>

            <p className="mt-4 text-base leading-5 max-[450px]:flex flex-col justify-center">
              <span className="text-primary">{t("noAccount")}</span>

              <Link
                href="/signup"
                className="font-bold text-gradient-from underline transition-colors hover:text-primary"
              >
                {t("createFreeAccount")}
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full">
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <AuthInput
                  label={t("email")}
                  type="email"
                  placeholder={t("enterEmail")}
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.email?.message}
                  placeholderIcon="/icons/email.svg"
                  aria-label={t("email")}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <AuthInput
                  label={t("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder={t("enterPassword")}
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.password?.message}
                  placeholderIcon="/icons/password.svg"
                  aria-label={t("password")}
                  rightElement={
                    <button
                      type="button"
                      tabIndex={-1}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                      onMouseDown={() => setShowPassword((p) => !p)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                />
              )}
            />

            <div className="mt-4 mb-4 flex justify-center">
              {isTurnstileConfigured ? (
                <Turnstile
                  ref={turnstileRef}
                  siteKey={turnstileSiteKey!}
                  options={{
                    size: tsSize,
                  }}
                  onSuccess={(token) => {
                    setTurnstileToken(token);
                  }}
                  onError={() => {
                    toast.error(t("securityVerificationFailed"));
                    setTurnstileToken(null);
                  }}
                  onExpire={() => {
                    toast.error(t("securityVerificationExpired"));
                    setTurnstileToken(null);
                  }}
                />
              ) : (
                <p role="alert" className="text-sm text-destructive">
                  Security verification is not configured. Please contact
                  support.
                </p>
              )}
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
                    label={t("rememberMe")}
                    name={field.name}
                    checked={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.rememberMe?.message}
                    touched={touchedFields.rememberMe}
                    labelStyle="text-sm"
                  />
                )}
              />

              <Link
                href="/forgot-password"
                className="text-sm font-semibold underline text-primary hover:text-primary/80 transition-colors"
              >
                {t("lostPassword")}
              </Link>
            </div>

            <Button
              type="submit"
              size="default"
              label={isLoginLoading ? t("signingIn") : t("logIn")}
              className="w-full h-13 bg-primary hover:bg-primary/90 my-6 text-base"
              loading={isLoginLoading}
              disabled={!turnstileToken}
            />
          </form>

          <div className="relative mb-6">
            <HorizontalDivider
              text={tCommon("or")}
              width="w-full"
              className="mb-4"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
            <SocialAuthButton
              type="button"
              label={isGoogleLoading ? t("connecting") : t("signInWithGoogle")}
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
                isFacebookLoading ? t("connecting") : t("signInWithFacebook")
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
      <ReactivateAccountDialog
        open={reactivationCredentials !== null}
        email={reactivationCredentials?.email ?? ""}
        onClose={() => setReactivationCredentials(null)}
        onActivated={() => {
          const credentials = reactivationCredentials;
          setReactivationCredentials(null);
          if (credentials) {
            void onSubmit({
              email: credentials.email,
              password: credentials.password,
              rememberMe: false,
            });
          }
        }}
      />
    </>
  );
}

export default LoginForm;
