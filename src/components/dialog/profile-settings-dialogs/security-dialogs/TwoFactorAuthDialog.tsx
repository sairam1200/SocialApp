"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/services/apiClient.service";
import LockIcon from "@/components/svg/lock-icon.svg";
import SettingsStatusDialog from "@/components/dialog/profile-settings-dialogs/security-dialogs/SettingsStatusDialog";

type Props = {
  open: boolean;
  onClose: () => void;
};

type SetupState = {
  secret: string;
  qrcode?: string;
  message?: string;
};

type ViewState = "setup" | "enabled" | "success" | "disabled_success";

type HttpishError = {
  response?: {
    status?: number;
    data?: unknown;
  };
};

function getStatus(err: unknown): number | null {
  if (!err || typeof err !== "object") return null;
  const e = err as HttpishError;
  return typeof e.response?.status === "number" ? e.response.status : null;
}

function toQrSrc(qrcode: unknown) {
  const v = typeof qrcode === "string" ? qrcode.trim() : "";
  if (!v) return "";
  if (v.startsWith("data:image/")) return v;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `data:image/png;base64,${v}`;
}

function normalizeSetup(resp: unknown): SetupState | null {
  if (!resp || typeof resp !== "object") return null;
  const r = resp as Record<string, unknown>;

  const secret = typeof r.secret === "string" ? r.secret : "";

  const qrcode =
    typeof r.qrcode === "string"
      ? r.qrcode
      : typeof r.qrCode === "string"
        ? r.qrCode
        : typeof r.qr_code === "string"
          ? r.qr_code
          : undefined;

  const message = typeof r.message === "string" ? r.message : undefined;

  if (!secret) return null;
  return { secret, qrcode, message };
}

function formatSecretGroups(secret: string) {
  const s = secret.replace(/\s+/g, "");
  return s.match(/.{1,4}/g)?.join(" - ") ?? secret;
}

