"use client"

import Link from "next/link"
import Logo from "@/app/components/logo"
import { useLanguage } from "@/lib/i18n/context"

export default function TermsPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      <header className="p-4 flex justify-center items-center bg-brand-dark text-white">
        <Logo />
      </header>

      <main className="flex-1 px-4 py-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{t("terms.title", "Terms & Conditions")}</h1>
            <p className="text-sm text-brand-dark/70">
              {t("terms.effectiveDate", "Effective Date: 2025.02.15")}
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-6 mb-6">
            <p>
              {t(
                "terms.intro1",
                "Welcome to Immu Health — a wellness app designed to help users track their health journey through the Autoimmune Protocol (AIP) diet.",
              )}
            </p>
            <p>
              {t(
                "terms.intro2",
                "By using this app, you agree to the following terms and conditions. If you do not agree, please do not use the app.",
              )}
            </p>

            <div>
              <h2 className="text-xl font-semibold mb-2">{t("terms.s1.title", "1. Use of the App")}</h2>
              <p>
                {t(
                  "terms.s1.body1",
                  "Immu Health is intended for informational and self-tracking purposes only. It is not a medical device or a substitute for professional healthcare advice. You are responsible for how you use the information provided by the app.",
                )}
              </p>
              <p className="mt-2">
                {t(
                  "terms.s1.body2",
                  "If you have a medical condition or are taking medication, please consult your doctor before starting any diet or lifestyle change.",
                )}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">{t("terms.s2.title", "2. Data & Privacy")}</h2>
              <p>
                {t(
                  "terms.s2.body1",
                  "We respect your privacy. Immu Health may collect and store data you input (such as food logs, symptoms, or preferences) to provide a personalized experience.",
                )}
              </p>
              <p className="mt-2">
                {t(
                  "terms.s2.body2Prefix",
                  "We do not share your personal data with third parties unless required by law. For more details, please refer to our",
                )}{" "}
                <Link href="/privacy" className="text-pink-500 hover:underline">
                  {t("terms.s2.privacyLink", "Privacy Policy")}
                </Link>
                .
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">{t("terms.s3.title", "3. Account and Access")}</h2>
              <p>
                {t(
                  "terms.s3.body1",
                  "To access some features, you may need to create an account. You are responsible for keeping your login information secure.",
                )}
              </p>
              <p className="mt-2">
                {t(
                  "terms.s3.body2",
                  "We reserve the right to suspend or terminate accounts that violate these terms or are used for malicious purposes.",
                )}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">{t("terms.s4.title", "4. Intellectual Property")}</h2>
              <p>
                {t(
                  "terms.s4.body",
                  "All content, branding, and design within Immu Health belongs to us unless otherwise stated. You may not copy, distribute, or use any part of the app for commercial purposes without permission.",
                )}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">{t("terms.s5.title", "5. Changes to the App or Terms")}</h2>
              <p>
                {t(
                  "terms.s5.body",
                  "We may update the app or these Terms & Conditions at any time. Continued use of the app after changes are made means you accept the updated terms.",
                )}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">{t("terms.s6.title", "6. Limitation of Liability")}</h2>
              <p>
                {t(
                  "terms.s6.body",
                  'Immu Health is provided "as is" without warranties of any kind. We are not liable for any loss, injury, or damage resulting from your use of the app or reliance on its content.',
                )}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">{t("terms.s7.title", "7. Contact")}</h2>
              <p>
                {t("terms.s7.bodyPrefix", "Questions? Contact us at:")}{" "}
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
              {t("terms.backToSignUp", "Back to Sign Up")}
            </Link>
            <Link href="/privacy" className="px-6 py-2 rounded-full gradient-button">
              {t("terms.privacyPolicy", "Privacy Policy")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
