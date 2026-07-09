import type { Metadata } from "next";
import LandingPrimaryNav from "@/components/landing-page/LandingPrimaryNav";
import LandingFooter from "@/components/landing-page/LandingFooter";
import ContactForm from "@/components/contact/ContactForm";
import ContactInfoCards from "@/components/contact/ContactInfoCards";

export const metadata: Metadata = {
  title: "Contact Us | Gaddr",
  description:
    "Have questions about Gaddr? Send us a message and our team will respond as soon as possible.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero */}
      <header className="relative w-full bg-[linear-gradient(117deg,#0D0932_28.21%,#501F98_75.34%)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[url('/images/landing-bg-pattern.webp')] bg-repeat bg-top opacity-[0.05]" />
        <div className="relative max-w-7xl mx-auto px-5 pt-6 md:pt-7">
          <LandingPrimaryNav />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Have questions about Gaddr? We&apos;d love to hear from you. Send us
            a message and our team will respond as soon as possible.
          </p>
        </div>
      </header>

      {/* Main content */}
      <section className="flex-1 bg-background">
        <div className="max-w-6xl mx-auto px-5 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <ContactInfoCards />
            </div>
            <div className="lg:col-span-3">
              <div className="rounded-xl border border-border bg-card p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6">Send Us a Message</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
