import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 app-gradient">
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center flex-grow">
        <div className="flex flex-col items-center mb-12">
          <Image src="/images/immu-logo.png" alt="IMMU Logo" width={180} height={180} className="mb-6" priority />

          <h1 className="text-4xl font-bold mb-3 text-primary-color">Welcome to IMMU</h1>
          <p className="text-lg text-secondary-color text-center">
            Your personal guide to the Autoimmune Protocol diet
          </p>
        </div>

        <div className="w-full space-y-6">
          <Link href="/login" passHref>
            <Button className="w-full h-14 text-lg gradient-button">Login</Button>
          </Link>

          <Link href="/get-started" passHref>
            <Button className="w-full h-14 text-lg secondary-button">Get Started</Button>
          </Link>
        </div>
      </div>

      <div className="w-full pt-8 opacity-70">
        <p className="text-center text-sm text-secondary-color">Your journey to better health starts here</p>
      </div>
    </main>
  )
}
