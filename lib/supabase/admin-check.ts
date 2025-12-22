import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server component
        }
      },
    },
  })

  const userClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Server component
          }
        },
      },
    },
  )

  try {
    const {
      data: { user },
    } = await userClient.auth.getUser()

    if (!user) {
      console.log("[v0] Admin check: No user found")
      return false
    }

    console.log("[v0] Admin check: User found:", user.email)

    const { data, error } = await supabase.from("admin_users").select("id").eq("user_id", user.id).single()

    if (error) {
      console.log("[v0] Admin check error:", error.message)
      return false
    }

    if (!data) {
      console.log("[v0] Admin check: No admin record found")
      return false
    }

    console.log("[v0] Admin check: User is admin!")
    return true
  } catch (err: any) {
    console.error("[v0] Admin check exception:", err)
    return false
  }
}
