import Link from "next/link"
import Logo from "@/app/components/logo"

export default function DevMode() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-lightest to-white text-brand-dark p-4">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="bg-brand-dark p-4 rounded-2xl">
          <Logo />
        </div>

        {/* Main content */}
        <div className="w-full space-y-6">
          <h2 className="text-2xl font-semibold text-center">Developer Mode</h2>

          <div className="glass-card rounded-2xl p-6 space-y-4">
            <Link href="/dashboard" className="block w-full">
              <button className="w-full gradient-button py-4 rounded-full">Skip to Dashboard</button>
            </Link>

            <Link href="/onboarding/conditions" className="block w-full">
              <button className="w-full gradient-button py-4 rounded-full">Start Onboarding</button>
            </Link>

            <Link href="/login" className="block w-full">
              <button className="w-full gradient-button py-4 rounded-full">Login Flow</button>
            </Link>

            <Link href="/" className="block w-full">
              <button className="w-full border border-brand-dark/30 text-brand-dark hover:bg-white/50 py-4 rounded-full transition-colors">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
