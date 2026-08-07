"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/services/apiClient.service";
import { getIpAddress } from "@/utils/ipAddress.util";

type Props = {
  open: boolean;
  email: string;
  onClose: () => void;
  onActivated: () => void;
};

export default function ReactivateAccountDialog({
  open,
  email,
  onClose,
  onActivated,
}: Props) {
  const t = useTranslations("auth.reactivation");
  const [step, setStep] = useState<"prompt" | "code">("prompt");
  const [code, setCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep("prompt");
    setCode("");
    setError(null);
  }, [open, email]);

  const sendCode = async () => {
    setIsSending(true);
    setError(null);
    try {
      await apiClient.Account.sendReactivationVerificationAsync({
        email,
        userAgent: navigator.userAgent,
        ipAddress: await getIpAddress(),
      });
      setStep("code");
    } catch {
      setError(t("sendFailed"));
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError(t("invalidCode"));
      return;
    }

    setIsVerifying(true);
    setError(null);
    try {
      const result = await apiClient.Account.VerifyEmailAsync({ email, code });
      if (!result?.success) {
        setError(t("invalidCode"));
        return;
      }
      onActivated();
    } catch {
      setError(t("verifyFailed"));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <DialogContainer
      open={open}
      onClose={onClose}
      title={t("title")}
      description={t("description")}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            label={t("notNow")}
            variant="secondary"
            onClick={onClose}
          />
          {step === "prompt" ? (
            <Button
              type="button"
              label={isSending ? t("sending") : t("activateNow")}
              onClick={sendCode}
              loading={isSending}
            />
          ) : (
            <Button
              type="button"
              label={isVerifying ? t("verifying") : t("verify")}
              onClick={verifyCode}
              loading={isVerifying}
              disabled={code.length !== 6}
            />
          )}
        </div>
      }
    >
      {step === "prompt" ? (
        <p className="text-sm text-muted-foreground">
          {t("emailHint", { email })}
        </p>
      ) : (
        <div className="space-y-3">
          <label
            htmlFor="reactivation-code"
            className="text-sm font-medium text-foreground"
          >
            {t("codeLabel")}
          </label>
          <input
            id="reactivation-code"
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder={t("codePlaceholder")}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-center text-lg tracking-[0.4em] text-foreground outline-none focus:border-primary"
          />
          <p className="text-xs text-muted-foreground">
            {t("codeHint", { email })}
          </p>
        </div>
      )}
      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </DialogContainer>
  );
}