export default function TwoFactorAuthDialog({ open, onClose }: Props) {
  const [view, setView] = useState<ViewState>("setup");

  const [loading, setLoading] = useState(false);
  const [setup, setSetup] = useState<SetupState | null>(null);

  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [setupError, setSetupError] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");

  const [copied, setCopied] = useState(false);

  const reqIdRef = useRef(0);

  const loadSetup = useCallback(async () => {
    const reqId = ++reqIdRef.current;

    setLoading(true);
    setSetupError("");
    setOtpError("");
    setSetup(null);
    setOtp("");
    setCopied(false);

    try {
      const result = await apiClient.Account.twoFactorSetupAsync();
      if (reqId !== reqIdRef.current) return;

      const normalized = normalizeSetup(result);
      if (!normalized) {
        setSetupError("2FA setup response is invalid. Please try again later.");
        setView("setup");
        return;
      }

      setSetup(normalized);
      setView("setup");
    } catch (err) {
      if (reqId !== reqIdRef.current) return;
      const status = getStatus(err);
      // after enable: /2fa/setup returns 400 => consider 2FA already enabled
      if (status === 400) {
        setView("enabled");
        setSetupError("");
        return;
      }

      setSetupError("Failed to load 2FA setup. Please try again.");
      setView("setup");
    } finally {
      if (reqId !== reqIdRef.current) return;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setView("setup");
    void loadSetup();
  }, [open, loadSetup]);

  const qrSrc = useMemo(() => (setup ? toQrSrc(setup.qrcode) : ""), [setup]);
  const secretPretty = useMemo(() => (setup ? formatSecretGroups(setup.secret) : ""), [setup]);

  const canSubmit = useMemo(() => {
    if (!setup) return false;
    if (loading || submitting) return false;
    return /^\d{6}$/.test(otp);
  }, [setup, loading, submitting, otp]);

  async function handleCopySecret() {
    if (!setup?.secret) return;
    try {
      await navigator.clipboard.writeText(setup.secret);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  async function handleEnable() {
    if (!setup) return;

    if (!/^\d{6}$/.test(otp)) {
      setOtpError("Enter a valid 6-digit code.");
      return;
    }

    try {
      setOtpError("");
      setSubmitting(true);

      await apiClient.Account.twoFactorEnableAsync({
        secret: setup.secret,
        userOTP: otp,
      });

      setView("success");
    } catch {
      setOtpError("Invalid code or failed to enable 2FA. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDisable() {
    try {
      setSubmitting(true);
      setSetupError("");
      setOtpError("");

      await apiClient.Account.twoFactorDisableAsync();

      // success dialog “disabled”
      setView("disabled_success");
    } catch {
      setSetupError("Failed to disable 2FA. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // success dialog (ENABLED)
  if (view === "success") {
    return (
      <SettingsStatusDialog
        open={open}
        onClose={onClose}
        title="Setup successful"
        text="Two-factor authentication is now active on your account."
        primary={{ label: "Done", onClick: onClose }}
      />
    );
  }

  // success dialog (DISABLED)
  if (view === "disabled_success") {
    return (
      <SettingsStatusDialog
        open={open}
        onClose={onClose}
        title="Disabled successfully"
        text="Two-factor authentication has been disabled on your account."
        primary={{ label: "Done", onClick: onClose }}
      />
    );
  }


  // enabled screen + disable
  if (view === "enabled") {
    return (
      <SettingsStatusDialog
        open={open}
        onClose={onClose}
        title="Two-factor Authentication"
        text="Two-factor authentication is active on your account. If you disable 2FA, your account will be less secure."
        secondary={{ label: "Cancel", onClick: onClose, variant: "secondary", disabled: submitting }}
        primary={{
          label: "Disable",
          loadingLabel: "Disabling...",
          onClick: handleDisable,
          loading: submitting,
        }}
      />
    );
  }


  // setup screen
  return (
    <DialogContainer
      open={open}
      onClose={onClose}
      title="Two-factor Authentication"
      description="Use your two-factor authentication to make your account more secure"
      maxWidthClass="max-w-2xl"
      footer={
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            label="Cancel"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          />
          <Button
            type="button"
            label={submitting ? "Enabling..." : "Done"}
            onClick={handleEnable}
            disabled={!canSubmit}
          />
        </div>
      }
    >
      <div className="space-y-4">
        {setupError ? <div className="text-sm text-destructive">{setupError}</div> : null}

        <div className="rounded-lg border border-[#D6BAFF] p-4">
          <div className="flex gap-4">
            <div className="h-20 w-20 shrink-0 rounded-md border border-[#E9D5FF] bg-white flex items-center justify-center overflow-hidden">
              {loading ? (
                <div className="text-xs text-gray-500">Loading…</div>
              ) : qrSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrSrc} alt="2FA QR code" className="h-full w-full object-contain" />
              ) : (
                <div className="text-xs text-gray-500">No QR</div>
              )}
            </div>

            <div className="flex-1">
              <div className="text-sm font-medium break-words">{setup ? secretPretty : "—"}</div>

              <div className="mt-3">
                <Button
                  type="button"
                  label={copied ? "Copied" : "Copy code"}
                  variant="secondary"
                  onClick={handleCopySecret}
                  disabled={!setup?.secret || loading}
                />
              </div>
            </div>
          </div>

          <ol className="mt-4 list-decimal pl-5 text-sm text-[#333333] space-y-1">
            <li>Get an authenticator app on your phone or computer.</li>
            <li>Scan the QR code or copy the key into your preferred authenticator app.</li>
            <li>Enter the 6-digit code generated by the authenticator app.</li>
          </ol>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-[12px] text-gray-700">
            <LockIcon className="h-4 w-4" aria-hidden="true" />
          </div>

          <Input
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/[^\d]/g, "").slice(0, 6));
              setOtpError("");
            }}
            placeholder="Enter OTP"
            className="pl-10"
            errorVariant="text"
            error={otpError || false}
            inputMode="numeric"
            autoComplete="one-time-code"
          />
        </div>
      </div>
    </DialogContainer>
  );
}
