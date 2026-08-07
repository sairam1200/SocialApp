"use client";

import { useEffect } from "react";

/**
 * Last-resort error boundary, for a failure in the root layout itself.
 *
 * Without this file, an error thrown in `layout.tsx` — a provider crashing, a bad locale
 * lookup, a failed font load — produces a **completely blank page**. No message, no styling,
 * nothing in the UI at all. That is the single worst screen the app can show, and it was
 * reachable.
 *
 * ## Why this file is deliberately primitive
 *
 * `global-error.tsx` *replaces* the root layout, so everything the rest of the app takes for
 * granted is gone:
 *
 * - **It must render its own `<html>` and `<body>`.** Nothing else will.
 * - **No providers.** `NextIntlClientProvider` lives in the layout that just failed, so
 *   `useTranslations` would throw — turning the error page into a second error. The copy is
 *   therefore English-only, and that is the right trade: this screen exists precisely when
 *   the app could not boot, so it must depend on as close to nothing as possible.
 * - **No stylesheet assumed.** `globals.css` is imported by the replaced layout, so the
 *   design tokens may not exist. Everything here is inline or in a local `<style>` block,
 *   with light/dark handled by a plain `prefers-color-scheme` media query — no JavaScript,
 *   no class on `<html>`, no theme provider.
 *
 * The result renders correctly even if the entire application shell is broken, which is the
 * only thing that matters at this point.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Error logged for debugging
  }, [error]);

  return (
    <html lang="en">
      <body>
        <style>{`
          .ge-root {
            --ge-bg: #ffffff;
            --ge-fg: #0a0a0a;
            --ge-muted: #5c5c5c;
            --ge-border: #e4e4e7;
            --ge-accent: #2563eb;
            --ge-accent-fg: #ffffff;
            --ge-card: #f4f4f5;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 2rem 1.5rem;
            text-align: center;
            background: var(--ge-bg);
            color: var(--ge-fg);
            font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
          }
          /* The media query, not a class: there is no ThemeProvider here to set one. */
          @media (prefers-color-scheme: dark) {
            .ge-root {
              --ge-bg: #09090b;
              --ge-fg: #fafafa;
              --ge-muted: #a1a1aa;
              --ge-border: #27272a;
              --ge-accent: #3b82f6;
              --ge-card: #18181b;
            }
          }
          .ge-title { margin: 0; font-size: 1.5rem; font-weight: 600; }
          .ge-body {
            margin: 0;
            max-width: 26rem;
            font-size: 0.9375rem;
            line-height: 1.6;
            color: var(--ge-muted);
          }
          .ge-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            justify-content: center;
            margin-top: 1rem;
          }
          .ge-btn {
            font: inherit;
            font-size: 0.875rem;
            font-weight: 500;
            padding: 0.625rem 1.25rem;
            border-radius: 0.5rem;
            cursor: pointer;
            border: 1px solid transparent;
          }
          .ge-btn-primary { background: var(--ge-accent); color: var(--ge-accent-fg); }
          .ge-btn-secondary {
            background: var(--ge-card);
            color: var(--ge-fg);
            border-color: var(--ge-border);
          }
          .ge-ref { margin-top: 1.5rem; font-size: 0.75rem; color: var(--ge-muted); }
          .ge-ref code {
            background: var(--ge-card);
            padding: 0.125rem 0.375rem;
            border-radius: 0.25rem;
            user-select: all;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          }
        `}</style>

        <div className="ge-root">
          <h1 className="ge-title">Gaddr didn&apos;t load properly</h1>
          <p className="ge-body">
            Reloading the page should fix it. If it keeps happening, your browser may be
            holding on to an old version.
          </p>

          <div className="ge-actions">
            <button type="button" onClick={reset} className="ge-btn ge-btn-primary">
              Reload the page
            </button>
            {/*
              A plain anchor, not next/link — deliberately, and the lint rule is disabled
              rather than satisfied.

              `next/link` needs the App Router context, which lives in the tree that just
              threw. Rendering a Link here risks throwing inside the error boundary, and the
              result of that is the blank page this whole file exists to prevent. A full
              document navigation is also the *better* recovery: it re-downloads the shell,
              which is exactly what a user with a broken cached bundle needs.
            */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="ge-btn ge-btn-secondary">
              Go to start
            </a>
          </div>

          {error.digest ? (
            <p className="ge-ref">
              Reference <code>{error.digest}</code>
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
