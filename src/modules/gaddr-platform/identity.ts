/**
 * One shape for "who is reading this", across every Gaddr product.
 *
 * Part of the portable contract: no imports, so a sibling product can hold the
 * same types without inheriting this repository's auth library. The types are
 * the agreement; each product keeps its own adapter that produces them.
 *
 * **Gaddr is the identity provider and everything else is a client.** A reader
 * signs in once, at Gaddr, and each product exchanges the resulting OIDC token
 * for a local session. The alternative, each product owning its own accounts
 * and reconciling them later, is the state this contract exists to prevent: it
 * produces four spellings of the same person and no way to tell which paid.
 *
 * `subject` is that person's identity everywhere. It is the OIDC `sub` claim,
 * it is stable for the life of the account, and it is the only key that may be
 * used to join records across products. An email address is not a key: people
 * change them, and two products can disagree about which is current.
 */

/** The signed-in reader, as every product must be able to express them. */
export interface GaddrIdentity {
  /** The OIDC `sub`. Stable, opaque, and the join key across products. */
  subject: string;
  email: string | null;
  /** Whether the provider has proved the address, not whether one is stored. */
  emailVerified: boolean;
  displayName: string | null;
  avatarUrl: string | null;
  /** BCP 47, so a product can render its first page in the right language. */
  locale: string | null;
}

/** What a product may do on the reader's behalf, as granted at sign-in. */
export type GaddrScope =
  | "openid"
  | "profile"
  | "email"
  /** Read the reader's charges and entitlements across the whole estate. */
  | "billing:read"
  /** Start a payment on the reader's behalf. */
  | "billing:write";

export interface GaddrSession {
  identity: GaddrIdentity;
  scopes: GaddrScope[];
  /** Epoch milliseconds. A product must refuse a session it has outlived. */
  expiresAt: number;
}

/**
 * The port every product implements, in both directions.
 *
 * A product consuming Gaddr identity implements `verify`. A product acting as
 * a provider for another implements the same signature over its own tokens,
 * which is why this is one interface and not two.
 */
export interface IdentityPort {
  /**
   * Resolve a bearer token to a session, or null. Must never throw for an
   * invalid token: an unauthenticated reader is an ordinary outcome, and a
   * throw here turns every expired tab into a 500.
   */
  verify(token: string): Promise<GaddrSession | null>;
}

/** Sign-in methods, in the order a product should offer them. */
export type SignInMethod = "gaddr" | "google" | "email" | "passkey";

/**
 * Gaddr first when it is configured, then whatever else the product supports.
 *
 * The order is a contract rather than a layout preference: a reader who has a
 * Gaddr account and is offered email first will make a second account with the
 * same address, and the two are then impossible to merge without asking them.
 *
 * Gaddr is dropped when it is not configured rather than shown and broken. A
 * sign-in button that leads to a 404 costs the account, not just the click.
 */
export function signInOrder(available: {
  gaddr: boolean;
  google?: boolean;
  email?: boolean;
  passkey?: boolean;
}): SignInMethod[] {
  const order: SignInMethod[] = [];
  if (available.gaddr) order.push("gaddr");
  if (available.google) order.push("google");
  if (available.passkey) order.push("passkey");
  // Email last and always: it needs no third party to be reachable, so it is
  // the method that still works when every provider is down.
  order.push("email");
  return order;
}

/**
 * Whether a session may be trusted right now.
 *
 * Takes the clock as an argument rather than reading it, so the check is
 * testable and so a server and a browser can disagree about the time without
 * one of them silently accepting an expired session.
 */
export function isSessionUsable(
  session: GaddrSession | null,
  now: number,
): session is GaddrSession {
  return session !== null && session.expiresAt > now;
}

/** Whether a session carries a scope. Missing scope is a refusal, not a retry. */
export function hasScope(session: GaddrSession, scope: GaddrScope): boolean {
  return session.scopes.includes(scope);
}
