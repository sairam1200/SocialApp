/**
 * How a reader reaches a person, from any Gaddr product.
 *
 * Part of the portable contract: no imports, so every product can offer the
 * same ways in rather than each inventing a contact page.
 *
 * The ordering is the useful part. Self-service first, because most questions
 * are answered by an article and a reader who finds one never waits; then the
 * ticket, which is the path with a record; then the direct addresses, which are
 * last because a reply to an inbox is invisible to everyone else who could have
 * helped. `urgency: "incident"` reverses that: somebody locked out of a payment
 * does not want a help centre.
 */

export type SupportChannelId =
  | "help-centre"
  | "faq"
  | "ticket"
  | "email"
  | "security";

export type SupportUrgency = "question" | "incident";

export interface SupportChannel {
  id: SupportChannelId;
  /** Translation key under `support.` for the label. */
  labelKey: string;
  /** Translation key for the one line that says when to use it. */
  hintKey: string;
  /** Path relative to the product, or an absolute `mailto:` / URL. */
  href: string;
  /** Channels that create a tracked record, so nothing is lost in an inbox. */
  tracked: boolean;
  urgency: SupportUrgency[];
}

/**
 * The estate-wide set.
 *
 * Relative paths are deliberate: each product serves its own help surface, and
 * a reader in NeurTask asking a NeurTask question should not land in the Jobs
 * help centre. Products without one of these routes filter it out rather than
 * shipping a link to their own 404, which is what `supportChannels` does.
 */
const CHANNELS: readonly SupportChannel[] = [
  {
    id: "help-centre",
    labelKey: "support.helpCentre",
    hintKey: "support.helpCentreHint",
    href: "/help",
    tracked: false,
    urgency: ["question"],
  },
  {
    id: "faq",
    labelKey: "support.faq",
    hintKey: "support.faqHint",
    href: "/faq",
    tracked: false,
    urgency: ["question"],
  },
  {
    id: "ticket",
    labelKey: "support.ticket",
    hintKey: "support.ticketHint",
    href: "/contact",
    tracked: true,
    urgency: ["question", "incident"],
  },
  {
    id: "email",
    labelKey: "support.email",
    hintKey: "support.emailHint",
    href: "mailto:support@gaddr.com",
    tracked: false,
    urgency: ["question", "incident"],
  },
  {
    id: "security",
    labelKey: "support.security",
    hintKey: "support.securityHint",
    href: "mailto:security@gaddr.com",
    tracked: false,
    urgency: ["incident"],
  },
];

/**
 * The channels a product can actually offer, in the order to show them.
 *
 * `routes` is what the calling product serves. A channel whose href is a path
 * the product does not have is dropped, because a support link that 404s is
 * worse than one fewer option: it reads as the whole company being unreachable.
 */
export function supportChannels(options: {
  routes: readonly string[];
  urgency?: SupportUrgency;
}): SupportChannel[] {
  const urgency = options.urgency ?? "question";
  const usable = CHANNELS.filter(
    (channel) =>
      channel.urgency.includes(urgency) &&
      (!channel.href.startsWith("/") || options.routes.includes(channel.href)),
  );

  if (urgency !== "incident") return usable;

  // An incident wants the fastest route with a record, not a reading list.
  return [...usable].sort((a, b) => Number(b.tracked) - Number(a.tracked));
}

/** Every translation key a product needs to render the support routes. */
export function supportMessageKeys(): string[] {
  return CHANNELS.flatMap((channel) => [channel.labelKey, channel.hintKey]);
}
