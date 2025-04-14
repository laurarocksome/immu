import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 app-gradient">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-8">
          <Image src="/images/immu-logo.png" alt="IMMU Logo" width={120} height={120} className="mx-auto" priority />
        </div>

        <h1 className="text-3xl font-bold mb-4 text-primary-color">Welcome to IMMU</h1>

        <p className="mb-8 text-secondary-color">Your personal guide to the Autoimmune Protocol diet</p>

        <div className="space-y-4">
          <Link href="/login" passHref>
            <Button className="w-full gradient-button">Login</Button>
          </Link>

          <Link href="/get-started" passHref>
            <Button className="w-full secondary-button">Get Started</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
