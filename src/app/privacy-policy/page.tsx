import SidebarNav from "@/components/navigation/SideBarNav";
import Footer from "@/components/layouts/Footer";

export const metadata = {
  title: "Privacy Policy | Gaddr",
  description:
    "Read Gaddr's Privacy Policy to understand how we collect, use, store, and protect your information.",
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

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-1 h-4 bg-primary rounded-full shrink-0" />
      <h3 className="font-semibold text-base">{children}</h3>
    </div>
  );
}

/* ── TOC data ── */

const toc = [
  { id: "section-1", num: "01", title: "Information We Collect" },
  { id: "section-2", num: "02", title: "How We Use Your Information" },
  { id: "section-3", num: "03", title: "Connected Third-Party Services" },
  { id: "section-4", num: "04", title: "OAuth Authentication" },
  { id: "section-5", num: "05", title: "How We Share Information" },
  { id: "section-6", num: "06", title: "Data Retention" },
  { id: "section-7", num: "07", title: "Data Security" },
  { id: "section-8", num: "08", title: "Cookies and Tracking Technologies" },
  { id: "section-9", num: "09", title: "Your Privacy Rights" },
  { id: "section-10", num: "10", title: "International Data Transfers" },
  { id: "section-11", num: "11", title: "Children\u2019s Privacy" },
  { id: "section-12", num: "12", title: "Third-Party Links" },
  { id: "section-13", num: "13", title: "Changes to This Privacy Policy" },
  { id: "section-14", num: "14", title: "Contact Us" },
];

/* ── shared list items ── */

const infoYouProvide = [
  "Name",
  "Email address",
  "Profile information",
  "Organization or company name (if applicable)",
  "Billing information (if you purchase a subscription)",
  "Messages or support requests you send us",
] as const;

const socialMediaInfo = [
  "Account ID",
  "Username",
  "Display name",
  "Profile photo",
  "Business or creator account information",
  "Pages, channels, or profiles you manage",
  "Social media posts and media",
  "Analytics and engagement metrics",
  "Comments, mentions, and messages (only if explicitly authorized)",
  "Publishing permissions",
] as const;

const autoCollected = [
  "IP address",
  "Browser type",
  "Device information",
  "Operating system",
  "App version",
  "Log files",
  "Usage analytics",
  "Session information",
  "Cookies and similar technologies",
] as const;

const howWeUse = [
  "Create and manage your account",
  "Authenticate your identity",
  "Connect to your selected social media platforms",
  "Publish and schedule content on your behalf",
  "Display analytics and engagement insights",
  "Synchronize data across connected platforms",
  "Improve our products and services",
  "Personalize your experience",
  "Send important account notifications",
  "Respond to customer support requests",
  "Prevent fraud, abuse, and unauthorized activity",
  "Comply with legal obligations",
] as const;

const platforms = [
  "Instagram",
  "Facebook",
  "LinkedIn",
  "X (formerly Twitter)",
  "Threads",
  "TikTok",
  "YouTube",
  "Pinterest",
  "Reddit",
  "Other supported social platforms",
] as const;

const oauthMeans = [
  "We never ask for or store your social media passwords.",
  "Authentication is handled directly by the platform you connect.",
  "Access tokens are securely stored and used only to provide requested features.",
  "You can revoke access at any time through the respective platform.",
] as const;

const shareCircumstances = [
  "With trusted service providers who help operate Gaddr",
  "With cloud hosting providers",
  "With payment processors",
  "With analytics providers",
  "When required by law",
  "To protect our legal rights",
  "During a merger, acquisition, or business transfer",
] as const;

const retentionPurposes = [
  "Provide our services",
  "Maintain your account",
  "Comply with legal obligations",
  "Resolve disputes",
  "Enforce our agreements",
] as const;

const securityMeasures = [
  "Encrypted HTTPS connections",
  "Encryption of sensitive data at rest where appropriate",
  "Secure OAuth authentication",
  "Access controls",
  "Monitoring and logging",
  "Regular security updates",
  "Limited employee access to personal information",
] as const;

const cookiePurposes = [
  "Keep you signed in",
  "Remember your preferences",
  "Improve performance",
  "Analyze usage",
  "Detect security issues",
] as const;

