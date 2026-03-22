import { createBrowserClient } from "@supabase/ssr"

export async function isPageVisible(pageKey: string): Promise<boolean> {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "hidden_pages")
      .single()
    
    if (!data) return true
    const hiddenPages: string[] = data.value || []
    return !hiddenPages.includes(pageKey)
  } catch {
    return true // fail open
  }
}
