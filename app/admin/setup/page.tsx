"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

export default function AdminSetupPage() {
  const [user, setUser] = useState<any>(null)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState("")
  const [setupComplete, setSetupComplete] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    checkUserAndAdmin()
  }, [])

  async function checkUserAndAdmin() {
    try {
      console.log("[v0] Checking user authentication...")
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("You must be logged in to access admin features. Please log in first.")
        setIsCheckingAdmin(false)
        return
      }

      setUser(user)
      console.log("[v0] User found:", user.email)

      // Check if admin_users table exists and if user is admin
      console.log("[v0] Checking admin status...")
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (adminError) {
        if (adminError.code === "PGRST116") {
          setError("No admin record found. Run the setup instructions below.")
        } else if (adminError.message.includes("relation") || adminError.message.includes("does not exist")) {
          setError("Admin tables not set up yet. Run the SQL scripts first.")
        } else {
          setError(`Error checking admin status: ${adminError.message}`)
        }
        console.log("[v0] Admin check error:", adminError)
      } else if (adminData) {
        console.log("[v0] User is admin!")
        setIsAdmin(true)
        // Redirect to admin dashboard after 2 seconds
        setTimeout(() => {
          router.push("/admin")
        }, 2000)
      }
    } catch (err: any) {
      console.error("[v0] Error in admin setup:", err)
      setError(`Unexpected error: ${err.message}`)
    } finally {
      setIsCheckingAdmin(false)
    }
  }

  async function makeUserAdmin() {
    if (!user) return

    try {
      const { error: insertError } = await supabase.from("admin_users").insert({
        user_id: user.id,
        email: user.email,
      })

      if (insertError) {
        setError(`Failed to add admin user: ${insertError.message}`)
        console.error("[v0] Insert error:", insertError)
      } else {
        setSetupComplete(true)
        setTimeout(() => {
          router.push("/admin")
        }, 2000)
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`)
    }
  }

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-brand-navy text-lg">Checking admin access...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-brand-navy mb-2">Admin Access Confirmed</h2>
          <p className="text-gray-600">Redirecting to admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (setupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-brand-navy mb-2">Admin Access Granted!</h2>
          <p className="text-gray-600">Redirecting to admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent p-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-brand-navy mb-6">Admin Setup</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Setup Required</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>Logged in as:</strong> {user.email}
              </p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-brand-navy mb-3">Step 1: Create Database Tables</h2>
              <p className="text-gray-600 mb-4">
                Run these SQL scripts in your Supabase SQL editor or from the v0 scripts folder:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <code className="text-sm text-gray-800">scripts/001_create_admin_tables.sql</code>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <code className="text-sm text-gray-800">scripts/002_seed_admin_user.sql</code>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Note: Update the email in the seed script to match your login email before running it.
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-brand-navy mb-3">Step 2: Grant Admin Access</h2>
              <p className="text-gray-600 mb-4">
                After running the scripts above, click this button to verify your admin access:
              </p>
              <button
                onClick={checkUserAndAdmin}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Check Admin Status
              </button>
            </div>

            {user && error.includes("No admin record found") && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold text-brand-navy mb-3">Quick Setup (Alternative)</h2>
                <p className="text-gray-600 mb-4">
                  If you've already run the SQL scripts to create the tables, click below to add yourself as an admin:
                </p>
                <button
                  onClick={makeUserAdmin}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Make Me Admin
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