const privacyRights = [
  "Access your personal data",
  "Correct inaccurate information",
  "Delete your account and personal data",
  "Withdraw consent",
  "Restrict or object to certain processing",
  "Export your data where applicable",
  "Opt out of marketing communications",
] as const;

/* ── page ── */

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <div className="flex flex-1 p-5 bg-background max-w-7xl w-full mx-auto">
        <SidebarNav />
        <main className="max-w-4xl mx-auto px-6 py-12 w-full">
          <article className="space-y-10">
            {/* ── Hero ── */}
            <header className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
                Privacy Policy
              </h1>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground">
                  Last Updated: August 7, 2026
                </span>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                Welcome to <strong>Gaddr</strong> . We
                value your privacy and are committed to protecting your personal
                information. This Privacy Policy explains how we collect, use,
                store, and protect your information when you use our website,
                applications, and services.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                By using Gaddr, you agree to the practices described in this
                Privacy Policy.
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
            <CardSection id="section-1" num="01" title="Information We Collect">
              <SubHeading>A. Information You Provide</SubHeading>
              <p className="text-foreground leading-relaxed">
                When you create an account or use our services, we may collect:
              </p>
              <CheckList items={infoYouProvide} />

              <SubHeading>B. Information from Connected Social Media Accounts</SubHeading>
              <p className="text-foreground leading-relaxed">
                When you connect third-party social media platforms to Gaddr, we
                receive only the information that you authorize through the
                platform&rsquo;s secure authentication (OAuth) process.
              </p>
              <p className="text-foreground leading-relaxed">
                Depending on the permissions you grant, this may include:
              </p>
              <CheckList items={socialMediaInfo} />
              <p className="text-foreground leading-relaxed">
                We never collect your social media passwords.
              </p>

              <SubHeading>C. Automatically Collected Information</SubHeading>
              <p className="text-foreground leading-relaxed">
                When you use Gaddr, we may automatically collect:
              </p>
              <CheckList items={autoCollected} />
            </CardSection>

            {/* ── Section 2 ── */}
            <CardSection id="section-2" num="02" title="How We Use Your Information">
              <p className="text-foreground leading-relaxed">
                We use your information to:
              </p>
              <CheckList items={howWeUse} />
              <p className="text-foreground leading-relaxed">
                We only access data necessary to provide the features you choose
                to use.
              </p>
            </CardSection>

            {/* ── Section 3 ── */}
            <CardSection id="section-3" num="03" title="Connected Third-Party Services">
              <p className="text-foreground leading-relaxed">
                Gaddr integrates with third-party platforms, which may include:
              </p>
              <CheckList items={platforms} />
              <p className="text-foreground leading-relaxed">
                Each platform has its own Privacy Policy and Terms of Service.
                Your use of those platforms is governed by their respective
                policies.
              </p>

              <SubHeading>YouTube API Services</SubHeading>
              <p className="text-foreground leading-relaxed">
                When you connect YouTube, Gaddr uses the YouTube Data API and
                YouTube Analytics API only after you give explicit OAuth
                consent. Depending on the features you choose, the requested
                permissions may include:
              </p>
              <CheckList
                items={[
                  "youtube.readonly to verify your channel and read channel, video, playlist, subscription, and related metadata for connection, discovery, and import features.",
                  "yt-analytics.readonly to display your channel and video performance reports, such as views, watch time, likes, and subscriber metrics.",
                  "youtube.upload to publish a video, thumbnail, and the title, description, tags, and visibility settings you explicitly submit.",
                  "youtube.force-ssl to read video comments and statistics and, when you request it, reply to, moderate, or delete comments as permitted by YouTube.",
                  "userinfo.email and userinfo.profile to identify the Google account and display basic account or channel identity.",
                ]}
              />
              <p className="text-foreground leading-relaxed">
                YouTube API data is used only to provide or improve these
                user-facing Gaddr features. We do not sell YouTube data, use it
                for advertising, surveillance, or generalized profiling, or
                use it to train artificial-intelligence models. We do not ask
                for or store your Google or YouTube password, and we do not
                disclose authorized YouTube data to people other than you or
                service providers acting on your instructions to operate Gaddr.
              </p>
              <p className="text-foreground leading-relaxed">
                You can disconnect YouTube from Gaddr at any time. We stop
                accessing new data, revoke the connected authorization where
                supported, and delete the local YouTube integration credentials
                and records. You can also request deletion of remaining
                imported data by contacting us. Our use of Google API data
                follows the Google API Services User Data Policy, including its
                Limited Use requirements. See the{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  Google Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="https://www.youtube.com/t/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  YouTube Terms of Service
                </a>
                .
              </p>
              <p className="text-foreground leading-relaxed">
                You may disconnect your social accounts at any time through your
                account settings or through the connected platform&rsquo;s
                authorization settings.
              </p>

              <SubHeading>Facebook and Instagram API Services</SubHeading>
              <p className="text-foreground leading-relaxed">
                When you connect Facebook or Instagram, Gaddr uses Meta&rsquo;s
                APIs only after your explicit OAuth consent. Depending on the
                features you choose, we may request permissions to list Pages
                you manage, read Page posts, comments, engagement and insights,
                publish or manage Page posts, read an Instagram professional
                account&rsquo;s profile and media, read or manage comments, publish
                media, and view account insights. These permissions correspond
                to scopes such as pages_show_list, pages_read_engagement,
                pages_read_user_content, pages_manage_posts, read_insights,
                instagram_business_basic, instagram_business_manage_comments,
                instagram_business_content_publish, and
                instagram_business_manage_insights.
              </p>
              <p className="text-foreground leading-relaxed">
                Meta API data is used only for the connected account features
                shown in Gaddr, including profile and content import, analytics,
                publishing, and user-requested comment management. We do not
                sell Meta data, use it for advertising, surveillance, or
                generalized profiling, or use it to train artificial-intelligence
                models. We do not ask for or store your Facebook or Instagram
                password, and authorized data is not disclosed to other users.
              </p>
              <p className="text-foreground leading-relaxed">
                You can disconnect Facebook or Instagram at any time from Gaddr
                settings or the platform&rsquo;s authorization settings. We stop
                accessing new data, revoke the connected authorization where
                supported, and delete local integration credentials and records.
                You may request deletion of remaining imported data by contacting
                team@gaddr.com. Our handling of Meta data follows the applicable
                Meta Platform Terms and privacy requirements.
              </p>

              <SubHeading>Pinterest API Services</SubHeading>
              <p className="text-foreground leading-relaxed">
                When you connect Pinterest, Gaddr accesses the Pinterest API
                only after you give explicit OAuth consent. Gaddr currently
                requests user_accounts:read, boards:read, and pins:read so that
                it can identify your Pinterest account and retrieve the profile,
                boards, Pins, media, links, and related metadata available under
                those permissions. Gaddr does not request permission to create,
                edit, or delete Pins or boards.
              </p>
              <p className="text-foreground leading-relaxed">
                Pinterest API data is used only to provide the Pinterest
                connection and user-facing import, display, and search features
                you choose. We do not sell Pinterest API data, use it for
                advertising, surveillance, or generalized profiling, combine it
                with another person&rsquo;s account data, or use it to train
                artificial-intelligence models. We do not ask for or store your
                Pinterest password and do not disclose authorized Pinterest data
                to other users or independent third parties.
              </p>
              <p className="text-foreground leading-relaxed">
                You can disconnect Pinterest at any time through Gaddr settings
                or Pinterest&rsquo;s authorization settings. When you disconnect,
                Gaddr stops requesting new Pinterest data and deletes the local
                Pinterest access credentials and integration records associated
                with that connection. You may also request deletion by contacting
                team@gaddr.com. Our use of Pinterest API data is subject to the{" "}
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
                  href="https://policy.pinterest.com/en/privacy-policy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  Pinterest Privacy Policy
                </a>
                .
              </p>
            </CardSection>

            {/* ── Section 4 ── */}
            <CardSection id="section-4" num="04" title="OAuth Authentication">
              <p className="text-foreground leading-relaxed">
                Gaddr uses secure OAuth authorization to connect your social
                media accounts.
              </p>
              <p className="text-foreground leading-relaxed">This means:</p>
              <CheckList items={oauthMeans} />
            </CardSection>

            {/* ── Section 5 ── */}
            <CardSection id="section-5" num="05" title="How We Share Information">
              <p className="text-foreground leading-relaxed font-semibold">
                We do not sell your personal information.
              </p>
              <p className="text-foreground leading-relaxed">
                We may share information only in the following circumstances:
              </p>
              <CheckList items={shareCircumstances} />
              <p className="text-foreground leading-relaxed">
                All third-party providers are required to protect your
                information.
              </p>
            </CardSection>

            {/* ── Section 6 ── */}
            <CardSection id="section-6" num="06" title="Data Retention">
              <p className="text-foreground leading-relaxed">
                We retain your information only as long as necessary to:
              </p>
              <CheckList items={retentionPurposes} />
              <p className="text-foreground leading-relaxed">
                If you disconnect a connected social account, we will stop
                accessing new data from that account. Previously stored data may
                remain until deleted in accordance with our retention policies
                or upon your request.
              </p>
            </CardSection>

            {/* ── Section 7 ── */}
            <CardSection id="section-7" num="07" title="Data Security">
              <p className="text-foreground leading-relaxed">
                We implement industry-standard security measures, including:
              </p>
              <CheckList items={securityMeasures} />
              <p className="text-foreground leading-relaxed">
                While we strive to protect your data, no method of transmission
                or storage is completely secure.
              </p>
            </CardSection>

            {/* ── Section 8 ── */}
            <CardSection
              id="section-8"
              num="08"
              title="Cookies and Tracking Technologies"
            >
              <p className="text-foreground leading-relaxed">
                We use cookies and similar technologies to:
              </p>
              <CheckList items={cookiePurposes} />
              <p className="text-foreground leading-relaxed">
                You may disable cookies through your browser settings, although
                some features may not function properly.
              </p>
            </CardSection>

            {/* ── Section 9 ── */}
            <CardSection id="section-9" num="09" title="Your Privacy Rights">
              <p className="text-foreground leading-relaxed">
                Depending on your location, you may have the right to:
              </p>
              <CheckList items={privacyRights} />
              <p className="text-foreground leading-relaxed">
                To exercise these rights, contact us using the information
                below.
              </p>
            </CardSection>

            {/* ── Section 10 ── */}
            <CardSection
              id="section-10"
              num="10"
              title="International Data Transfers"
            >
              <p className="text-foreground leading-relaxed">
                If you access Gaddr from outside the country where our servers
                are located, your information may be transferred to and
                processed in other jurisdictions. We implement appropriate
                safeguards where required by applicable law.
              </p>
            </CardSection>

            {/* ── Section 11 ── */}
            <CardSection id="section-11" num="11" title="Children&rsquo;s Privacy">
              <p className="text-foreground leading-relaxed">
                Gaddr is not intended for individuals under the age of 13 (or
                the minimum age required by applicable law). We do not knowingly
                collect personal information from children.
              </p>
              <p className="text-foreground leading-relaxed">
                If we become aware that a child has provided personal
                information, we will delete it promptly.
              </p>
            </CardSection>

            {/* ── Section 12 ── */}
            <CardSection id="section-12" num="12" title="Third-Party Links">
              <p className="text-foreground leading-relaxed">
                Our services may contain links to third-party websites or
                services. We are not responsible for their privacy practices or
                content.
              </p>
            </CardSection>

            {/* ── Section 13 ── */}
            <CardSection
              id="section-13"
              num="13"
              title="Changes to This Privacy Policy"
            >
              <p className="text-foreground leading-relaxed">
                We may update this Privacy Policy from time to time.
              </p>
              <p className="text-foreground leading-relaxed">
                When significant changes are made, we will update the
                &ldquo;Last Updated&rdquo; date and notify users where
                appropriate.
              </p>
              <p className="text-foreground leading-relaxed">
                Continued use of Gaddr after changes become effective
                constitutes acceptance of the revised Privacy Policy.
              </p>
            </CardSection>

            {/* ── Section 14 (Contact — highlighted) ── */}
            <section
              id="section-14"
              className="scroll-mt-24 bg-primary/[0.04] border border-primary/20 rounded-xl p-6 md:p-8 space-y-4"
            >
              <div className="flex items-center gap-3">
                <SectionBadge num="14" />
                <h2 className="text-xl font-bold">Contact Us</h2>
              </div>
              <p className="text-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or your
                personal data, please contact us:
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
                We will make reasonable efforts to respond to your request
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
