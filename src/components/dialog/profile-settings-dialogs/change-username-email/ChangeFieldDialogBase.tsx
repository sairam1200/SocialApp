"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


type TakenCopy = { title: string; description: string };

type Props = {
  open: boolean;
  onClose: () => void;

  // UI
  title: string;
  description?: string;
  label: React.ReactNode;
  placeholder?: string;

  // values
  initialValue?: string;
  normalize?: (v: string) => string;

  // buttons
  cancelLabel?: string;
  submitLabel: string;
  submittingLabel?: string;

  // logic: return string or marker string
  validate: (value: string, initialValue?: string) => string | null;

  /**
   * Return true if available, false if taken/unavailable, null if "skip/unknown"
   */
  checkAvailability?: (value: string) => Promise<boolean | null>;

  /**
   * Return true for success, false for known failure, throw for generic error
   */
  onSubmit: (value: string) => Promise<boolean>;

  takenCopy?: TakenCopy;
  takenMarker?: string;
  boxedErrors?: Record<string, { title: string; description?: string; icon?: React.ReactNode }>;
  closeOnSuccess?: boolean; // default true
  onSuccess?: (value: string) => void;
};

export const DEFAULT_TAKEN_MARKER = "__TAKEN__";

export default function ChangeFieldDialogBase({
  open,
  onClose,

  title,
  description,
  label,
  placeholder,

  initialValue,
  normalize = (v) => v.trim(),

  cancelLabel = "Cancel",
  submitLabel,
  submittingLabel,

  validate,
  checkAvailability,
  onSubmit,

  takenMarker = DEFAULT_TAKEN_MARKER,
  boxedErrors = {},

  closeOnSuccess = true,
  onSuccess,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  // can be: normal text error OR marker string (e.g. "__TAKEN__")
  const [fieldError, setFieldError] = useState<string>("");

  // cancel stale async checks
  const availabilityReqId = useRef(0);

  useEffect(() => {
    if (!open) return;

    setValue("");
    setTouched(false);
    setLoading(false);
    setFieldError("");
    availabilityReqId.current += 1;

    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const baseValidationError = useMemo(
    () => validate(value, initialValue),
    [value, initialValue, validate]
  );

  const shownErrorText = touched ? (baseValidationError || fieldError) : fieldError;

  const boxed = shownErrorText ? boxedErrors[shownErrorText] : undefined;

  const inputError = shownErrorText
    ? boxed
      ? boxed
      : shownErrorText
    : false;

  const inputErrorVariant: "text" | "boxed" = boxed ? "boxed" : "text";

  const isBlockedByMarker = shownErrorText === takenMarker || Boolean(boxed);

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (baseValidationError) return false;

    const v = normalize(value);
    if (!v) return false;

    // block if current error is marker/boxed
    if (isBlockedByMarker) return false;

    return true;
  }, [loading, baseValidationError, value, normalize, isBlockedByMarker]);

  async function runAvailabilityCheck(explicitValue?: string) {
    if (!checkAvailability) return null;

    const v = normalize(explicitValue ?? value);

    // don't call API if local validation fails (including boxed markers like "__INVALID__")
    if (validate(v, initialValue)) return null;
    if (!v) return null;

    const reqId = ++availabilityReqId.current;
    const res = await checkAvailability(v);

    if (reqId !== availabilityReqId.current) return null;

    if (res === false) setFieldError(takenMarker);
    if (res === true && fieldError === takenMarker) setFieldError("");

    return res;
  }

  async function handleSubmit() {
    setTouched(true);

    const err = validate(value, initialValue);
    if (err) {
      setFieldError(err);
      return;
    }

    // if already blocked by marker/boxed — do nothing
    if (fieldError === takenMarker) return;

    const v = normalize(value);

    if (checkAvailability) {
      const available = await runAvailabilityCheck(v);
      if (available === false) return;
    }

    try {
      setLoading(true);

      const ok = await onSubmit(v);

      if (!ok) {
        setFieldError(takenMarker);
        return;
      }

      onSuccess?.(v);
      if (closeOnSuccess) onClose();
    } catch {
      setFieldError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DialogContainer
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      maxWidthClass="max-w-2xl"
      footer={
        <div className="flex justify-end gap-4">
          <Button type="button" label={cancelLabel} variant="secondary" onClick={onClose} disabled={loading} />
          <Button
            type="button"
            label={loading ? (submittingLabel ?? submitLabel) : submitLabel}
            onClick={handleSubmit}
            disabled={!canSubmit}
          />
        </div>
      }
    >
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setFieldError("");
          availabilityReqId.current += 1;
        }}
        onBlur={() => {
          setTouched(true);
          void runAvailabilityCheck();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") void handleSubmit();
        }}
        errorVariant={inputErrorVariant}
        error={inputError}
      />
    </DialogContainer>
  );
}