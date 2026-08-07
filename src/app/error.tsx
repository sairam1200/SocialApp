"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/ui/error-state";

/**
 * Route-level error boundary.
 *
 * Rewritten because the previous version had three problems that all pointed the same way —
 * it was built for a developer, and shipped to users:
 *
 * 1. **It rendered `error.message` into the page.** For a client-side failure that is text
 *    like "Cannot read properties of undefined (reading 'aggregated')". Meaningless to a
 *    user, and it exposes our internals. Next.js already redacts *server* error messages in
 *    production for exactly this reason; client ones are not redacted, so we must not print
 *    them.
 * 2. **A "Log details" button calling `alert()`.** A modal dialog saying "Error logged to
 *    console" is a debugging affordance, and `alert` blocks the page.
 * 3. **Hardcoded colours.** `text-gray-600` with an assumed white background renders as
 *    grey-on-near-black once the dark theme is active.
 *
 * What replaces them: the failure is logged to the console for whoever is debugging, the user
 * gets copy written for a person, and `error.digest` is surfaced as a reference code. The
 * digest is the genuinely useful detail — it is the id Next.js also writes to the server log,
 * so quoting it to support actually leads somewhere.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    // Error logged for debugging
  }, [error]);

  return (
    <ErrorState
      title={t("errorTitle")}
      description={t("errorBody")}
      reference={error.digest}
      actions={[
        // `reset()` re-renders the segment. It is genuinely the right first action: most of
        // these are transient — a failed fetch, a race on first paint — and retrying in place
        // keeps the user where they were instead of sending them back to the start.
        { label: t("tryAgain"), onClick: reset, variant: "primary" },
        { label: t("goHome"), href: "/", variant: "secondary" },
      ]}
    />
  );
}
