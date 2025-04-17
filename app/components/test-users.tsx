"use client"

import { useRouter } from "next/navigation"

// Define our test user profiles
const testUsers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "test1@example.com",
    gender: "female",
    age: 34,
    weight: 65,
    weightUnit: "kg",
    height: 168,
    heightUnit: "cm",
    conditions: ["Hashimoto's thyroiditis", "Brain fog", "Joint Pain"],
    symptoms: ["Fatigue", "Joint Pain", "Brain Fog", "Digestive Issues", "Headaches"],
    phase: "adaptation",
    day: 10,
    adaptationChoice: "Yes",
    dietTimeline: 90, // total days including adaptation
    description: "Female, Adaptation Phase (Day 10)",
  },
  {
    id: 2,
    name: "Michael Roberts",
    email: "test2@example.com",
    gender: "male",
    age: 42,
    weight: 82,
    weightUnit: "kg",
    height: 180,
    heightUnit: "cm",
    conditions: ["Rheumatoid arthritis", "Chronic migraines"],
    symptoms: ["Joint Pain", "Headache", "Fatigue", "Mood Swings", "Sleep Issues"],
    phase: "elimination",
    day: 45,
    totalDays: 90,
    adaptationChoice: "No",
    dietTimeline: 90,
    description: "Male, Elimination Phase (Day 45/90)",
  },
  {
    id: 3,
    name: "Emily Chen",
    email: "test3@example.com",
    gender: "female",
    age: 29,
    weight: 58,
    weightUnit: "kg",
    height: 162,
    heightUnit: "cm",
    conditions: ["Crohn's disease", "Skin rashes of unknown origin"],
    symptoms: ["Digestive Issues", "Skin Rash", "Bloating", "Fatigue", "Brain Fog"],
    phase: "reintroduction",
    day: 4,
    adaptationChoice: "Yes",
    dietTimeline: 118, // 90 days elimination + 28 days adaptation
    description: "Female, Reintroduction Phase (Day 4)",
  },
]

export default function TestUsers() {
  const router = useRouter()

  const setupTestUser = (user) => {
    // Calculate dates based on the phase and day
    const today = new Date()
    const startDate = new Date()

    if (user.phase === "adaptation") {
      // For adaptation phase, set start date to (current day - day in adaptation)
      startDate.setDate(today.getDate() - user.day)
    } else if (user.phase === "elimination") {
      if (user.adaptationChoice === "Yes") {
        // If they had adaptation, subtract days in elimination + 28 days of adaptation
        startDate.setDate(today.getDate() - user.day - 28)
      } else {
        // Just subtract days in elimination
        startDate.setDate(today.getDate() - user.day)
      }
    } else if (user.phase === "reintroduction") {
      // For reintroduction, they've completed adaptation (if chosen) and elimination
      const adaptationDays = user.adaptationChoice === "Yes" ? 28 : 0
      const eliminationDays = user.dietTimeline - adaptationDays
      startDate.setDate(today.getDate() - user.day - eliminationDays - adaptationDays)
    }

    // Set up user account
    const userAccount = {
      name: user.name,
      email: user.email,
      createdAt: startDate.toISOString(),
    }
    localStorage.setItem("userAccount", JSON.stringify(userAccount))

    // Set up user profile
    const userProfile = {
      gender: user.gender,
      age: user.age,
      weight: user.weight,
      weightUnit: user.weightUnit,
      height: user.height,
      heightUnit: user.heightUnit,
      weightHistory: [
        {
          date: startDate.toISOString(),
          weight: user.weight,
        },
      ],
    }
    localStorage.setItem("userProfile", JSON.stringify(userProfile))

    // Set up conditions and symptoms
    localStorage.setItem("userConditions", JSON.stringify(user.conditions))
    localStorage.setItem("selectedConditions", JSON.stringify(user.conditions))
    localStorage.setItem("userSymptoms", JSON.stringify(user.symptoms))
    localStorage.setItem("selectedSymptoms", JSON.stringify(user.symptoms))

    // Set up diet information
    localStorage.setItem("dietStartDate", startDate.toISOString())
    localStorage.setItem("userDietTimeline", user.dietTimeline.toString())
    localStorage.setItem("userAdaptationChoice", user.adaptationChoice)

    // Set streak days based on phase and day
    let streakDays = 0
    if (user.phase === "adaptation") {
      streakDays = user.day
    } else if (user.phase === "elimination") {
      streakDays = user.day + (user.adaptationChoice === "Yes" ? 28 : 0)
    } else if (user.phase === "reintroduction") {
      const adaptationDays = user.adaptationChoice === "Yes" ? 28 : 0
      const eliminationDays = user.dietTimeline - adaptationDays
      streakDays = user.day + eliminationDays + adaptationDays
    }
    localStorage.setItem("streakDays", streakDays.toString())

    // Clear any existing logs
    localStorage.removeItem("loggedSymptoms")
    localStorage.removeItem("loggedDay")

    // Redirect to dashboard
    router.push("/dashboard")
  }

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-center text-lg font-medium text-brand-dark">Test User Profiles</h3>

      <div className="space-y-3">
        {testUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => setupTestUser(user)}
            className="w-full p-3 rounded-xl border-2 border-dashed border-pink-300 bg-white hover:bg-pink-50 text-left transition-colors"
          >
            <div className="font-medium text-pink-600">{user.name}</div>
            <div className="text-sm text-brand-dark/70">{user.description}</div>
          </button>
        ))}
      </div>

      <p className="text-xs text-center text-brand-dark/60 mt-4">
        These profiles will pre-populate the app with test data
      </p>
    </div>
  )
}
