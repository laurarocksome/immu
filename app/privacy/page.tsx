import Link from "next/link"
import Logo from "@/app/components/logo"

export default function PrivacyPolicyPage() {
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
            <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-sm text-brand-dark/70">Effective Date: 2025.02.15</p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-6 mb-6">
            <p>
              Welcome to Immu Health. We respect your privacy and are committed to protecting your personal data. This
              policy explains what information we collect, how we use it, and your rights.
            </p>

            <div>
              <h2 className="text-xl font-semibold mb-2">1. What We Collect</h2>
              <p>When you use Immu Health, we may collect the following data:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Account info: email address, name (if provided)</li>
                <li>Health-related data: food logs, symptoms, wellness tracking inputs, preferences</li>
                <li>Device info: IP address, browser type, operating system</li>
                <li>Usage data: which features you use, frequency, error logs</li>
              </ul>
              <p className="mt-2">We do not collect or store any sensitive medical records or diagnostic data.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">2. How We Use Your Data</h2>
              <p>We use your data to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide core features (e.g. symptom tracking, food logs)</li>
                <li>Personalize your app experience</li>
                <li>Improve the app (analytics, bug fixing)</li>
                <li>Communicate with you (e.g. reminders, feature updates, optional newsletters)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">3. How We Store & Protect Your Data</h2>
              <p>
                Your data is stored securely on trusted third-party services (e.g. Supabase, Vercel). We use encryption
                and access control to protect your information. Only authorized personnel can access your personal data
                — and only when absolutely necessary.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">4. Sharing Your Data</h2>
              <p>We do not sell or share your personal data with third parties.</p>
              <p className="mt-2">We may disclose data only:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>If required by law</li>
                <li>To prevent fraud or protect app security</li>
                <li>If you explicitly consent (e.g. optional integrations or research features)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">5. Your Rights (Especially for EU Users – GDPR)</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Access your data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Withdraw consent at any time</li>
                <li>Lodge a complaint with a data protection authority</li>
              </ul>
              <p className="mt-2">
                To exercise your rights, contact us at{" "}
                <a href="mailto:info@rocksome.com" className="text-pink-500 hover:underline">
                  info@rocksome.com
                </a>
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">6. Cookies & Tracking</h2>
              <p>
                We may use cookies or similar technologies to analyze app usage and improve performance. You can control
                cookie preferences through your browser or device settings.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">7. Children's Privacy</h2>
              <p>
                Immu Health is not intended for users under the age of 16 (or 13 in the US). We do not knowingly collect
                personal data from children.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">8. Updates to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. If changes are significant, we'll notify you
                through the app or email.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">9. Contact Us</h2>
              <p>
                If you have questions or requests about your data, contact us at{" "}
                <a href="mailto:info@rocksome.com" className="text-pink-500 hover:underline">
                  info@rocksome.com
                </a>
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <Link
              href="/terms"
              className="px-6 py-2 rounded-full border border-pink-400 text-pink-500 hover:bg-pink-50"
            >
              Back to Terms
            </Link>
            <Link href="/onboarding/create-account" className="px-6 py-2 rounded-full gradient-button">
              Back to Sign Up
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
