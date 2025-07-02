"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Calendar, Clock, TrendingUp, User, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LogoutButton } from "@/app/components/logout-button"
import { useAuth } from "@/hooks/use-auth"

interface WellnessEntry {
  date: string
  score: number
  symptoms: string[]
  notes: string
}

export default function Dashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [wellnessData, setWellnessData] = useState<WellnessEntry[]>([])
  const [currentPhase, setCurrentPhase] = useState<"elimination" | "reintroduction" | "maintenance">("elimination")
  const [daysInPhase, setDaysInPhase] = useState(0)

  /* ------------------------------------------------------------------ */
  /* Load persisted data & compute the current phase                    */
  useEffect(() => {
    setWellnessData(JSON.parse(localStorage.getItem("wellnessData") ?? "[]"))

    const dietStartDate = localStorage.getItem("dietStartDate")
    if (!dietStartDate) return

    const diffDays = Math.ceil((Date.now() - new Date(dietStartDate).getTime()) / (1000 * 60 * 60 * 24)) || 0
    setDaysInPhase(diffDays)

    if (diffDays <= 30) setCurrentPhase("elimination")
    else if (diffDays <= 60) setCurrentPhase("reintroduction")
    else setCurrentPhase("maintenance")
  }, [])

  if (loading) return null /* Suspense fallback is in `loading.tsx` */

  /* Helpers ----------------------------------------------------------- */
  const latestWellness = wellnessData.at(-1)?.score ?? 0
  const phaseProgress = (() => {
    if (currentPhase === "elimination") return Math.min((daysInPhase / 30) * 100, 100)
    if (currentPhase === "reintroduction") return Math.min(((daysInPhase - 30) / 30) * 100, 100)
    return 100
  })()
  const phaseBlurb =
    currentPhase === "elimination"
      ? "Focus on removing inflammatory foods"
      : currentPhase === "reintroduction"
        ? "Gradually reintroduce foods one at a time"
        : "Maintain your personalized diet"

  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* ----------  Header  ---------- */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-green-800">ImmuHealth</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email ?? "Welcome back!"}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* ----------  Main  ---------- */}
      <main className="mx-auto max-w-7xl space-y-10 px-4 py-8">
        <section>
          <h2 className="mb-1 text-3xl font-bold text-gray-900">Your AIP Journey</h2>
          <p className="text-gray-600">Track your progress and manage your autoimmune protocol</p>
        </section>

        {/* ----------  Stats  ---------- */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Current phase */}
          <StatCard
            title="Current Phase"
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
            value={currentPhase}
            description={phaseBlurb}
            extra={<Progress value={phaseProgress} className="mt-2 h-2 bg-muted/50" />}
          />

          {/* Days in phase */}
          <StatCard
            title="Days in Phase"
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            value={daysInPhase.toString()}
            description={currentPhase === "elimination" ? `${30 - daysInPhase} days remaining` : "Keep going!"}
          />

          {/* Latest wellness */}
          <StatCard
            title="Latest Wellness"
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            value={`${latestWellness}/10`}
            description={wellnessData.length ? "Last recorded" : "No data yet"}
          />

          {/* Total entries */}
          <StatCard
            title="Total Entries"
            icon={<User className="h-4 w-4 text-muted-foreground" />}
            value={wellnessData.length.toString()}
            description="Wellness logs recorded"
          />
        </section>

        {/* ----------  Quick actions  ---------- */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <QuickCard href="/log-day" icon={Plus} title="Log Today" blurb="Record your daily wellness and symptoms" />
          <QuickCard href="/food-list" title="Food List" blurb="Foods allowed in your current phase" />
          <QuickCard href="/recipes" title="Recipes" blurb="Discover AIP-compliant recipes" />
          <QuickCard href="/calendar" title="Calendar" blurb="View your wellness history" />
          <QuickCard href="/nutrition" title="Nutrition Guide" blurb="Learn about each phase" />
          <QuickCard href="/profile" title="Profile" blurb="Manage your account" />
        </section>

        {/* ----------  Recent activity  ---------- */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest wellness entries</CardDescription>
          </CardHeader>
          <CardContent>
            {wellnessData.length ? (
              <div className="space-y-4">
                {wellnessData
                  .slice(-5)
                  .reverse()
                  .map(({ date, score, symptoms }, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                      <div>
                        <p className="font-medium">{new Date(date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">Wellness Score: {score}/10</p>

                        {symptoms.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {symptoms.map((s, idx) => (
                              <Badge key={idx} variant="secondary">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="mb-4 text-gray-500">No wellness entries yet</p>
                <Button asChild>
                  <Link href="/log-day">Log Your First Day</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

/* ==================================================================== */
/* ----------  Small reusable components  ----------------------------- */

interface StatCardProps {
  title: string
  icon: React.ReactNode
  value: string
  description: string
  extra?: React.ReactNode
}
function StatCard({ title, icon, value, description, extra }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold capitalize">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {extra}
      </CardContent>
    </Card>
  )
}

interface QuickCardProps {
  href: string
  title: string
  blurb: string
  icon?: typeof Calendar /* any Lucide icon type */
}
function QuickCard({ href, title, blurb, icon: Icon }: QuickCardProps) {
  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-lg">
      <Link href={href}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5" />} {title}
          </CardTitle>
          <CardDescription>{blurb}</CardDescription>
        </CardHeader>
      </Link>
    </Card>
  )
}
