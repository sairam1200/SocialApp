export default function TermsOfServicePage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <p className="mb-4">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Acceptance of Terms</h2>
        <p>
          By accessing or using our services, you agree to be bound by these
          Terms of Service and all applicable laws and regulations.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Accounts</h2>
        <p>
          You are responsible for maintaining the security of your account and
          any activities performed under your account.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Facebook Login</h2>
        <p>
          Our application may allow users to authenticate using Facebook Login.
          By using Facebook Login, you authorize us to access information
          permitted by Facebook and approved by you.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Privacy</h2>
        <p>
          Your use of the service is also governed by our Privacy Policy.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Limitation of Liability</h2>
        <p>
          We provide the service on an as is basis and are not liable for any
          indirect, incidental, or consequential damages.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. Continued use
          of the service constitutes acceptance of updated terms.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Contact</h2>
        <p>
          For questions regarding these Terms, contact us at:
          {" "}
          <a
            href="mailto:support@yourdomain.com"
            className="text-blue-600 underline"
          >
            support@yourdomain.com
          </a>
        </p>
      </section>
    </main>
  );
}