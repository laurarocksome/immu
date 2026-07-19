import { createClient } from "@supabase/supabase-js"

const userId = process.argv[2]
if (!userId) { console.error("Usage: node seed-90-days.mjs <user_id>"); process.exit(1) }

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ── helpers ──────────────────────────────────────────────────────────────────
function dateStr(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split("T")[0]
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)) }

// Deterministic "random" so re-runs produce the same data
function seededRand(seed) {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
}

// ── config ────────────────────────────────────────────────────────────────────
const TOTAL_DAYS = 90          // day 0 = today, day 89 = start
const ADAPTATION_DAYS = 28
const SYMPTOMS = ["Headache", "Fatigue", "Bloating", "Joint pain", "Skin rash"]

// Skip ~15% of days (no log that day) for realism
const SKIP_DAYS = new Set([3, 7, 12, 18, 25, 31, 38, 44, 52, 59, 65, 71, 78, 83])

// ── 1. diet_info ──────────────────────────────────────────────────────────────
const startDate = dateStr(TOTAL_DAYS - 1)   // 89 days ago
const { error: dietErr } = await supabase.from("diet_info").upsert({
  user_id: userId,
  start_date: startDate,
  adaptation_choice: "yes",
  timeline_days: 90,
  updated_at: new Date().toISOString(),
}, { onConflict: "user_id" })
if (dietErr) { console.error("diet_info error:", dietErr.message); process.exit(1) }
console.log("✓ diet_info set — start_date:", startDate)

// ── 2. user_symptoms ──────────────────────────────────────────────────────────
await supabase.from("user_symptoms").delete().eq("user_id", userId)
const { error: usErr } = await supabase.from("user_symptoms").insert(
  SYMPTOMS.map(symptom => ({ user_id: userId, symptom }))
)
if (usErr) { console.error("user_symptoms error:", usErr.message); process.exit(1) }
console.log("✓ user_symptoms seeded:", SYMPTOMS.join(", "))

// ── 3. daily_logs + symptom_logs ─────────────────────────────────────────────
// Delete existing logs for this user so we start clean
await supabase.from("daily_logs").delete().eq("user_id", userId)
console.log("✓ cleared old daily_logs")

let logsInserted = 0
let symptomRowsInserted = 0

for (let dayIndex = TOTAL_DAYS - 1; dayIndex >= 0; dayIndex--) {
  if (SKIP_DAYS.has(dayIndex)) continue

  const rand = seededRand(dayIndex * 31337)
  const r = rand   // shorthand

  // Progress 0 → 1 as diet improves
  const progress = 1 - dayIndex / (TOTAL_DAYS - 1)

  // mood/sleep improve over time, stress decreases
  const moodBase   = 2 + progress * 2.5
  const sleepBase  = 2 + progress * 2.5
  const stressBase = 4.5 - progress * 3

  const mood   = clamp(Math.round(moodBase   + (r() - 0.5) * 1.5), 1, 5)
  const sleep  = clamp(Math.round(sleepBase  + (r() - 0.5) * 1.5), 1, 5)
  const stress = clamp(Math.round(stressBase + (r() - 0.5) * 1.5), 1, 5)

  // Mostly compliant; a few slip-ups early on
  const aip_compliant = dayIndex > 60 ? r() > 0.25 : r() > 0.05

  const logDate = dateStr(dayIndex)

  const { data: logRow, error: logErr } = await supabase
    .from("daily_logs")
    .insert({ user_id: userId, log_date: logDate, mood, sleep, stress, aip_compliant, on_period: false, notes: null })
    .select("id")
    .single()

  if (logErr) { console.error(`daily_log error day ${dayIndex}:`, logErr.message); continue }
  logsInserted++

  // Symptoms: severity starts high, fades over time; not every symptom every day
  const symptomRows = []
  for (const symptom of SYMPTOMS) {
    const r2 = seededRand(dayIndex * 999 + symptom.length * 7)
    // Chance of this symptom appearing decreases with progress
    const appearsChance = 0.85 - progress * 0.65
    if (r2() > appearsChance) continue
    const severityBase = 4.5 - progress * 3.2
    const severity = clamp(Math.round(severityBase + (r2() - 0.5) * 1.5), 1, 5)
    symptomRows.push({ daily_log_id: logRow.id, symptom, severity })
  }

  if (symptomRows.length > 0) {
    const { error: sErr } = await supabase.from("symptom_logs").insert(symptomRows)
    if (sErr) console.error(`symptom_logs error day ${dayIndex}:`, sErr.message)
    else symptomRowsInserted += symptomRows.length
  }
}

console.log(`✓ daily_logs inserted: ${logsInserted}`)
console.log(`✓ symptom_logs inserted: ${symptomRowsInserted}`)
console.log("Done! demo@immu.health now has 90 days of realistic AIP data.")
