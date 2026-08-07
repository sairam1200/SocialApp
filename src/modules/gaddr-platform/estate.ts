/**
 * The Gaddr estate: the product family and the AI incubator, as data.
 *
 * Part of the portable contract. This file imports nothing, from anywhere, so
 * that a sibling product can drop the directory in and render the same switcher
 * without inheriting Next.js, React or this repository's aliases.
 *
 * **`href` is null until the destination is verified to answer.** Every URL
 * here was probed before it was written down. A row with no href renders as a
 * labelled line that is not a link, which is worse than a working link and far
 * better than a browser error page.
 *
 * **`via` is how a product is reachable before its own hostname exists.** Gaddr
 * Pay has no host yet, but cards, invoices and receipts are already served
 * inside Jobs. The row points there and says so, rather than pretending the
 * subdomain is up or hiding the product.
 *
 * Blurbs are translation keys, not English. Every consumer of this list is
 * translated, and a hardcoded English blurb is a gap no translation report can
 * see, because the string never reaches a catalogue.
 */

export type ProductStatus = "live" | "soon";

/**
 * `platform` is Gaddr itself, and its rows read as "Gaddr X".
 * `labs` is the incubator: separate products, separate names, no prefix.
 */
export type ProductGroup = "platform" | "labs";

export interface GaddrProduct {
  /** Stable key. Selects the glyph and identifies the row in analytics. */
  id: string;
  /** Shown after the word "Gaddr" for `platform`, alone for `labs`. */
  name: string;
  /** Translation key under `products.` holding one short line. */
  blurbKey: string;
  /** Where the row goes. `null` means nothing answers there yet. */
  href: string | null;
  status: ProductStatus;
  group: ProductGroup;
  /** True for the product the reader is currently inside. */
  current?: boolean;
  /**
   * Translation key for a short qualifier, when the destination is not the
   * product's own public hostname. Rendered as a quiet chip next to the name.
   */
  viaKey?: string;
}

/**
 * What a host application supplies that the list itself cannot know.
 *
 * Two things, and deliberately only two: which product the reader is inside,
 * and the private address of the internal hub. Everything else is the same in
 * every product, which is the point of shipping the list rather than a
 * convention for writing one.
 */
export interface EstateConfig {
  /** The `id` of the product doing the rendering. Unknown ids mark nothing. */
  currentProductId?: string;
  /**
   * Where Gaddr Code answers. It is self-hosted on hardware we own and reached
   * through a Tailscale Funnel address, which is a real public URL but not one
   * anybody would guess and not one that survives a move. Overriding it here is
   * how the custom domain lands without a change to this file.
   */
  gaddrCodeUrl?: string | null;
}

const PLATFORM: readonly GaddrProduct[] = [
  {
    id: "jobs",
    name: "Jobs",
    blurbKey: "products.jobs",
    href: "https://jobs.gaddr.com",
    status: "live",
    group: "platform",
  },
  {
    id: "search",
    name: "Search",
    blurbKey: "products.search",
    href: "https://demo.gaddr.com/discover",
    status: "live",
    group: "platform",
  },
  {
    id: "me",
    name: "Me",
    blurbKey: "products.me",
    href: "https://demo.gaddr.com/discover?tab=profiles",
    status: "live",
    group: "platform",
  },
  {
    id: "pay",
    name: "Pay",
    blurbKey: "products.pay",
    href: "https://jobs.gaddr.com/settings/billing",
    status: "live",
    group: "platform",
    viaKey: "products.viaJobs",
  },
  {
    id: "work",
    name: "Work",
    blurbKey: "products.work",
    href: null,
    status: "soon",
    group: "platform",
  },
  {
    id: "code",
    name: "Code",
    blurbKey: "products.code",
    // Gitea on a Raspberry Pi 5, published through a Tailscale Funnel. Verified
    // serving a valid certificate and its own title before this was written
    // down. `docs/architecture/platform-contract.md` records the check.
    href: "https://rp5.tail98bed6.ts.net:8443/",
    status: "live",
    group: "platform",
    viaKey: "products.selfHosted",
  },
];

const LABS: readonly GaddrProduct[] = [
  {
    id: "neurtask",
    name: "NeurTask",
    blurbKey: "products.neurtask",
    href: "https://neurtask.com",
    status: "live",
    group: "labs",
  },
  {
    id: "majmap",
    name: "MajMap",
    blurbKey: "products.majmap",
    href: "https://majmap.com",
    status: "live",
    group: "labs",
  },
  {
    id: "visualiter",
    name: "Visualiter",
    blurbKey: "products.visualiter",
    href: null,
    status: "soon",
    group: "labs",
  },
  {
    id: "calcaios",
    name: "CalcAios",
    blurbKey: "products.calcaios",
    href: null,
    status: "soon",
    group: "labs",
  },
];

