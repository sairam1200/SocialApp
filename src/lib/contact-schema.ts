import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters"),
  preferredReplyEmail: z
    .string()
    .trim()
    .min(1, "Preferred Reply Email is required")
    .email("Please enter a valid email address"),
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required"),
  message: z
    .string()
    .trim()
    .min(15, "Message must be at least 15 characters"),
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Privacy Policy",
  }),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
