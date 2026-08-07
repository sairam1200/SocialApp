import SidebarNav from "@/components/navigation/SideBarNav";
import Footer from "@/components/layouts/Footer";

export const metadata = {
  title: "Terms & Conditions | Gaddr",
  description:
    "Read Gaddr's Terms & Conditions governing the use of our platform and services.",
};

/* ── helpers ── */

function SectionBadge({ num }: { num: string }) {
  return (
    <span className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary text-sm font-bold shrink-0">
      {num}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-primary shrink-0 mt-0.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CheckList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <CheckIcon />
          <span className="text-foreground">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CardSection({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 bg-card text-card-foreground rounded-xl border border-border p-6 md:p-8 space-y-4 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center gap-3">
        <SectionBadge num={num} />
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/* ── TOC data ── */

const toc = [
  { id: "section-1", num: "01", title: "Acceptance of Terms" },
  { id: "section-2", num: "02", title: "Eligibility" },
  { id: "section-3", num: "03", title: "User Accounts" },
  { id: "section-4", num: "04", title: "Connected Social Media Accounts" },
  { id: "section-5", num: "05", title: "User Responsibilities" },
  { id: "section-6", num: "06", title: "Acceptable Use" },
  { id: "section-7", num: "07", title: "Intellectual Property" },
  { id: "section-8", num: "08", title: "Subscriptions & Payments" },
  { id: "section-9", num: "09", title: "Third-Party Services" },
  { id: "section-10", num: "10", title: "Suspension & Termination" },
  { id: "section-11", num: "11", title: "Disclaimer of Warranties" },
  { id: "section-12", num: "12", title: "Limitation of Liability" },
  { id: "section-13", num: "13", title: "Indemnification" },
  { id: "section-14", num: "14", title: "Changes to These Terms" },
  { id: "section-15", num: "15", title: "Governing Law" },
  { id: "section-16", num: "16", title: "Contact" },
] as const;

/* ── shared list items ── */

const accountObligations = [
  "Provide accurate, current, and complete information when creating your account",
  "Maintain the security of your login credentials",
  "Keep your account information up to date",
  "Notify Gaddr immediately of any unauthorized use of your account",
  "Accept responsibility for all activity that occurs under your account",
] as const;

const supportedPlatforms = [
  "Instagram",
  "Facebook",
  "LinkedIn",
  "X (formerly Twitter)",
  "Threads",
  "TikTok",
  "YouTube",
  "Pinterest",
  "Bluesky",
  "Other supported social platforms",
] as const;

const userResponsibilities = [
  "Comply with all applicable laws and regulations",
  "Respect the terms and policies of connected third-party platforms",
  "Maintain the security of your account credentials",
  "Ensure you have the necessary rights to publish or schedule any content you submit",
  "Provide accurate and truthful information when using the service",
] as const;

const prohibitedActivities = [
  "Engaging in any illegal activity or unlawful purpose",
  "Distributing spam, unsolicited messages, or bulk communications",
  "Uploading or transmitting malware, viruses, or harmful code",
  "Attempting to gain unauthorized access to Gaddr systems or user accounts",
  "Abusing or excessively using our APIs beyond reasonable rate limits",
  "Reverse engineering, decompiling, or disassembling any part of the platform",
  "Infringing on the intellectual property rights of others",
  "Posting or sharing harmful, defamatory, or abusive content",
  "Using the platform in any way that could damage, disable, or impair our services",
] as const;

const ipOwnership = [
  "Gaddr owns all rights, title, and interest in and to the platform, including its software, UI, branding, logos, and underlying technology",
  "You retain full ownership of your content, including posts, media, and data you submit through the service",
  "You grant Gaddr a limited, revocable license to access, store, and process your content solely to provide the service",
  "Nothing in these Terms transfers any intellectual property rights from either party to the other",
] as const;

const billingTerms = [
  "Paid subscription plans are billed in advance on a monthly or annual basis as selected",
  "All fees are non-refundable except as expressly stated in our refund policy",
  "Prices are subject to change with reasonable notice",
  "You are responsible for all applicable taxes",
  "Subscriptions automatically renew unless cancelled before the renewal date",
  "You may cancel your subscription at any time through your account settings",
  "Cancellation takes effect at the end of the current billing period",
] as const;

const liabilityLimits = [
  "Lost profits, revenue, or business opportunities",
  "Loss of data or content",
  "Service interruptions caused by third-party platform outages",
  "Changes to third-party platform APIs that affect functionality",
  "Indirect, incidental, special, consequential, or punitive damages",
] as const;

const indemnifiedClaims = [
  "Your misuse of the platform or violation of these Terms",
  "Your violation of any law or regulation",
  "Your infringement of any third-party intellectual property or other rights",
  "Any content you publish or distribute through the service",
  "Your failure to secure your account or credentials",
] as const;

/* ── page ── */

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <div className="flex flex-1 p-5 bg-background max-w-7xl w-full mx-auto">
        <SidebarNav />
        <main className="max-w-4xl mx-auto px-6 py-12 w-full">
          <article className="space-y-10">
            {/* ── Hero ── */}
            <header className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
                Terms &amp; Conditions
              </h1>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground">
                  Last Updated: August 7, 2026
                </span>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                Welcome to <strong>Gaddr</strong>. These Terms &amp; Conditions
                (&ldquo;Terms&rdquo;) govern your access to and use of the
                Gaddr platform, website, and services. Please read these Terms
                carefully before using the service.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                By creating an account or using Gaddr in any way, you agree to
                be bound by these Terms. If you do not agree, you may not access
                or use the service.
              </p>
            </header>

            <hr className="border-border" />

            {/* ── Table of Contents ── */}
            <nav className="space-y-4" aria-label="Table of Contents">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Contents
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors py-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="text-xs text-muted-foreground font-mono w-5 shrink-0 text-right">
                      {item.num}
                    </span>
                    {item.title}
                  </a>
                ))}
              </div>
            </nav>

            <hr className="border-border" />

            {/* ── Section 1 ── */}
            <CardSection id="section-1" num="01" title="Acceptance of Terms">
              <p className="text-foreground leading-relaxed">
                By accessing, browsing, or using Gaddr, you acknowledge that you
                have read, understood, and agree to be bound by these Terms. If
                you are using the service on behalf of an organization, you
                represent that you have the authority to bind that organization
                to these Terms.
              </p>
              <p className="text-foreground leading-relaxed">
                These Terms apply to all visitors, users, and others who access
                or use the service. Additional terms may apply to specific
                features or paid plans and will be communicated to you at the
                time of activation.
              </p>
            </CardSection>

            {/* ── Section 2 ── */}
            <CardSection id="section-2" num="02" title="Eligibility">
              <p className="text-foreground leading-relaxed">
                To use Gaddr, you must meet the following eligibility criteria:
              </p>
              <CheckList
                items={
                  [
                    "Be at least 13 years of age (or the minimum legal age required in your jurisdiction to enter into a binding agreement)",
                    "Have the legal authority to manage and authorize access to the social media accounts you connect",
                    "Not be prohibited from receiving or using the service under applicable law",
                    "Not have been previously suspended or removed from the platform",
                  ] as const
                }
              />
              <p className="text-foreground leading-relaxed">
                If you do not meet these requirements, you may not access or use
                Gaddr. We reserve the right to verify eligibility at any time.
              </p>
            </CardSection>

            {/* ── Section 3 ── */}
            <CardSection id="section-3" num="03" title="User Accounts">
              <p className="text-foreground leading-relaxed">
                When you create a Gaddr account, you agree to:
              </p>
              <CheckList items={accountObligations} />
              <p className="text-foreground leading-relaxed">
                You are responsible for maintaining the confidentiality of your
                password and for all activities that occur under your account.
                Gaddr cannot and will not be liable for any loss or damage
                arising from your failure to comply with this obligation.
              </p>
            </CardSection>

            {/* ── Section 4 ── */}
            <CardSection
              id="section-4"
              num="04"
              title="Connected Social Media Accounts"
            >
              <p className="text-foreground leading-relaxed">
                Gaddr allows you to connect your social media accounts across
                supported platforms. All connections are established through
                secure OAuth authentication.
              </p>
              <p className="text-foreground leading-relaxed">
                By connecting a social media account, you authorize Gaddr to
                access, publish, and retrieve data in accordance with the
                permissions granted through each platform&rsquo;s OAuth consent
                screen. We never store your social media passwords.
              </p>
              <p className="text-foreground leading-relaxed">
                Supported platforms include:
              </p>
              <CheckList items={supportedPlatforms} />
              <p className="text-foreground leading-relaxed">
                You may disconnect any connected account at any time through
                your Gaddr settings or through the respective platform&rsquo;s
                authorization settings. Disconnecting an account will stop new
                data access but may preserve previously stored data in
                accordance with our Privacy Policy.
              </p>
              <p className="text-foreground leading-relaxed">
                For Facebook and Instagram connections, you authorize Gaddr to
                use Meta APIs only for the features shown in the product and
                only within the permissions you approve. These may include
                reading Pages, posts, comments, media, engagement and insights,
                publishing Page or Instagram media, and managing comments when
                you request those actions. You remain responsible for having
                the rights and authorization to manage each Page or professional
                Instagram account and for reviewing every publish, edit, delete,
                or moderation action before it is executed.
              </p>
              <p className="text-foreground leading-relaxed">
                Your use of Facebook and Instagram through Gaddr is also subject
                to the applicable{" "}
                <a
                  href="https://developers.facebook.com/terms/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  Meta Platform Terms
                </a>{" "}
                and{" "}
                <a
                  href="https://help.instagram.com/581066165581870"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  Instagram Terms of Use
                </a>
                .
              </p>
              <p className="text-foreground leading-relaxed">
                For a Pinterest connection, you authorize Gaddr to use the
                Pinterest API within the read-only permissions you approve to
                identify your account and retrieve your boards, Pins, media,
                links, and related metadata for Gaddr&rsquo;s connection, import,
                display, and search features. Gaddr does not currently request
                permission to create, edit, or delete your Pinterest content.
                You remain responsible for your Pinterest account and for
                ensuring that your use of Pinterest content through Gaddr
                complies with applicable law and Pinterest&rsquo;s rules.
              </p>
              <p className="text-foreground leading-relaxed">
                Your use of Pinterest through Gaddr is also subject to the{" "}
                <a
                  href="https://policy.pinterest.com/en/developer-guidelines"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  Pinterest Developer Guidelines
                </a>{" "}
                and the{" "}
                <a
                  href="https://policy.pinterest.com/en/terms-of-service"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  Pinterest Terms of Service
                </a>
                . Pinterest may change, restrict, or discontinue API access,
                which may affect Pinterest features in Gaddr.
              </p>
            </CardSection>

            {/* ── Section 5 ── */}
            <CardSection id="section-5" num="05" title="User Responsibilities">
              <p className="text-foreground leading-relaxed">
                As a Gaddr user, you agree to:
              </p>
              <CheckList items={userResponsibilities} />
              <p className="text-foreground leading-relaxed">
                Failure to meet these responsibilities may result in suspension
                or termination of your account.
              </p>
            </CardSection>

            {/* ── Section 6 ── */}
            <CardSection id="section-6" num="06" title="Acceptable Use">
              <p className="text-foreground leading-relaxed">
                You agree not to engage in any of the following prohibited
                activities:
              </p>
              <CheckList items={prohibitedActivities} />
              <p className="text-foreground leading-relaxed">
                Gaddr reserves the right to investigate and take appropriate
                action against any activity that violates these Terms, including
                suspending or terminating your account and reporting you to
                relevant authorities.
              </p>
            </CardSection>

            {/* ── Section 7 ── */}
            <CardSection id="section-7" num="07" title="Intellectual Property">
              <p className="text-foreground leading-relaxed">As between you and Gaddr:</p>
              <CheckList items={ipOwnership} />
              <p className="text-foreground leading-relaxed">
                The Gaddr name, logo, and brand elements are proprietary assets.
                You may not use them without our prior written consent.
              </p>
            </CardSection>

            {/* ── Section 8 ── */}
            <CardSection
              id="section-8"
              num="08"
              title="Subscriptions &amp; Payments"
            >
              <p className="text-foreground leading-relaxed">
                Certain features of Gaddr may require a paid subscription. The
                following terms apply to all paid plans:
              </p>
              <CheckList items={billingTerms} />
              <p className="text-foreground leading-relaxed">
                If you believe you have been charged in error, please contact us
                at team@gaddr.com and we will review your request.
              </p>
            </CardSection>

            {/* ── Section 9 ── */}
            <CardSection id="section-9" num="09" title="Third-Party Services">
              <p className="text-foreground leading-relaxed">
                Gaddr integrates with third-party social media platforms to
                provide its core functionality. We do not control these
                third-party platforms and are not responsible for their
                availability, security, or behavior.
              </p>
              <p className="text-foreground leading-relaxed">
                Your use of each connected platform is subject to that
                platform&rsquo;s own Terms of Service and Privacy Policy. Gaddr
                is not liable for any changes, outages, or API restrictions
                imposed by third-party platforms that may impact the features
                available to you.
              </p>
              <p className="text-foreground leading-relaxed">
                YouTube connections use Google OAuth and the YouTube APIs. You
                authorize Gaddr to read, import, analyze, publish, or manage
                YouTube content only to the extent shown in the consent screen
                and requested by the feature you use. You remain responsible
                for your channel, content, permissions, and compliance with
                the{" "}
                <a
                  href="https://www.youtube.com/t/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  YouTube Terms of Service
                </a>
                , Google policies, and applicable law.
              </p>
              <p className="text-foreground leading-relaxed">
                TikTok connections use TikTok Login Kit and Display APIs. You
                authorize Gaddr to read your approved TikTok profile
                information, statistics, and public videos for connection,
                import, and Discover features. Gaddr does not request or store
                your TikTok password. You remain responsible for your TikTok
                account and content and must comply with TikTok&apos;s{" "}
                <a
                  href="https://www.tiktok.com/legal/terms-of-service"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  Terms of Service
                </a>{" "}
                and applicable policies.
              </p>
              <p className="text-foreground leading-relaxed">
                You may disconnect a YouTube or TikTok account at any time
                through Gaddr or the relevant platform. Platform availability,
                authorization, review requirements, scopes, rate limits, and
                API changes may affect or disable related Gaddr features.
              </p>
            </CardSection>

            {/* ── Section 10 ── */}
            <CardSection
              id="section-10"
              num="10"
              title="Suspension &amp; Termination"
            >
              <p className="text-foreground leading-relaxed">
                Gaddr reserves the right to suspend or terminate your account
                at any time, without prior notice, if we determine in our sole
                discretion that you have:
              </p>
              <CheckList
                items={
                  [
                    "Violated any provision of these Terms",
                    "Engaged in illegal or fraudulent activity",
                    "Abused the platform or disrupted other users' experience",
                    "Posed a security risk to Gaddr or its users",
                    "Attempted to circumvent payment obligations or usage limits",
                  ] as const
                }
              />
              <p className="text-foreground leading-relaxed">
                If your account is terminated for cause, you will not be
                entitled to a refund for any prepaid fees. If you wish to
                terminate your account voluntarily, you may do so through your
                account settings at any time.
              </p>
            </CardSection>

            {/* ── Section 11 ── */}
            <CardSection
              id="section-11"
              num="11"
              title="Disclaimer of Warranties"
            >
              <p className="text-foreground leading-relaxed">
                The Gaddr platform is provided on an &ldquo;as is&rdquo; and
                &ldquo;as available&rdquo; basis. To the maximum extent
                permitted by applicable law, Gaddr disclaims all warranties,
                whether express, implied, statutory, or otherwise, including but
                not limited to any implied warranties of merchantability,
                fitness for a particular purpose, and non-infringement.
              </p>
              <p className="text-foreground leading-relaxed">
                We do not guarantee that the service will be uninterrupted,
                secure, or error-free, or that any defects will be corrected. We
                make no representations about the accuracy, reliability, or
                completeness of the content or features provided.
              </p>
            </CardSection>

            {/* ── Section 12 ── */}
            <CardSection
              id="section-12"
              num="12"
              title="Limitation of Liability"
            >
              <p className="text-foreground leading-relaxed">
                To the maximum extent permitted by applicable law, Gaddr and its
                affiliates, officers, employees, and agents shall not be liable
                for:
              </p>
              <CheckList items={liabilityLimits} />
              <p className="text-foreground leading-relaxed">
                This limitation applies regardless of the legal theory on which
                a claim is based, whether in contract, tort, or otherwise, even
                if Gaddr has been advised of the possibility of such damages. In
                no event shall Gaddr&rsquo;s total liability exceed the amount
                you have paid to us in the twelve (12) months preceding the
                claim.
              </p>
            </CardSection>

            {/* ── Section 13 ── */}
            <CardSection id="section-13" num="13" title="Indemnification">
              <p className="text-foreground leading-relaxed">
                You agree to indemnify, defend, and hold harmless Gaddr, its
                affiliates, officers, directors, employees, and agents from and
                against any claims, liabilities, damages, losses, and expenses
                (including reasonable legal fees) arising out of or in any way
                connected with:
              </p>
              <CheckList items={indemnifiedClaims} />
              <p className="text-foreground leading-relaxed">
                We reserve the right to assume the exclusive defense and control
                of any matter subject to indemnification at your expense.
              </p>
            </CardSection>

            {/* ── Section 14 ── */}
            <CardSection id="section-14" num="14" title="Changes to These Terms">
              <p className="text-foreground leading-relaxed">
                Gaddr reserves the right to modify or update these Terms at any
                time. When material changes are made, we will update the
                &ldquo;Last Updated&rdquo; date at the top of this page and may
                notify users via email or through the platform where
                appropriate.
              </p>
              <p className="text-foreground leading-relaxed">
                Your continued use of Gaddr after any changes become effective
                constitutes acceptance of the revised Terms. If you do not agree
                to the updated Terms, you must discontinue using the service and
                close your account.
              </p>
            </CardSection>

            {/* ── Section 15 ── */}
            <CardSection id="section-15" num="15" title="Governing Law">
              <p className="text-foreground leading-relaxed">
                These Terms shall be governed by and interpreted in accordance
                with the laws applicable to the jurisdiction in which Gaddr
                operates, unless otherwise required by applicable law.
              </p>
              <p className="text-foreground leading-relaxed">
                Any disputes arising out of or relating to these Terms or your
                use of Gaddr shall be resolved through good-faith negotiations
                between the parties. If a resolution cannot be reached, the
                dispute shall be submitted to the competent courts of the
                applicable jurisdiction.
              </p>
              <p className="text-foreground leading-relaxed">
                Nothing in this section limits either party&rsquo;s right to
                seek injunctive or other equitable relief in any jurisdiction.
              </p>
            </CardSection>

            {/* ── Section 16 (Contact — highlighted) ── */}
            <section
              id="section-16"
              className="scroll-mt-24 bg-primary/[0.04] border border-primary/20 rounded-xl p-6 md:p-8 space-y-4"
            >
              <div className="flex items-center gap-3">
                <SectionBadge num="16" />
                <h2 className="text-xl font-bold">Contact</h2>
              </div>
              <p className="text-foreground leading-relaxed">
                If you have any questions about these Terms &amp; Conditions,
                please contact us:
              </p>
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-primary shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <a
                  href="mailto:team@gaddr.com"
                  className="text-primary underline font-medium hover:text-primary/80 transition-colors"
                >
                  team@gaddr.com
                </a>
              </div>
              <p className="text-foreground leading-relaxed">
                We will make reasonable efforts to respond to your inquiry
                promptly.
              </p>
            </section>
          </article>
        </main>
      </div>
      <Footer />
    </div>
  );
}
