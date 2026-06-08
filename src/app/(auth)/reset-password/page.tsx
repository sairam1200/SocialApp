"use client";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { AuthCard, AuthInput } from "@/components/authentication";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import toast from "react-hot-toast";
import { getIpAddress } from "@/utils/ipAddress.util";
import { getDeviceId } from "@/utils/deviceId.util";
import { apiClient } from "@/services/apiClient.service";
import { ResetPasswordRequestType } from "@/types/auth/reset-password.type";

interface SignupProps {
  password: string;
  confirmPassword: string;
}

const validationSchema = Yup.object({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one capital letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  agree: Yup.boolean().oneOf(
    [true],
    "You must agree to the Terms and Privacy Policy"
  ),
});

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const router = useRouter();

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("email");
    const savedCode = sessionStorage.getItem("code");

    if (!savedEmail || !savedCode) {
      router.replace("/forgot-password");
      return;
    }

    setEmail(savedEmail);
    setCode(savedCode);
  }, [router]);

  const formik = useFormik<SignupProps>({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values, { setStatus, resetForm }) => {
      setIsLoading(true);
      setStatus({});

      const ipAddress = await getIpAddress();
      const deviceId = getDeviceId();
      const resetPasswordPayload: ResetPasswordRequestType = {
        code,
        email,
        userAgent: navigator.userAgent,
        ipAddress,
        deviceId,
        newPassword: values.password,
      };

      try {
        await apiClient.Account.resetPasswordAsync(resetPasswordPayload);

        sessionStorage.removeItem("email");
        sessionStorage.removeItem("code");

        toast.success("Your password has been reset successfully!");
        router.push(`/reset-password/new-password-confirmation`);
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

  return (
    <AuthCard width="max-w-[559px]">
      <div className="p-12 max-[425px]:px-6 max-[425px]:pt-6 max-sm:pb-1.5">
        <h1 className="text-center text-2xl font-bold text-[#0D0D0D] max-sm:text-xl">Reset password</h1>
        <div className="text-center text-base text-[#595959] my-2 ">
          <p>Fill in following fields to continue</p>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate>
          <AuthInput
            label="Enter new password"
            type="password"
            name="password"
            placeholder="Enter password..."
            required
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            error={formik.touched.password ? formik.errors.password : undefined}
            placeholderIcon="/icons/password.svg"
            altText="password icon"
            labelClassName="text-[#1F222E] text-base font-bold mb-2"
          />
          <p className="text-xs text-start font-normal mb-2 mt-2 text-[#595959]">
            *Minimum 8 characters, including a capital letter and a number
          </p>

          <AuthInput
            label="Confirm new password"
            type="password"
            name="confirmPassword"
            placeholder="Confirm password..."
            required
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
            error={
              formik.touched.confirmPassword
                ? formik.errors.confirmPassword
                : undefined
            }
            placeholderIcon="/icons/password.svg"
            altText="password icon"
            labelClassName="text-[#1F222E] text-base font-bold mb-2"
          />

          {formik.status?.apiError && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mt-4 text-sm"
              aria-live="polite"
            >
              {formik.status.apiError}
            </div>
          )}

          <div className="bg-[#F0EBFF] rounded-lg p-6 my-6 text-left shadow-[0_2px_3px_0_rgba(97,54,255,0.25)]">
            <h3 className="text-base font-bold text-[#0D0D0D] mb-4">Your password must include</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Image src="/icons/check-fill.svg" alt="check" width={18} height={18} />
                <span className="text-base text-[#595959]">At least 8 characters</span>
              </div>
              <div className="flex items-center gap-3">
                <Image src="/icons/check-fill.svg" alt="check" width={18} height={18} />
                <span className="text-base text-[#595959]">At least one letter</span>
              </div>
              <div className="flex items-center gap-3">
                <Image src="/icons/check-fill.svg" alt="check" width={18} height={18} />
                <span className="text-base text-[#595959]">At least one number</span>
              </div>
              <div className="flex items-center gap-3">
                <Image src="/icons/check-fill.svg" alt="check" width={18} height={18} />
                <span className="text-base text-[#595959]">At least one special character (e.g., !, ?, #)</span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            size={"default"}
            label={isLoading ? "Processing..." : "Reset password"}
            className="w-full h-13 bg-[#512FB6] text-base"
            loading={isLoading}
          />
        </form>
      </div>
    </AuthCard>
  );
}
