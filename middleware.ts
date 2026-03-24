import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Clear any corrupted Supabase auth cookies that would crash SSR
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")) {
      try {
        const decoded = decodeURIComponent(cookie.value)
        if (decoded.startsWith("[") || decoded.startsWith("{")) {
          JSON.parse(decoded)
        }
      } catch {
        response.cookies.delete(cookie.name)
      }
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
}
