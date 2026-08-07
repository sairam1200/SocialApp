"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { AuthInput } from "@/components/authentication";
import { Button } from "@/components/ui/button";
import { ForgotPasswordRequestType } from "@/types/auth/forgotPassword.type";
import { getIpAddress } from "@/utils/ipAddress.util";
import { getDeviceId } from "@/utils/deviceId.util";
import { apiClient } from "@/services/apiClient.service";

const validationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Invalid email address")
    .required("Email is required")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Invalid email format"),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");

  const formik = useFormik<{ email: string }>({
    enableReinitialize: true,
    initialValues: {
      email: "",
    },
    validationSchema,
    onSubmit: async (values, { setStatus, resetForm }) => {
      setIsLoading(true);
      setStatus({});

      const ipAddress = await getIpAddress();
      const deviceId = getDeviceId();
      const forgotPasswordPayload: ForgotPasswordRequestType = {
        email: values.email.trim().toLowerCase(),
        userAgent: navigator.userAgent,
        ipAddress,
        deviceId,
      };

      const result = await apiClient.Account.forgotPasswordAsync(forgotPasswordPayload);
      if (result.success) {
        toast.success(t("verificationCodeSent"));
        router.push(`/forgot-password/code-sent?email=${encodeURIComponent(values.email)}`);
        setIsLoading(false);
        resetForm();
      } else {
        const errorMessage = result.error ?? t("unexpectedError");
        toast.error(errorMessage);
        setStatus({ apiError: errorMessage });
      }
      setIsLoading(false);
    },
  });

  const isButtonDisabled = isLoading;

  return (
    <>
      <div className="py-12 px-32 max-md:px-15 max-sm:pt-6 max-sm:px-6">
        <h1 className="text-center text-2xl font-bold max-sm:text-xl">{t("forgotPasswordTitle")}</h1>
        <div className="text-center text-base text-[#595959] mt-2">
          <p>{t("forgotPasswordHint")}</p>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate className="w-full">
          <div className={`mt-8 ${formik.touched.email && formik.errors.email ? "" : "mb-2"}`}>
            <AuthInput
              label=""
              type="email"
              name="email"
              placeholder={t("enterEmail")}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.email}
              error={formik.touched.email ? formik.errors.email : undefined}
              placeholderIcon="/icons/email.svg"
            />
          </div>

          <div className={`text-center ${isButtonDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
            <Button
              type="submit"
              size="default"
              label={isLoading ? t("sendingOtp") : t("changePassword")}
              className="w-full h-13 bg-[#512FB6] my-6 text-base"
              loading={isLoading}
              disabled={isButtonDisabled}
            />
          </div>
        </form>

        <div className="border border-[#A288FF] mb-4 relative -top-2"></div>

        <div className="flex justify-center py-4">
          <Button
            onClick={() => router.push("/signup")}
            type="button"
            variant="link"
            iconSrc="/icons/arrow-with-line.svg"
            iconAlt="Arrow with line icon"
            iconWidth={16}
            iconHeight={16}
            label={t("goToSignIn")}
            className="bg-none h-0 text-[#512FB6] text-base font-semibold p-0 gap-4"
          />
        </div>
      </div>
    </>
  );
}


