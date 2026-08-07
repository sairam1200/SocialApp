import { ApiError } from "@/types/error.types";

/**
 * Turn a failed API call into something worth showing a person.
 *
 * ## What was wrong before
 *
 * The previous version returned `data.title || data.message || error.message` — whatever the
 * backend or axios happened to say, straight into the UI. Three problems with that:
 *
 * - **Axios messages are not sentences for users.** A dropped connection produces
 *   "Network Error"; a timeout produces "timeout of 8000ms exceeded"; a 500 produces
 *   "Request failed with status code 500". None of those tell a person what to do.
 * - **It leaked internals.** Backend exception text reached the screen verbatim. A Postgres
 *   error, a validation dump, or the name of an internal service is not for the public, and
 *   the backend has 201 endpoints — no way to audit every message it might emit.
 * - **It ignored the status code**, which is the most reliable signal available. A 401 and a
 *   503 need completely different words, and both were rendered identically.
 *
 * ## What it does now
 *
 * Maps the HTTP status onto a translation key from the `errors` namespace. That namespace
 * already existed in all locale files — with `unauthorized`, `rateLimited`, `network` and the
 * rest — and **nothing read it**. This is what finishes it.
 *
 * Backend text is still used, but only when it is safe to: a `4xx` where the server is
 * deliberately explaining a client mistake ("That username is taken"). A `5xx` message is
 * never shown, because a server fault is never the user's to interpret.
 */

/** Keys in the `errors` translation namespace this maps onto. */
export type ApiErrorKey =
  | "network"
  | "unauthorized"
  | "forbidden"
  | "notFound"
  | "rateLimited"
  | "generic";

export interface ParsedApiError {
  /** Translation key for the headline. */
  key: ApiErrorKey;
  /** Matching `${key}Hint` key, when the namespace has one. */
  hintKey?: string;
  /**
   * Server-supplied explanation, only when it is safe to surface — see `isSafeToShow`.
   * Prefer this over the translated string when present: a specific, accurate message beats
   * a generic one.
   */
  detail?: string;
  /** HTTP status, for callers that branch on it (e.g. redirect to login on 401). */
  status?: number;
}

/**
 * Should the server's own message reach the user?
 *
 * Only for the 4xx range that exists to explain a client mistake, and only for text that
 * looks like prose rather than a leaked internal. The heuristics are deliberately
 * conservative — showing a generic message is a small loss, showing a stack trace is not.
 */
function isSafeToShow(status: number | undefined, text: string): boolean {
  if (status === undefined || status < 400 || status >= 500) return false;

  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 200) return false;

  // Signs of an internal detail rather than a user-facing sentence.
  const leaks = [
    /\bat\s+\w+\.\w+\s*\(/i, // stack frame
    /\b(?:select|insert|update|delete)\b.*\bfrom\b/i, // SQL
    /\b(?:ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN)\b/,
    /\b(?:QueryFailedError|TypeError|ReferenceError|SyntaxError)\b/,
    /(?:\/[\w.-]+){3,}/, // filesystem path
    /\b(?:undefined|null)\b\s*(?:is not|has no)/i,
    /node_modules/,
  ];

  return !leaks.some((pattern) => pattern.test(trimmed));
}

/** Map a status onto the copy that fits it. */
function keyForStatus(status: number | undefined): ApiErrorKey {
  if (status === undefined) return "network"; // no response at all
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "notFound";
  if (status === 429) return "rateLimited";
  return "generic";
}

/** Namespace keys that have a matching `…Hint`. */
const KEYS_WITH_HINT = new Set(["generic", "network", "notFound", "rateLimited"]);

export function parseApiError(error: ApiError | null | undefined): ParsedApiError {
  if (!error) return { key: "generic", hintKey: "genericHint" };

  const status = error.response?.status;
  const key = keyForStatus(status);
  const hintKey = KEYS_WITH_HINT.has(key) ? `${key}Hint` : undefined;

  const data = error.response?.data;
  const serverText =
    typeof data === "string"
      ? data
      : data && typeof data === "object"
        ? // RFC 7807 Problem Details: `title` is the human-readable summary.
          (data.title ?? data.message ?? "")
        : "";

  return {
    key,
    hintKey,
    status,
    detail:
      typeof serverText === "string" && isSafeToShow(status, serverText)
        ? serverText.trim()
        : undefined,
  };
}

/**
 * Resolve a parsed error to a single display string.
 *
 * Convenience for the many call sites that just want text. Pass the `errors` namespace
 * translator:
 *
 * ```ts
 * const t = useTranslations("errors");
 * toast.error(apiErrorMessage(parseApiError(err), t));
 * ```
 */
export function apiErrorMessage(
  parsed: ParsedApiError,
  t: (key: string) => string,
): string {
  // A safe server message is more specific than our generic copy, so it wins.
  if (parsed.detail) return parsed.detail;

  const title = t(parsed.key);
  const hint = parsed.hintKey ? t(parsed.hintKey) : "";
  return hint ? `${title}. ${hint}` : title;
}
