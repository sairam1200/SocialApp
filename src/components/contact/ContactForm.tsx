"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Link from "next/link";

import { contactSchema, type ContactFormValues } from "@/lib/contact-schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const TO = "team@gaddr.com";

function buildGmailUrl(name: string, preferredReplyEmail: string, subject: string, message: string) {
  const body = [
    `Hello Gaddr Team,`,
    ``,
    `Name: ${name}`,
    `Preferred Reply Email: ${preferredReplyEmail}`,
    ``,
    `Message:`,
    ``,
    message,
    ``,
    `-----------------------`,
    `Sent from the Gaddr Contact Page`,
  ].join("\n");

  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: TO,
    su: `[Gaddr Contact] ${subject}`,
    body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function buildMailtoUrl(name: string, preferredReplyEmail: string, subject: string, message: string) {
  const body = [
    `Hello Gaddr Team,`,
    ``,
    `Name: ${name}`,
    `Preferred Reply Email: ${preferredReplyEmail}`,
    ``,
    `Message:`,
    ``,
    message,
    ``,
    `-----------------------`,
    `Sent from the Gaddr Contact Page`,
  ].join("\n");

  const params = new URLSearchParams({
    subject: `[Gaddr Contact] ${subject}`,
    body,
  });
  return `mailto:${TO}?${params.toString()}`;
}

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, touchedFields },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      preferredReplyEmail: "",
      subject: "",
      message: "",
      privacyConsent: undefined as unknown as true,
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: ContactFormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const gmailUrl = buildGmailUrl(values.name, values.preferredReplyEmail, values.subject, values.message);
      const mailtoUrl = buildMailtoUrl(values.name, values.preferredReplyEmail, values.subject, values.message);

      const popup = window.open(gmailUrl, "_blank");

      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        window.location.href = mailtoUrl;
      }

      toast.success(
        "Your email draft has been prepared. Please review it and click Send in your email client."
      );
      reset();
    } catch {
      toast.error(
        "Could not open your email client. Please send an email manually to team@gaddr.com."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Input
            label="Name *"
            placeholder="Your name"
            error={
              touchedFields.name ? errors.name?.message : undefined
            }
            {...field}
          />
        )}
      />

      <Controller
        name="preferredReplyEmail"
        control={control}
        render={({ field }) => (
          <Input
            label="Preferred Reply Email *"
            type="email"
            placeholder="your@email.com"
            helperText="We'll use this email to respond to your inquiry. It doesn't have to match the email account you use to send this message."
            error={
              touchedFields.preferredReplyEmail ? errors.preferredReplyEmail?.message : undefined
            }
            {...field}
          />
        )}
      />

      <Controller
        name="subject"
        control={control}
        render={({ field }) => (
          <Input
            label="Subject *"
            placeholder="What is this about?"
            error={
              touchedFields.subject ? errors.subject?.message : undefined
            }
            {...field}
          />
        )}
      />

      <Controller
        name="message"
        control={control}
        render={({ field }) => (
          <Textarea
            label="Message *"
            placeholder="Tell us more about your inquiry..."
            className="min-h-[140px]"
            error={
              touchedFields.message ? errors.message?.message : undefined
            }
            {...field}
          />
        )}
      />

      <Controller
        name="privacyConsent"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked ? true : undefined)}
                onBlur={field.onBlur}
                className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                aria-invalid={
                  touchedFields.privacyConsent && errors.privacyConsent
                    ? "true"
                    : undefined
                }
                aria-describedby={
                  errors.privacyConsent ? "privacy-error" : undefined
                }
              />
              <span className="text-sm text-muted-foreground select-none">
                I agree to the{" "}
                <Link
                  href="/privacy-policy"
                  className="text-primary underline font-medium hover:text-primary/80 transition-colors"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>
            {touchedFields.privacyConsent && errors.privacyConsent && (
              <p id="privacy-error" className="text-destructive text-sm mt-1">
                {errors.privacyConsent.message}
              </p>
            )}
          </div>
        )}
      />

      <Button
        type="submit"
        size="lg"
        label={isSubmitting ? "Sending..." : "Send Message"}
        loading={isSubmitting}
        disabled={isSubmitting}
        className="w-full"
      />
    </form>
  );
}
