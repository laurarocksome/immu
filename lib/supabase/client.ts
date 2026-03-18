import { createBrowserClient } from "@supabase/ssr"

// Re-export for other files to use
export { createBrowserClient }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Only create client in browser environment
  if (typeof window === "undefined") {
    // Return a mock client for SSR that will be replaced on client
    return null as unknown as ReturnType<typeof createBrowserClient>
  }
  
  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

// Lazy initialization - only create when accessed in browser
export const supabase = typeof window !== "undefined" ? createClient() : (null as unknown as ReturnType<typeof createBrowserClient>)
