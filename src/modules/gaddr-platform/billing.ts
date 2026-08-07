/**
 * One shape for money, across every Gaddr product.
 *
 * Part of the portable contract: no imports, so a sibling product can hold the
 * same types without inheriting Stripe's SDK or this repository's schema.
 *
 * Three things this fixes, all of which have a cost when they are left to each
 * product to decide:
 *
 *   **One ledger account.** Every charge, from every product, settles to the
 *   same books. `LEDGER_ACCOUNT` is on the record itself rather than implied by
 *   which product wrote it, so a reconciliation query does not have to know how
 *   many products exist.
 *
 *   **One reader-facing picture.** A person who paid for two products should
 *   see one list. `BillingPort.charges` returns the whole estate, not the
 *   caller's slice of it, which is why it is keyed by identity subject.
 *
 *   **Stripe is the fallback that always works.** Paying with Gaddr is the
 *   intended path where it is available. Stripe is offered wherever it is not,
 *   and is never removed from the list, so no region and no outage leaves a
 *   reader with no way to pay.
 *
 * Amounts are integer minor units. A float here is a rounding bug that surfaces
 * as a one cent discrepancy in a reconciliation months later.
 */

/** The single account every product settles into. */
export const LEDGER_ACCOUNT = "gaddr-primary";

export type PaymentProvider = "gaddr" | "stripe";

/** What the reader is buying, in time terms. */
export type BillingInterval = "one_off" | "monthly" | "yearly";

export type ChargeStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "disputed";

export interface GaddrPrice {
  /** Stable product-scoped identifier, for example `jobs.pro.monthly`. */
  sku: string;
  /** ISO 4217, upper case. */
  currency: string;
  /** Integer minor units. 4900 is 49.00. */
  amountMinor: number;
  interval: BillingInterval;
}

/** One payment, as every product must be able to report it. */
export interface GaddrCharge {
  id: string;
  /** The `GaddrProduct.id` that sold it. */
  productId: string;
  /** The identity that paid. The OIDC `sub`, never an email address. */
  subject: string;
  sku: string;
  provider: PaymentProvider;
  currency: string;
  amountMinor: number;
  interval: BillingInterval;
  status: ChargeStatus;
  /** Epoch milliseconds. */
  createdAt: number;
  /** Always `LEDGER_ACCOUNT`; carried explicitly so exports are self-describing. */
  ledgerAccount: string;
}

/** What a paid charge buys, expressed so a product can answer "may they?". */
export interface GaddrEntitlement {
  productId: string;
  subject: string;
  sku: string;
  /** Epoch milliseconds, or null for a purchase that does not expire. */
  activeUntil: number | null;
}

export interface CheckoutRequest {
  subject: string;
  productId: string;
  price: GaddrPrice;
  /** Where to send the reader on success and on cancel. Absolute URLs. */
  successUrl: string;
  cancelUrl: string;
  /**
   * Makes a repeated call return the same session instead of a second one.
   *
   * Required, not optional. A checkout endpoint without one turns a double
   * click, a retried request or a flaky connection into two charges, and the
   * reader discovers it on their statement. The caller owns the key because
   * only the caller knows what "the same attempt" means.
   */
  idempotencyKey: string;
}

export interface CheckoutSession {
  provider: PaymentProvider;
  /** Where to send the reader to pay. */
  url: string;
}

/**
 * What a product must be able to answer about money it has taken.
 *
 * Split from the writing half deliberately. Reading is the part every product
 * has to implement to make the estate-wide picture possible, and it is cheap: a
 * product that sells nothing implements it by returning empty arrays. Requiring
 * `checkout` alongside it would mean a read-only product either implementing a
 * method that throws or being left out of the picture entirely, and a payment
 * history with a silent hole in it is worse than no payment history.
 */
export interface BillingReadPort {
  charges(subject: string): Promise<GaddrCharge[]>;
  entitlements(subject: string): Promise<GaddrEntitlement[]>;
}

/** A product that also sells. */
export interface BillingPort extends BillingReadPort {
  checkout(request: CheckoutRequest): Promise<CheckoutSession>;
}

/**
 * The whole picture, assembled from every product that answers.
 *
 * A product that fails is left out with its name recorded, rather than failing
 * the request: a reader asking what they have paid should not be told nothing
 * because one of five services is restarting. `incomplete` is what the UI needs
 * to say "this may be missing something" instead of implying a total is final.
 */
export async function collectCharges(
  subject: string,
  ports: ReadonlyArray<{ productId: string; port: BillingReadPort }>,
): Promise<{ charges: GaddrCharge[]; unavailable: string[] }> {
  const charges: GaddrCharge[] = [];
  const unavailable: string[] = [];

  const settled = await Promise.allSettled(
    ports.map((entry) => entry.port.charges(subject)),
  );
  settled.forEach((result, index) => {
    const productId = ports[index]?.productId ?? "unknown";
    if (result.status === "fulfilled") charges.push(...result.value);
    else unavailable.push(productId);
  });

  return {
    charges: charges.sort((a, b) => b.createdAt - a.createdAt),
    unavailable,
  };
}

/**
 * Which providers to offer, in order.
 *
 * Gaddr first where it is both configured and available for the reader's
 * region. Stripe is always in the list and always last: it is the path that
 * works when the intended one does not, and a checkout with no providers is an
 * outage that looks like a bug in the pricing page.
 */
export function paymentProviderOrder(options: {
  gaddrConfigured: boolean;
  /** Regions where paying with Gaddr has been enabled. ISO 3166-1 alpha-2. */
  gaddrRegions?: readonly string[];
  /** The reader's region, when it is known. */
  region?: string | null;
}): PaymentProvider[] {
  const regions = options.gaddrRegions ?? [];
  const regionAllows =
    regions.length === 0 ||
    (options.region !== null &&
      options.region !== undefined &&
      regions.includes(options.region.toUpperCase()));

  return options.gaddrConfigured && regionAllows
    ? ["gaddr", "stripe"]
    : ["stripe"];
}

/** Whether an entitlement is live at a given moment. */
export function isEntitled(
  entitlement: GaddrEntitlement,
  now: number,
): boolean {
  return entitlement.activeUntil === null || entitlement.activeUntil > now;
}

/**
 * What the reader has actually paid, across the estate.
 *
 * Refunded and failed charges are excluded because the question this answers is
 * "what has this person spent", not "how many rows exist". Mixed currencies are
 * kept apart rather than summed: converting here would bake a rate into a total
 * that is displayed next to the receipts it does not match.
 */
export function totalPaidByCurrency(
  charges: readonly GaddrCharge[],
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const charge of charges) {
    if (charge.status !== "paid") continue;
    const key = charge.currency.toUpperCase();
    totals[key] = (totals[key] ?? 0) + charge.amountMinor;
  }
  return totals;
}
