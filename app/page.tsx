import Link from "next/link"
import Logo from "@/components/Logo"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Logo with black text */}
        <Logo />

        {/* Main content */}
        <div className="w-full flex flex-col items-center gap-10">
          {/* Heading */}
          <div className="text-center w-full">
            <h2 className="text-lg font-medium text-primary-color tracking-wide">
              TRACK YOUR DIET JOURNEY, MONITOR SYMPTOMS, AND SEE YOUR PROGRESS.
            </h2>
          </div>

          {/* Buttons */}
          <div className="w-full space-y-4 mt-4">
            <Link href="/onboarding/conditions" className="block w-full">
              <button className="w-full py-4 rounded-full gradient-button">Get Started</button>
            </Link>

            <Link href="/login" className="block w-full">
              <button className="w-full py-4 rounded-full secondary-button">Login</button>
            </Link>
          </div>
        </div>

        {/* Dev mode link */}
        <Link href="/dev" className="text-xs text-accent-color hover:underline mt-12">
          Skip (Dev Mode)
        </Link>
      </div>
    </div>
  )
}
