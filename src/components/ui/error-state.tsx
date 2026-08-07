import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The shared surface for every "this didn't work" screen.
 *
 * One component so the 404, the route error boundary and any in-page failure state look and
 * read the same. Three rules it exists to enforce:
 *
 * **Never show the user a raw error.** The previous `error.tsx` rendered `error.message`
 * straight into the page, which for a client-side failure means text like
 * "Cannot read properties of undefined (reading 'aggregated')". That is not information to a
 * user — it is our internals leaking. Callers pass copy written for a person, and the
 * technical detail goes to the console and the server log.
 *
 * **Take the blame, and give a next step.** A dead end with no action is the worst part of
 * most error screens. Every use of this has at least one way onward.
 *
 * **Use tokens, never hardcoded colours.** The previous version used `text-gray-600` on a
 * `bg-white`-assumed page, which in dark mode is grey-on-near-black and barely legible.
 * These are all theme variables, so both schemes work without a second code path.
 */

export interface ErrorStateAction {
  label: string;
  /** Internal route. Rendered as a Link so it prefetches and works without JS. */
  href?: string;
  /** Click handler, for things a link cannot do — retry, reload. */
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export interface ErrorStateProps {
  /** Short, human, non-blaming. "We couldn't find that page". */
  title: string;
  /** One or two sentences. What happened, and what to do about it. */
  description: string;
  /**
   * Large, quiet glyph or code — "404". Decorative: it is `aria-hidden`, because the title
   * already carries the meaning and a screen reader announcing "404" adds nothing.
   */
  glyph?: ReactNode;
  actions?: ErrorStateAction[];
  /**
   * Next.js error digest. Shown as a short reference the user can quote to support, which is
   * the one piece of technical detail that genuinely helps them — it correlates to the
   * server-side log entry. Deliberately presented as a reference, not as an error.
   */
  reference?: string;
  /** Extra content below the actions — a search box on the 404, for instance. */
  children?: ReactNode;
}

function actionClasses(variant: ErrorStateAction["variant"]): string {
  const base =
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium " +
    "transition-colors focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 " +
    "focus-visible:ring-offset-[var(--background)]";

  return variant === "secondary"
    ? `${base} border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] hover:bg-[var(--muted)]`
    : `${base} bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90`;
}

export function ErrorState({
  title,
  description,
  glyph,
  actions = [],
  reference,
  children,
}: ErrorStateProps) {
  return (
    // `min-h-[60vh]` rather than `min-h-screen`: this renders inside the app shell, and a
    // full viewport height pushes the page's own header off screen.
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
      {glyph ? (
        <div
          aria-hidden="true"
          className="mb-6 select-none text-6xl font-semibold tracking-tight text-[var(--muted-foreground)] opacity-40 sm:text-7xl"
        >
          {glyph}
        </div>
      ) : null}

      {/* h1 because these are standalone pages — the error screen is the page's main heading. */}
      <h1 className="mb-3 max-w-xl text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
        {title}
      </h1>

      <p className="mb-8 max-w-md text-balance text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
        {description}
      </p>

      {actions.length > 0 ? (
        // Wraps on narrow screens instead of overflowing — an error page that scrolls
        // sideways on a phone is a second failure on top of the first.
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          {actions.map((action) =>
            action.href ? (
              <Link
                key={action.label}
                href={action.href}
                className={actionClasses(action.variant)}
              >
                {action.label}
              </Link>
            ) : (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={actionClasses(action.variant)}
              >
                {action.label}
              </button>
            ),
          )}
        </div>
      ) : null}

      {children}

      {reference ? (
        <p className="mt-8 text-xs text-[var(--muted-foreground)]">
          {/* Selectable and monospaced so it can be copied accurately into a support message. */}
          <span className="opacity-70">Reference </span>
          <code className="select-all rounded bg-[var(--muted)] px-1.5 py-0.5 font-mono">
            {reference}
          </code>
        </p>
      ) : null}
    </div>
  );
}
