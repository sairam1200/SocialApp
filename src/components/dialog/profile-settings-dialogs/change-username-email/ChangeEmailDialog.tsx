"use client";

import { useEffect, useState } from "react";
import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";
import ChangeFieldDialogBase, { DEFAULT_TAKEN_MARKER } from "@/components/dialog/profile-settings-dialogs/change-username-email/ChangeFieldDialogBase";
import { apiClient } from "@/services/apiClient.service";
import type { BoxedError } from "@/components/ui/input";
import { toast } from "react-hot-toast";
const IN_USE: BoxedError = {
  title: "The email you entered is already in use",
  description: "Please choose another email address.",
};

const INVALID: BoxedError = {
  title: "The email you entered is not valid",
  description: "Please enter another email.",
};

const INVALID_MARKER = "__INVALID__";

type EmailValidationCode = "REQUIRED" | "SAME" | "INVALID" | null;

function validateEmailCode(value: string, initialEmail?: string): EmailValidationCode {
  const v = value.trim();
  const old = (initialEmail ?? "").trim();

  if (!v) return "REQUIRED";
  if (v === old) return "SAME";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "INVALID";

  return null;
}

type EmailInUseResponse =
  | boolean
  | { result: boolean; success?: boolean; message?: string };

function extractInUse(resp: EmailInUseResponse): boolean | null {
  if (typeof resp === "boolean") return resp;
  if (resp && typeof resp === "object" && "result" in resp && typeof resp.result === "boolean") return resp.result;
  return null;
}

export default function ChangeEmailDialog(props: {
  open: boolean;
  onClose: () => void;
  initialEmail?: string;
  onSuccess?: (email: string) => void;
}) {
  const { open, onClose, initialEmail, onSuccess } = props;

  const [step, setStep] = useState<"edit" | "sent">("edit");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep("edit");
    setEmail("");
  }, [open]);

  if (step === "sent") {
    return (
      <DialogContainer
        open={open}
        onClose={onClose}
        title="Verify your new email"
        description={`We sent a verification link to ${email}. Click the link in your inbox to confirm the change.`}
        maxWidthClass="max-w-2xl"
        footer={
          <div className="flex justify-end gap-4">
            <Button type="button" label="Done" onClick={onClose} />
          </div>
        }
      >
        <div className="text-sm text-zinc-700">If you don’t see the email, check Spam/Junk.</div>
      </DialogContainer>
    );
  }

  return (
    <ChangeFieldDialogBase
      open={open}
      onClose={onClose}
      title="Change Email"
      description="When changing your email, you will be logged out of all the devices you are currently logged in."
      label={
        <>
          New Email <span className="text-[#BC0E01]">*</span>
        </>
      }
      placeholder="Enter new email"
      initialValue={initialEmail}
      submitLabel="Send Verification Link"
      submittingLabel="Sending..."
      validate={(value, init) => {
        const code = validateEmailCode(value, init);
        if (code === "REQUIRED") return "New Email is required.";
        if (code === "SAME") return "New email must be different from the current one.";
        if (code === "INVALID") return INVALID_MARKER;
        return null;
      }}
      takenMarker={DEFAULT_TAKEN_MARKER}
      boxedErrors={{
        [DEFAULT_TAKEN_MARKER]: IN_USE,
        [INVALID_MARKER]: INVALID,
      }}
      checkAvailability={async (v) => {
        // POST /account/email/in-use => true if in use
        const resp = (await apiClient.Account.emailInUseAsync(v)) as EmailInUseResponse;
        const inUse = extractInUse(resp);

        if (inUse === null) return null; // unknown -> do not block
        return !inUse; // available if NOT in use
      }}
      closeOnSuccess={false}
      onSuccess={(v) => {
        setEmail(v);
        setStep("sent");
        onSuccess?.(v);
      }}
      onSubmit={async (v) => {
        try {
          await apiClient.User.updateEmail(v);
          return true;
        } catch (error: unknown) {
          const err = error as {
            response?: { data?: { title?: string } };
            message?: string;
          };

          toast.error(
            err.response?.data?.title ??
            err.message ??
            "Failed to update email"
          );

          return false;
        }
      }}
    />
  );
}