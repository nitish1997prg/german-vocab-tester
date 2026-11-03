import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | German Vocabulary Tester",
  description:
    "Privacy Policy for the German Vocabulary Tester application.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>

      <p className="mb-8 text-sm text-gray-500">
        Last updated: November 3, 2026
      </p>

      <div className="space-y-6 text-gray-800">
        <p>
          <strong>German Vocabulary Tester</strong> is an independent German
          vocabulary learning application. This Privacy Policy explains how
          information is processed when you use the application or its website.
        </p>

        <section>
          <h2 className="mb-3 text-xl font-semibold">1. Information We Process</h2>
          <p className="mb-3">
            German Vocabulary Tester does not require users to create an account
            or provide a name, email address, or password to play vocabulary
            challenges.
          </p>
          <p className="mb-2">When using the application:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Your selected German learning level and vocabulary exclusion
              information are sent to our backend to generate quiz questions.
            </li>
            <li>
              Recently displayed vocabulary words are stored locally on your device
              to help reduce repetition. This history expires according to the
              application&apos;s 24-hour retention logic.
            </li>
            <li>
              Technical information such as network requests, device or browser
              information, and IP addresses may be processed by our hosting and
              security services to operate and protect the application.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">2. AI-Generated Content</h2>
          <p className="mb-3">
            German Vocabulary Tester uses Anthropic&apos;s Claude AI models to generate
            vocabulary questions, answer options, and explanations.
          </p>
          <p className="mb-3">
            Quiz-generation requests are processed through our server. The application&apos;s
            Anthropic API credentials are not exposed to users.
          </p>
          <p>
            AI-generated content may occasionally contain mistakes. Users should not treat
            it as an official language examination or certification resource.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">3. AI-Generated Question Reports</h2>
          <p className="mb-3">
            Users can report inappropriate or incorrect AI-generated vocabulary questions within the application.
          </p>
          <p className="mb-3">
            When a report is submitted, we process the selected reason, German learning level, reported question, answer options, and any associated explanation.
          </p>
          <p className="mb-3">
            Reports are stored using Upstash Redis and automatically expire after 30 days. We also use short-lived, pseudonymous network identifiers to limit abusive report submissions.
          </p>
          <p className="mb-3">
            We do not require users to provide their names or email addresses when reporting questions.
          </p>
          <p>
            Reports are reviewed to identify potential problems and improve the quality and safety of generated vocabulary content.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">4. Third-Party Services</h2>
          <p className="mb-2">The application uses:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Vercel:</strong> Website hosting, server-side API execution, security,
              and operational logging.
            </li>
            <li>
              <strong>Anthropic:</strong> AI-based vocabulary question generation.
            </li>
            <li>
              <strong>Upstash:</strong> Serverless Redis storage for short-term rate limiting and question report retention.
            </li>
          </ul>
          <p className="mt-3">
            These service providers process information as necessary to deliver their respective
            services, subject to their applicable terms and privacy practices.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">5. Local Storage</h2>
          <p className="mb-3">
            The application uses browser <code className="rounded bg-gray-100 px-1">localStorage</code> to remember recently displayed German vocabulary and help avoid repetition.
          </p>
          <p className="mb-3">
            You can remove this locally stored information by clearing the application&apos;s site data.
          </p>
          <p>
            The current version does not provide persistent user accounts or cloud-synchronized learning progress.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">6. Data Security and Retention</h2>
          <p className="mb-3">
            The application uses HTTPS for communication with its website and backend services.
          </p>
          <p>
            Locally stored vocabulary history expires according to the application&apos;s configured retention logic. Question reports in Upstash Redis expire automatically after 30 days. Technical logs and information processed by third-party providers may have different retention periods, depending on their configurations and policies.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">7. Children&apos;s Privacy</h2>
          <p className="mb-3">
            German Vocabulary Tester is a general language-learning application. Its intended age audience will be reflected in the target-audience settings declared on Google Play.
          </p>
          <p>
            The application does not require children or adults to create user accounts to access its core functionality.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">8. Changes to This Policy</h2>
          <p className="mb-3">
            This Privacy Policy may be updated when the application&apos;s features, third-party services, or data-processing practices change.
          </p>
          <p>
            Updates will be published on this page with a revised date.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">9. Contact</h2>
          <p className="mb-2">
            If you have questions about this Privacy Policy or the application&apos;s data practices, contact:
          </p>
          <p>
            <strong>mathnitish1997@gmail.com</strong>
          </p>
        </section>
      </div>

      <Link
        href="/"
        className="mt-8 inline-block text-[#176B63] underline"
      >
        Back to German Vocabulary Tester
      </Link>
    </main>
  );
}