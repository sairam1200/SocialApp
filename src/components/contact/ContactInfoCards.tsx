import { Mail, Clock, MessageSquare, Shield } from "lucide-react";

const cards = [
  {
    icon: Mail,
    title: "Get in Touch",
    content: (
      <>
        Have questions about Gaddr? Email us at{" "}
        <a
          href="mailto:team@gaddr.com"
          className="text-primary underline font-medium hover:text-primary/80 transition-colors"
        >
          team@gaddr.com
        </a>{" "}
        and we&apos;ll get back to you.
      </>
    ),
  },
  {
    icon: Clock,
    title: "Response Time",
    content:
      "We typically respond within 24 hours on business days. For urgent matters, mention it in your message and we'll prioritize it.",
  },
  {
    icon: MessageSquare,
    title: "Support",
    content:
      "Need help with Gaddr? Whether it's feature requests, bug reports, business partnerships, or general questions — our team is happy to help.",
  },
  {
    icon: Shield,
    title: "Privacy",
    content:
      "Your information remains on your device and is only used to prepare your email draft. Nothing is stored or transmitted by Gaddr until you choose to send the email.",
  },
];

export default function ContactInfoCards() {
  return (
    <div className="space-y-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="rounded-xl border border-border bg-card p-5 md:p-6 space-y-2 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
                <Icon className="w-5 h-5" />
              </span>
              <h3 className="font-semibold text-base">{card.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pl-12">
              {card.content}
            </p>
          </div>
        );
      })}
    </div>
  );
}
