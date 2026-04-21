"use client"

import Link from "next/link"
import Logo from "@/app/components/logo"
import { useLanguage } from "@/lib/i18n/context"

export default function PrivacyPolicyPage() {
  const { t } = useLanguage()

  const sections = [
    {
      title: t("privacy.s1.title", "1. What We Collect"),
      intro: t("privacy.s1.intro", "When you use Immu Health, we may collect the following data:"),
      items: [
        t("privacy.s1.item1", "Account info: email address, name (if provided)"),
        t("privacy.s1.item2", "Health-related data: food logs, symptoms, wellness tracking inputs, preferences"),
        t("privacy.s1.item3", "Device info: IP address, browser type, operating system"),
        t("privacy.s1.item4", "Usage data: which features you use, frequency, error logs"),
      ],
      outro: t("privacy.s1.outro", "We do not collect or store any sensitive medical records or diagnostic data."),
    },
    {
      title: t("privacy.s2.title", "2. How We Use Your Data"),
      intro: t("privacy.s2.intro", "We use your data to:"),
      items: [
        t("privacy.s2.item1", "Provide core features (e.g. symptom tracking, food logs)"),
        t("privacy.s2.item2", "Personalize your app experience"),
        t("privacy.s2.item3", "Improve the app (analytics, bug fixing)"),
        t("privacy.s2.item4", "Communicate with you (e.g. reminders, feature updates, optional newsletters)"),
      ],
    },
    {
      title: t("privacy.s3.title", "3. How We Store & Protect Your Data"),
      body: t(
        "privacy.s3.body",
        "Your data is stored securely on trusted third-party services (e.g. Supabase, Vercel). We use encryption and access control to protect your information. Only authorized personnel can access your personal data — and only when absolutely necessary.",
      ),
    },
    {
      title: t("privacy.s4.title", "4. Sharing Your Data"),
      body: t("privacy.s4.body", "We do not sell or share your personal data with third parties."),
      intro: t("privacy.s4.intro", "We may disclose data only:"),
      items: [
        t("privacy.s4.item1", "If required by law"),
        t("privacy.s4.item2", "To prevent fraud or protect app security"),
        t("privacy.s4.item3", "If you explicitly consent (e.g. optional integrations or research features)"),
      ],
    },
    {
      title: t("privacy.s5.title", "5. Your Rights (Especially for EU Users – GDPR)"),
      intro: t("privacy.s5.intro", "You have the right to:"),
      items: [
        t("privacy.s5.item1", "Access your data"),
        t("privacy.s5.item2", "Correct inaccurate data"),
        t("privacy.s5.item3", "Delete your account and data"),
        t("privacy.s5.item4", "Withdraw consent at any time"),
        t("privacy.s5.item5", "Lodge a complaint with a data protection authority"),
      ],
      contactPrefix: t("privacy.s5.contactPrefix", "To exercise your rights, contact us at"),
    },
    {
      title: t("privacy.s6.title", "6. Cookies & Tracking"),
      body: t(
        "privacy.s6.body",
        "We may use cookies or similar technologies to analyze app usage and improve performance. You can control cookie preferences through your browser or device settings.",
      ),
    },
    {
      title: t("privacy.s7.title", "7. Children's Privacy"),
      body: t(
        "privacy.s7.body",
        "Immu Health is not intended for users under the age of 16 (or 13 in the US). We do not knowingly collect personal data from children.",
      ),
    },
    {
      title: t("privacy.s8.title", "8. Updates to This Policy"),
      body: t(
        "privacy.s8.body",
        "We may update this Privacy Policy from time to time. If changes are significant, we'll notify you through the app or email.",
      ),
    },
    {
      title: t("privacy.s9.title", "9. Contact Us"),
      contactPrefix: t("privacy.s9.contactPrefix", "If you have questions or requests about your data, contact us at"),
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      <header className="p-4 flex justify-center items-center bg-brand-dark text-white">
        <Logo />
      </header>

      <main className="flex-1 px-4 py-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{t("privacy.title", "Privacy Policy")}</h1>
            <p className="text-sm text-brand-dark/70">
              {t("privacy.effectiveDate", "Effective Date: 2025.02.15")}
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-6 mb-6">
            <p>
              {t(
                "privacy.intro",
                "Welcome to Immu Health. We respect your privacy and are committed to protecting your personal data. This policy explains what information we collect, how we use it, and your rights.",
              )}
            </p>

            {sections.map((s, idx) => (
              <div key={idx}>
                <h2 className="text-xl font-semibold mb-2">{s.title}</h2>
                {s.body && <p>{s.body}</p>}
                {s.intro && <p className={s.body ? "mt-2" : ""}>{s.intro}</p>}
                {s.items && (
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    {s.items.map((it, i) => (
                      <li key={i}>{it}</li>
                    ))}
                  </ul>
                )}
                {s.outro && <p className="mt-2">{s.outro}</p>}
                {s.contactPrefix && (
                  <p className={s.items ? "mt-2" : ""}>
                    {s.contactPrefix}{" "}
                    <a href="mailto:info@rocksome.com" className="text-pink-500 hover:underline">
                      info@rocksome.com
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Link
              href="/terms"
              className="px-6 py-2 rounded-full border border-pink-400 text-pink-500 hover:bg-pink-50"
            >
              {t("privacy.backToTerms", "Back to Terms")}
            </Link>
            <Link href="/onboarding/create-account" className="px-6 py-2 rounded-full gradient-button">
              {t("privacy.backToSignUp", "Back to Sign Up")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
