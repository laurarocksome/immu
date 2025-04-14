import Link from "next/link"
import Logo from "@/app/components/logo"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 flex justify-center items-center bg-brand-dark text-white">
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
            <p className="text-sm text-brand-dark/70">Effective Date: 2025.02.15</p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-6 mb-6">
            <p>
              Welcome to Immu Health — a wellness app designed to help users track their health journey through the
              Autoimmune Protocol (AIP) diet.
            </p>
            <p>
              By using this app, you agree to the following terms and conditions. If you do not agree, please do not use
              the app.
            </p>

            <div>
              <h2 className="text-xl font-semibold mb-2">1. Use of the App</h2>
              <p>
                Immu Health is intended for informational and self-tracking purposes only. It is not a medical device or
                a substitute for professional healthcare advice. You are responsible for how you use the information
                provided by the app.
              </p>
              <p className="mt-2">
                If you have a medical condition or are taking medication, please consult your doctor before starting any
                diet or lifestyle change.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">2. Data & Privacy</h2>
              <p>
                We respect your privacy. Immu Health may collect and store data you input (such as food logs, symptoms,
                or preferences) to provide a personalized experience.
              </p>
              <p className="mt-2">
                We do not share your personal data with third parties unless required by law. For more details, please
                refer to our{" "}
                <Link href="/privacy" className="text-pink-500 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">3. Account and Access</h2>
              <p>
                To access some features, you may need to create an account. You are responsible for keeping your login
                information secure.
              </p>
              <p className="mt-2">
                We reserve the right to suspend or terminate accounts that violate these terms or are used for malicious
                purposes.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">4. Intellectual Property</h2>
              <p>
                All content, branding, and design within Immu Health belongs to us unless otherwise stated. You may not
                copy, distribute, or use any part of the app for commercial purposes without permission.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">5. Changes to the App or Terms</h2>
              <p>
                We may update the app or these Terms & Conditions at any time. Continued use of the app after changes
                are made means you accept the updated terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">6. Limitation of Liability</h2>
              <p>
                Immu Health is provided "as is" without warranties of any kind. We are not liable for any loss, injury,
                or damage resulting from your use of the app or reliance on its content.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">7. Contact</h2>
              <p>
                Questions? Contact us at:{" "}
                <a href="mailto:info@rocksome.com" className="text-pink-500 hover:underline">
                  info@rocksome.com
                </a>
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <Link
              href="/onboarding/create-account"
              className="px-6 py-2 rounded-full border border-pink-400 text-pink-500 hover:bg-pink-50"
            >
              Back to Sign Up
            </Link>
            <Link href="/privacy" className="px-6 py-2 rounded-full gradient-button">
              Privacy Policy
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
