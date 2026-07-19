import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  try {
    const { userId, message, rating } = await req.json()
    if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 })

    const payload = { user_id: userId || null, message: message.trim(), rating: rating || null, created_at: new Date().toISOString() }
    const filename = `${userId || "anonymous"}/${Date.now()}.json`

    const { error } = await adminClient.storage
      .from("feedback")
      .upload(filename, JSON.stringify(payload, null, 2), { contentType: "application/json" })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
