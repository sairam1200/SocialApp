/**
 * Security levels: one dial that turns capability off across the estate.
 *
 * Part of the portable contract: no imports, so every Gaddr product answers
 * "may I do this right now?" the same way and an incident is handled once
 * rather than argued about per product at three in the morning.
 *
 * ── Why a level rather than a flag per feature ────────────────────────────
 *
 * Individual kill switches already existed here, and that is the problem: under
 * pressure somebody has to remember which nine to flip, in which order, and
 * every one they miss is the one that mattered. A level is a single decision
 * with a written meaning, and the mapping below is decided in advance, in
 * daylight, by people who are not currently being attacked.
 *
 * ── The three levels ──────────────────────────────────────────────────────
 *
 *   standard   Normal operation. Everything the product offers is available.
 *   elevated   Something is wrong and the blast radius should be smaller.
 *              The surfaces that are optional and useful to an attacker close:
 *              new accounts, imports, outbound calls, admin impersonation.
 *              Existing customers keep working and money still comes in.
 *   lockdown   Active incident. Only what keeps the site readable and paid
 *              customers served. Notably money *out* stops before money in:
 *              payouts are what an attacker wants, and a delayed payout is
 *              recoverable in a way a stolen one is not.
 *
 * ── The invariant that makes this safe ────────────────────────────────────
 *
 * Raising the level can only ever remove capability, never add it:
 * `lockdown ⊆ elevated ⊆ standard`, asserted in
 * `src/__tests__/security-levels.test.ts`. Without that check a well-meant
 * edit could make `lockdown` the level at which something becomes reachable,
 * which is the exact opposite of what anyone raising it intends.
 *
 * ── What is deliberately not in here ──────────────────────────────────────
 *
 * **Reading the site**, and **signing in**. Browsing, search, a public profile,
 * the pages a crawler indexes, and every sign-in method are not capabilities
 * and cannot be switched off by any level. "We were attacked" must not become
 * "the site is gone", and locking a customer out of their own account during an
 * incident is how a security event becomes a support event. Locking down takes
 * away what an attacker can *do*, not what a visitor can read or who can get in
 * to their own records.
 *
 * Every name below is checked somewhere in the server code, asserted by
 * `security-levels.test.ts`. A capability nothing enforces is worse than none:
 * it reads as protection and provides nothing.
 */

export const SECURITY_LEVELS = ["standard", "elevated", "lockdown"] as const;

export type SecurityLevel = (typeof SECURITY_LEVELS)[number];

/**
 * Everything a level can switch off.
 *
 * Each name is a thing this estate actually does. A capability nothing checks
 * is worse than no capability: it reads as protection and provides none, so
 * `security-levels.test.ts` asserts every name here is referenced somewhere in
 * the server code.
 */
export const GUARDED_CAPABILITIES = [
  /** Creating a new account at all. */
  "account-signup",
  /** Accepting a file from a reader. */
  "file-upload",
  /** Exporting a reader's own data as a file. */
  "data-export",
  /** Taking a card payment. */
  "card-payments",
  /** Taking or settling a payment on chain. */
  "crypto-payments",
  /** Sending money out: payouts, escrow release, refunds. */
  "payouts",
  /** The chat assistant and anything else that calls a model for a reader. */
  "ai-assistant",
  /** A model taking an action rather than answering a question. */
  "ai-actions",
  /** Pulling listings in from an external source. */
  "external-import",
] as const;

export type GuardedCapability = (typeof GUARDED_CAPABILITIES)[number];

/**
 * What each level allows.
 *
 * Written as an explicit list per level rather than as a diff from the one
 * below it. A diff is shorter and is the reason these tables go wrong: reading
 * "elevated removes three things" tells you nothing about what elevated *is*
 * without holding the other two levels in your head at the same time.
 */
const ALLOWED: Record<SecurityLevel, readonly GuardedCapability[]> = {
  standard: GUARDED_CAPABILITIES,

  elevated: [
    // People who already have an account keep working, and money still arrives.
    "file-upload",
    "data-export",
    "card-payments",
    "payouts",
    "ai-assistant",
    // Closed: new accounts, on-chain settlement, model-initiated actions and
    // imports from sources we do not control.
  ],

  lockdown: [
    // Signing in and reading are not on this list because no level can remove
    // them. What is left is renewal: an existing customer can still pay, so an
    // incident does not cancel subscriptions as a side effect. Nothing writes
    // outward, nothing costs money per call, nothing moves money out.
    "card-payments",
  ],
};

/** Whether a capability is available at a level. */
export function isCapabilityEnabled(
  level: SecurityLevel,
  capability: GuardedCapability,
): boolean {
  return ALLOWED[level].includes(capability);
}

/** Everything available at a level, for a status page or an admin screen. */
export function capabilitiesAt(
  level: SecurityLevel,
): readonly GuardedCapability[] {
  return ALLOWED[level];
}

/** What a level takes away compared with normal operation. */
export function capabilitiesWithheldAt(
  level: SecurityLevel,
): GuardedCapability[] {
  return GUARDED_CAPABILITIES.filter(
    (capability) => !isCapabilityEnabled(level, capability),
  );
}

/**
 * Read a level from configuration.
 *
 * An unrecognised value is `standard`, not a throw. A typo in an environment
 * variable must not be able to take the site down at boot, and the alternative,
 * defaulting to `lockdown` when the value is unreadable, turns one fat finger
 * into an outage. The caller is expected to log the rejection.
 */
export function parseSecurityLevel(value: string | undefined | null): {
  level: SecurityLevel;
  recognised: boolean;
} {
  const candidate = value?.trim().toLowerCase();
  if (!candidate) return { level: "standard", recognised: true };
  const match = SECURITY_LEVELS.find((level) => level === candidate);
  return match
    ? { level: match, recognised: true }
    : { level: "standard", recognised: false };
}

/** Ordering, so a caller can ask for "at least elevated" without a table. */
export function isAtLeast(level: SecurityLevel, floor: SecurityLevel): boolean {
  return SECURITY_LEVELS.indexOf(level) >= SECURITY_LEVELS.indexOf(floor);
}
