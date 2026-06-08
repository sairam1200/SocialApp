"use client";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/services/apiClient.service";
import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { ForgotPasswordRequestType, VerifyCodeRequestType, VerifyCodeResponseType } from "@/types/auth/forgotPassword.type";
import { getIpAddress } from "@/utils/ipAddress.util";
import { getDeviceId } from "@/utils/deviceId.util";
export const dynamic = "force-dynamic";
const OTP_DURATION = 900;
const OTP_EXPIRY_KEY = "otpExpiry";

export default function CodeSentPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [hideTimer, setHideTimer] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [apiErrored, setApiErrored] = useState(false);
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (typeof window === "undefined") return OTP_DURATION;
    const storedExpiry = sessionStorage.getItem(OTP_EXPIRY_KEY);
    if (!storedExpiry) return OTP_DURATION;
    const remaining = Math.floor((Number(storedExpiry) - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  });

  // protect route
  useEffect(() => {
    if (!email) {
      router.replace("/forgot-password");
    }
  }, [email, router]);

  // Intialize OTP expiry on first load
  useEffect(() => {
    const storedExpiry = sessionStorage.getItem(OTP_EXPIRY_KEY);
    if (!storedExpiry) {
      const expiryTime = Date.now() + OTP_DURATION * 1000;
      sessionStorage.setItem(OTP_EXPIRY_KEY, expiryTime.toString());
      setSecondsLeft(OTP_DURATION);
    }
  }, []);

  // cross-tab sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === OTP_EXPIRY_KEY && e.newValue) {
        const remaining = Math.floor((Number(e.newValue) - Date.now()) / 1000);
        setSecondsLeft(remaining > 0 ? remaining : 0);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Form state with formik
  const formik = useFormik<{ code: string[] }>({
    initialValues: { code: ["", "", "", "", "", ""] },
    validateOnMount: true,
    validateOnChange: true,
    validate: (values) => {
      const errors: { code?: string } = {};
      if (!values.code || values.code.length !== 6 || values.code.some((d) => d.trim() === "")) {
        errors.code = "Please enter the 6-digit verification code";
      }
      return errors;
    },
    onSubmit: async (values, { setStatus, resetForm, setFieldError, setFieldTouched }) => {
      setIsLoading(true);

      const verificationCode = values.code.join("");
      const verifyCodePayload: VerifyCodeRequestType = {
        email: email.trim().toLowerCase(),
        code: verificationCode,
        purpose: "resetpassword",
      };
      const result = await apiClient.Account.verifyCodeAsync(verifyCodePayload);
      if (result.success && result.isValid) {
        toast.success("Email verification is successful!");
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("code", verificationCode);
        router.push("/reset-password");
        resetForm();

      } else {
        const errorMessage = result.error ?? "Invalid verification code. Try again or request a new one.";
        toast.error(errorMessage);
        setFieldError("code", errorMessage);
        setFieldTouched("code", true);
        setApiErrored(true);
        setStatus({ apiError: errorMessage });
      }
    },
  });

  // Input handlers
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const newCode = [...formik.values.code];
    newCode[index] = digit;
    formik.setFieldValue("code", newCode);
    if (digit && index < 5)
      setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
    if (formik.errors.code) formik.setFieldError("code", undefined);
    if (apiErrored) setApiErrored(false);
    if (infoMessage) setInfoMessage(null);
  };

  const handleFocus = (index: number) => {
    const firstEmptyIndex = formik.values.code.findIndex((c) => c.trim() === "");
    if (firstEmptyIndex !== -1 && index > firstEmptyIndex)
      inputRefs.current[firstEmptyIndex]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !formik.values.code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("Text").trim();
    if (!/^\d{6}$/.test(paste)) return; // only accept 6 digits
    formik.setFieldValue("code", paste.split(""));
    if (infoMessage) setInfoMessage(null);
    inputRefs.current[0]?.blur();
  };

  useEffect(() => {
    if (formik.values.code.every((d) => d !== "")) inputRefs.current[5]?.blur();
  }, [formik.values.code]);

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      const storedExpiry = sessionStorage.getItem(OTP_EXPIRY_KEY);
      if (!storedExpiry) {
        setSecondsLeft(0);
        return;
      }
      const remaining = Math.floor((Number(storedExpiry) - Date.now()) / 1000);
      setSecondsLeft(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) sessionStorage.removeItem(OTP_EXPIRY_KEY);
    if (secondsLeft === 0) setInfoMessage(null);
  }, [secondsLeft]);

  // Enable/Disable verify button
  useEffect(() => {
    const allFilled = formik.values.code.every((d) => d.trim() !== "");
    setIsDisabled(!formik.isValid || !allFilled);
  }, [formik.isValid, formik.values.code]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // RESEND OTP handler
  const handleRequestNewOtp = async () => {
    setInfoMessage(null);
    setIsResendLoading(true);

    const ipAddress = await getIpAddress();
    const deviceId = getDeviceId();
    const forgotPasswordPayload: ForgotPasswordRequestType = {
      email: email.trim().toLowerCase(),
      userAgent: navigator.userAgent,
      ipAddress,
      deviceId,
    };
    try {
      await apiClient.Account.forgotPasswordAsync(forgotPasswordPayload);
      toast.success("Verification email resent successfully!");
      const expiryTime = Date.now() + OTP_DURATION * 1000;
      sessionStorage.setItem(OTP_EXPIRY_KEY, expiryTime.toString());
      setSecondsLeft(OTP_DURATION);

      formik.setFieldValue("code", ["", "", "", "", "", ""]);
      formik.setFieldTouched("code", false);
      formik.setFieldError("code", undefined);
      setApiErrored(false);
      setHideTimer(false);
      setInfoMessage("A new code has been sent. Please check your email.");
      setIsDisabled(true);
      inputRefs.current[0]?.focus();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      toast.error(msg);
      setApiErrored(true);
      console.error(error);
    } finally {
      setIsResendLoading(false);
    }
  };

  // Message button
  const renderMessageButton = () => (
    <Button
      onClick={handleRequestNewOtp}
      type="submit"
      variant="link"
      iconHeight={10}
      iconWidth={10}
      label={isResendLoading ? "Sending OTP..." : "Request a new one."}
      className={`bg-none text-[#241357] text-xs font-bold underline-offset-0 shadow-none py-0 px-0 ${isResendLoading
        ? "no-underline text-[#241357] shadow-none text-xs relative top-1 left-[-9] py-0 px-0 disabled:opacity-70"
        : ""
        }`}
      loading={isResendLoading}
    />
  );

  const showError =
    apiErrored ||
    (Boolean(formik.errors.code) &&
      (Array.isArray(formik.touched.code)
        ? formik.touched.code.some(Boolean)
        : Boolean(formik.touched.code)));
  const hasMessage = secondsLeft === 0 || !!infoMessage || showError;

  return (
    <div className="max-w-[359px] mx-auto py-6 max-md:px-6">
      <h1 className="text-center text-2xl font-bold max-sm:text-xl">Check your email!</h1>
      <div className="text-center text-base text-[#595959] max-md:text-sm">
        <p>We have sent a verification code to your email that you can use to reset your password</p>
        <button
          type="button"
          onClick={() => router.push("/forgot-password")}
          className=" mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#D6CBFF] px-3 py-1 text-sm font-medium text-[#512FB6]"
        >
          <span className="truncate max-w-[220px] hover:underline">
            {email}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="flex justify-center gap-4 mt-8.5 mb-3 max-md:gap-2">
        {formik.values.code.map((digit, i) => (
          <input
            key={i}
            id={`code-input-${i}`}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onFocus={() => handleFocus(i)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`w-[46px] h-[46px] text-center text-xl border rounded-[10px] focus:outline-[#512FB6] ${showError ? "border-red-500" : "border-[#A288FF]"
              } max-md:w-10 max-md:h-10`}
          />
        ))}
      </div>

      <div className={`flex justify-center ${hasMessage ? "py-2" : ""}`}>
        {secondsLeft === 0 ? (
          <p className="text-[#241357] text-xs">
            {isResendLoading ? "" : "Verification code expired. "}{" "}
            {renderMessageButton()}
          </p>
        ) : infoMessage ? (
          <p className="text-[#241357] text-xs font-medium">{infoMessage}</p>
        ) : showError ? (
          <p className="text-[#241357] text-xs">
            {isResendLoading ? "" : "Invalid code. Try again or "}{" "}
            {renderMessageButton()}
          </p>
        ) : (
          <span className="invisible">placeholder</span>
        )}
      </div>

      <div
        className={`text-center mt-3 ${isLoading || isDisabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
      >
        <Button
          onClick={() => {
            if (isLoading || isDisabled) return;
            formik.handleSubmit();
          }}
          type="submit"
          size="default"
          label={isLoading ? "Verifying..." : "Verify"}
          className="w-full h-10 bg-[#512FB6] text-xs font-semibold disabled:text-[#444141] disabled:bg-[#E6E6E6] disabled:shadow-none"
          loading={isLoading}
          disabled={isLoading || isDisabled}
        />
      </div>

      {secondsLeft > 0 && !hideTimer && (
        <div className="text-center mt-4 mb-2 text-xs text-[#241357]">
          {formatTime(secondsLeft)}
        </div>
      )}

      <div className="flex justify-center">
        <p className="text-xs font-semibold text-[#512FB6] py-[11px]">
          Can&apos;t access your email?{" "}
          <Link href={" "} className="underline">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