function applied(
  rows: readonly GaddrProduct[],
  config: EstateConfig,
): GaddrProduct[] {
  return rows.map((row) => {
    const current = row.id === config.currentProductId;
    if (row.id !== "code") {
      return current ? { ...row, current } : { ...row };
    }
    const href = config.gaddrCodeUrl?.trim() || row.href;
    return {
      ...row,
      href,
      status: href ? ("live" as const) : ("soon" as const),
      ...(current ? { current } : {}),
    };
  });
}

/** The product family, in the order the switcher renders it. */
export function gaddrProducts(config: EstateConfig = {}): GaddrProduct[] {
  return applied(PLATFORM, config);
}

/** The incubator, in the order the switcher renders it. */
export function gaddrLabs(config: EstateConfig = {}): GaddrProduct[] {
  return applied(LABS, config);
}

/** Everything, family first. */
export function gaddrEstate(config: EstateConfig = {}): GaddrProduct[] {
  return [...gaddrProducts(config), ...gaddrLabs(config)];
}

/** Full display name. The family carries the prefix; the incubator does not. */
export function productLabel(product: GaddrProduct): string {
  return product.group === "platform" ? `Gaddr ${product.name}` : product.name;
}

/** A row is a link only when something is known to answer at the other end. */
export function isLinkable(
  product: GaddrProduct,
): product is GaddrProduct & { href: string } {
  return product.status === "live" && typeof product.href === "string";
}

/**
 * The English copy, as the contract's own property rather than each product's.
 *
 * A product with no translation system passes `defaultTranslate` and is done.
 * A product that has one copies these into its catalogue and translates them,
 * and asserts the catalogue still covers `estateMessageKeys()`.
 *
 * Keeping the English here rather than only in a catalogue is what makes the
 * switcher render correctly in a product on its first day, before anybody has
 * written a line of copy for it. That is the difference between a contract that
 * plugs in and one that needs an afternoon first.
 */
export const ESTATE_MESSAGES: Record<string, string> = {
  "products.label": "Gaddr products",
  "products.switch": "Switch Gaddr product",
  "products.platformHeading": "One account, all of Gaddr",
  "products.labsHeading": "AI incubator",
  "products.expandLabs": "Show AI incubator products",
  "products.collapseLabs": "Hide AI incubator products",
  "products.soon": "Soon",
  "products.youAreHere": "You are here",
  "products.viaJobs": "In Jobs",
  "products.selfHosted": "Self-hosted",
  "products.jobs": "Roles, freelance projects, contracts and escrow",
  "products.search": "Find people, companies and work across Gaddr",
  "products.me": "Your profile, portfolio and verified history",
  "products.pay": "Cards, invoices, payouts and receipts",
  "products.work": "Delivery, milestones and the day to day of a project",
  "products.code": "Our own Git forge, on hardware we own",
  "products.neurtask": "Meeting notes and tasks, captured while you talk",
  "products.majmap": "Maps and territory data you can query",
  "products.visualiter": "Turns a dataset into a picture you can read",
  "products.calcaios": "Calculators for the numbers a business argues about",
};

/**
 * A `t` for a product with no translation system, or one whose catalogue does
 * not carry these keys yet.
 *
 * Returns the key rather than an empty string when it knows nothing, because a
 * visible `products.pay` in a menu gets fixed and a blank row does not.
 */
export function defaultTranslate(key: string): string {
  return ESTATE_MESSAGES[key] ?? key;
}

/**
 * The translation keys every consumer of the estate has to carry.
 *
 * Exported so a product can assert its own catalogue is complete rather than
 * discovering a missing key as a dotted path rendered in its own navigation.
 */
export function estateMessageKeys(): string[] {
  const fixed = [
    "products.label",
    "products.switch",
    "products.platformHeading",
    "products.labsHeading",
    "products.soon",
    "products.youAreHere",
  ];
  const rows = [...PLATFORM, ...LABS];
  return [
    ...fixed,
    ...rows.map((row) => row.blurbKey),
    ...rows.flatMap((row) => (row.viaKey ? [row.viaKey] : [])),
  ].filter((key, index, all) => all.indexOf(key) === index);
}
