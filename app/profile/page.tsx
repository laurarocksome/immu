"use client"


export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useLanguage } from "@/lib/i18n/context"
import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, ArrowLeft, Edit, Trash2, ChevronRight, Salad } from "lucide-react"
import Logo from "@/app/components/logo"
import BottomNav from "@/app/components/bottom-nav"
import { deleteUser, signOut } from "@/lib/auth"
import { createClient } from "@/lib/supabase/client"

type UserProfile = {
  gender: string
  age: number
  weight: number
  weightUnit: string
  height: number
  heightUnit: string
}

type DietInfo = {
  timelineDays: number
  adaptationPeriod: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const { locale, setLocale, t, translations } = useLanguage()
  const [userName, setUserName] = useState<string>("")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [dietInfo, setDietInfo] = useState<DietInfo | null>(null)
  const [conditions, setConditions] = useState<string[]>([])
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [needsSync, setNeedsSync] = useState(false)
  const [hiddenPages, setHiddenPages] = useState<string[]>([])

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const supabase = createClient()
        console.log("[v0] Starting to load user data")
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        console.log("[v0] User:", user ? `User ID: ${user.id}` : "No user", "Error:", userError)

        if (user) {
          const userId = user.id
          let loadedProfile: UserProfile | null = null
          let loadedDietInfo: DietInfo | null = null
          let loadedConditions: string[] = []
          let loadedSymptoms: string[] = []

          const { data: userData } = await supabase.from("users").select("name").eq("id", userId).single()
          console.log("[v0] User name data:", userData)

          if (userData?.name) {
            setUserName(userData.name)
          }

          const { data: profileData, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", userId)
            .single()
          console.log("[v0] Profile data from DB:", profileData, "Error:", profileError)

          if (profileData) {
            loadedProfile = {
              gender: profileData.gender || "",
              age: profileData.age || 0,
              weight: profileData.weight || 0,
              weightUnit: profileData.weight_unit || "kg",
              height: profileData.height || 0,
              heightUnit: profileData.height_unit || "cm",
            }
            console.log("[v0] Loaded profile from DB:", loadedProfile)
          }

          const { data: dietData, error: dietError } = await supabase
            .from("diet_info")
            .select("*")
            .eq("user_id", userId)
            .single()
          console.log("[v0] Diet data from DB:", dietData, "Error:", dietError)

          if (dietData) {
            loadedDietInfo = {
              timelineDays: dietData.timeline_days || 0,
              adaptationPeriod: dietData.adaptation_choice === "yes",
            }
            console.log("[v0] Loaded diet info from DB:", loadedDietInfo)
          }

          const { data: conditionsData } = await supabase
            .from("user_conditions")
            .select("condition")
            .eq("user_id", userId)
          console.log("[v0] Conditions data from DB:", conditionsData)

          if (conditionsData && conditionsData.length > 0) {
            loadedConditions = [...new Set(conditionsData.map((c) => c.condition))]
          }

          const { data: symptomsData } = await supabase.from("user_symptoms").select("symptom").eq("user_id", userId)
          console.log("[v0] Symptoms data from DB:", symptomsData)

          if (symptomsData && symptomsData.length > 0) {
            loadedSymptoms = [...new Set(symptomsData.map((s) => s.symptom))]
          }

          if (!loadedProfile) {
            console.log("[v0] No profile in DB, checking localStorage")
            const localProfile = JSON.parse(localStorage.getItem("userProfile") || "null")
            if (localProfile) {
              loadedProfile = localProfile
              console.log("[v0] Loaded profile from localStorage")
            }
          }

          if (!loadedDietInfo) {
            console.log("[v0] No diet data in DB, checking localStorage")
            const localDietTimeline = localStorage.getItem("userDietTimeline")
            const localAdaptation = localStorage.getItem("userAdaptationChoice")
            if (localDietTimeline) {
              const timelineDays = localDietTimeline === "not-set" ? 0 : Number.parseInt(localDietTimeline) || 0
              loadedDietInfo = {
                timelineDays: timelineDays,
                adaptationPeriod: localAdaptation === "Yes",
              }
              console.log("[v0] Loaded diet info from localStorage")
            }
          }

          if (loadedConditions.length === 0) {
            const localConditions = JSON.parse(localStorage.getItem("userConditions") || "[]")
            if (localConditions.length > 0) {
              loadedConditions = localConditions
              console.log("[v0] Loaded conditions from localStorage")
            }
          }

          if (loadedSymptoms.length === 0) {
            const localSymptoms = JSON.parse(localStorage.getItem("userSymptoms") || "[]")
            if (localSymptoms.length > 0) {
              loadedSymptoms = localSymptoms
              console.log("[v0] Loaded symptoms from localStorage")
            }
          }

          setProfile(loadedProfile)
          setDietInfo(loadedDietInfo)
          setConditions(loadedConditions)
          setSymptoms(loadedSymptoms)

          console.log("[v0] Loading complete. Final state:", {
            profile: loadedProfile,
            dietInfo: loadedDietInfo,
            conditions: loadedConditions,
            symptoms: loadedSymptoms,
          })
        } else {
          console.log("[v0] No user authenticated, loading from localStorage only")
          const profileData = JSON.parse(localStorage.getItem("userProfile") || "null")
          setProfile(profileData)
          const timeline = localStorage.getItem("userDietTimeline") || "0"
          const timelineDays = timeline === "not-set" ? 0 : Number.parseInt(timeline) || 0
          setDietInfo({
            timelineDays: timelineDays,
            adaptationPeriod: localStorage.getItem("userAdaptationChoice") === "Yes",
          })
          const storedConditions = JSON.parse(localStorage.getItem("userConditions") || "[]")
          setConditions(storedConditions)
          const storedSymptoms = JSON.parse(localStorage.getItem("userSymptoms") || "[]")
          setSymptoms(storedSymptoms)
        }
      } catch (error) {
        console.error("[v0] Error loading user data:", error)
        const profileData = JSON.parse(localStorage.getItem("userProfile") || "null")
        setProfile(profileData)
        const timeline = localStorage.getItem("userDietTimeline") || "0"
        const timelineDays = timeline === "not-set" ? 0 : Number.parseInt(timeline) || 0
        setDietInfo({
          timelineDays: timelineDays,
          adaptationPeriod: localStorage.getItem("userAdaptationChoice") === "Yes",
        })
        const storedConditions = JSON.parse(localStorage.getItem("userConditions") || "[]")
        setConditions(storedConditions)
        const storedSymptoms = JSON.parse(localStorage.getItem("userSymptoms") || "[]")
        setSymptoms(storedSymptoms)
        setUserName(localStorage.getItem("userName") || "")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  useEffect(() => {
    async function loadHiddenPages() {
      try {
        const supabase = createClient()
        const { data } = await supabase.from("app_settings").select("value").eq("key", "hidden_pages").single()
        if (data) setHiddenPages(data.value || [])
      } catch {}
    }
    loadHiddenPages()
  }, [])

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await deleteUser()
      localStorage.clear()
      router.push("/")
    } catch (error) {
      console.error("Error deleting account:", error)
      alert("Failed to delete account. Please try again.")
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
        <p>{t("profile.loading", "Loading profile...")}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      <header className="p-4 border-b border-pink-200/30 flex justify-between items-center bg-gradient-to-r from-pink-300 to-peach-300">
        <button onClick={handleBackToDashboard} className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1.5">
          <ArrowLeft className="h-4 w-4 text-white" />
          <span className="text-sm font-medium text-white">{t("common.back", "Back")}</span>
        </button>
        <Logo variant="light" />
        <div className="w-20"></div>
      </header>

      {/* DEBUG BANNER */}
      <div style={{position:"fixed", top:0, left:0, right:0, zIndex:9999, background:"#0ff", color:"#000", padding:"6px 12px", fontSize:"13px", fontWeight:"bold"}}>
        PROFILE: locale={locale} | keys={Object.keys(translations).length} | title=&quot;{t("profile.title","Your Profile")}&quot;
      </div>
      <div style={{height:"28px"}} />
      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="my-8 text-center">
            <h2 className="text-3xl font-bold mb-2 text-brand-dark">{t("profile.title", "Your Profile")}</h2>
            {userName && <p className="text-brand-dark/60 text-base">{t("profile.welcomeBack", "Welcome back,")} {userName}!</p>}
          </div>

          {/* My Diet — top of page so it's always visible */}
          <button
            onClick={() => router.push("/my-diet")}
            className="w-full bg-white rounded-3xl p-5 mb-4 shadow-soft flex items-center justify-between text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-pink-100 to-peach-100 flex items-center justify-center">
                <Salad className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="font-semibold text-brand-dark">{t("profile.myDiet", "My Diet")}</p>
                <p className="text-brand-dark/50 text-xs mt-0.5">{t("profile.myDiet.status", "AIP — Active")}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-brand-dark/30" />
          </button>

          {profile && (
            <div className="bg-white rounded-3xl p-6 mb-4 shadow-soft">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold text-xl text-brand-dark">{t("profile.personalInfo", "Personal Information")}</h3>
                <button
                  className="text-brand-primary flex items-center gap-1 hover:text-brand-primary/80 transition-colors"
                  onClick={() => router.push("/onboarding/user-profile?edit=true")}
                >
                  <Edit className="h-4 w-4" />
                  <span className="text-sm font-medium">{t("common.edit", "Edit")}</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-brand-dark/50 text-sm font-medium mb-1">{t("profile.gender", "Gender")}</p>
                  <p className="text-brand-dark font-medium">{profile.gender || t("common.notSet", "Not set")}</p>
                </div>
                <div>
                  <p className="text-brand-dark/50 text-sm font-medium mb-1">{t("profile.age", "Age")}</p>
                  <p className="text-brand-dark font-medium">
                    {profile.age ? `${profile.age} ${t("profile.age.years", "years")}` : t("common.notSet", "Not set")}
                  </p>
                </div>
                <div>
                  <p className="text-brand-dark/50 text-sm font-medium mb-1">{t("profile.weight", "Weight")}</p>
                  <p className="text-brand-dark font-medium">
                    {profile.weight ? `${profile.weight} ${profile.weightUnit}` : t("common.notSet", "Not set")}
                  </p>
                </div>
                <div>
                  <p className="text-brand-dark/50 text-sm font-medium mb-1">{t("profile.height", "Height")}</p>
                  <p className="text-brand-dark font-medium">
                    {profile.height ? `${profile.height} ${profile.heightUnit}` : t("common.notSet", "Not set")}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 mb-4 shadow-soft">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-xl text-brand-dark">{t("profile.dietInfo", "Diet Information")}</h3>
              <button
                className="text-brand-primary flex items-center gap-1 hover:text-brand-primary/80 transition-colors"
                onClick={() => router.push("/onboarding/diet-timeline?edit=true")}
              >
                <Edit className="h-4 w-4" />
                <span className="text-sm font-medium">{t("common.edit", "Edit")}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-brand-dark/50 text-sm font-medium mb-1">{t("profile.dietTimeline", "Diet Timeline")}</p>
                <p className="text-brand-dark font-medium">
                  {dietInfo?.timelineDays ? `${dietInfo.timelineDays} ${t("common.days", "days")}` : t("common.notSet", "Not set")}
                </p>
              </div>
              <div>
                <p className="text-brand-dark/50 text-sm font-medium mb-1">{t("profile.adaptationPeriod", "Adaptation Period")}</p>
                <p className="text-brand-dark font-medium">{dietInfo?.adaptationPeriod ? t("common.yes", "Yes") : t("common.no", "No")}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 mb-4 shadow-soft">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-xl text-brand-dark">{t("profile.conditions", "Conditions")}</h3>
              <button
                className="text-brand-primary flex items-center gap-1 hover:text-brand-primary/80 transition-colors"
                onClick={() => router.push("/onboarding/conditions?edit=true")}
              >
                <Edit className="h-4 w-4" />
                <span className="text-sm font-medium">{t("common.edit", "Edit")}</span>
              </button>
            </div>

            <div>
              {conditions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {conditions.map((condition, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-pink-100 to-peach-100 text-brand-dark px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-brand-dark/50">{t("profile.conditions.empty", "No conditions selected")}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 mb-6 shadow-soft">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-xl text-brand-dark">{t("profile.symptoms", "Symptoms to Track")}</h3>
              <button
                className="text-brand-primary flex items-center gap-1 hover:text-brand-primary/80 transition-colors"
                onClick={() => router.push("/onboarding/symptoms?edit=true")}
              >
                <Edit className="h-4 w-4" />
                <span className="text-sm font-medium">{t("common.edit", "Edit")}</span>
              </button>
            </div>

            <div>
              {symptoms.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((symptom, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-pink-100 to-peach-100 text-brand-dark px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-brand-dark/50">{t("profile.symptoms.empty", "No symptoms selected")}</p>
              )}
            </div>
          </div>

          {/* Language Selector */}
          <div className="glass-card rounded-2xl p-6 mb-4">
            <h2 className="text-xl font-semibold mb-4">{t("profile.language", "Language")}</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setLocale("en")}
                className={`flex-1 py-3 rounded-full border-2 font-medium transition-all ${
                  locale === "en" ? "bg-pink-400 border-pink-400 text-white" : "border-pink-200 text-brand-dark"
                }`}
              >
                🇬🇧 EN
              </button>
              <button
                onClick={() => setLocale("lt")}
                className={`flex-1 py-3 rounded-full border-2 font-medium transition-all ${
                  locale === "lt" ? "bg-pink-400 border-pink-400 text-white" : "border-pink-200 text-brand-dark"
                }`}
              >
                🇱🇹 LT
              </button>
            </div>
          </div>

          <a
            href="mailto:laura@rocksome.com?subject=Immu%20Health%20Feedback"
            className="w-full bg-white border-2 border-brand-primary/30 text-brand-primary hover:border-brand-primary/50 hover:shadow-soft py-4 rounded-full transition-all mb-3 font-medium flex items-center justify-center gap-2"
          >
            {t("profile.contact", "Contact Support")}
          </a>

          <button
            onClick={async () => {
              try {
                await signOut()
              } catch (_) {}
              localStorage.clear()
              router.push("/")
            }}
            className="w-full bg-white border-2 border-brand-dark/20 text-brand-dark hover:border-brand-dark/40 hover:shadow-soft py-4 rounded-full transition-all mb-3 font-medium"
          >
            {t("profile.logout", "Log Out")}
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="w-full bg-white border-2 border-red-400/30 text-red-600 hover:border-red-400/50 hover:shadow-soft py-4 rounded-full transition-all flex items-center justify-center gap-2 font-medium"
          >
            <Trash2 className="h-4 w-4" />
            {t("profile.deleteAccount", "Delete Account")}
          </button>
        </div>
      </main>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold mb-2 text-brand-dark">{t("profile.delete.title", "Delete Account?")}</h3>
            <p className="text-brand-dark/60 mb-6 text-sm leading-relaxed">
              {t("profile.delete.description", "This will permanently delete your account and all your data including logs, symptoms, and conditions. This action cannot be undone.")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 bg-white border-2 border-brand-dark/20 text-brand-dark hover:border-brand-dark/40 py-3 rounded-full transition-all disabled:opacity-50 font-medium"
              >
                {t("common.cancel", "Cancel")}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white hover:bg-red-700 py-3 rounded-full transition-colors disabled:opacity-50 font-medium shadow-soft"
              >
                {isDeleting ? t("profile.delete.deleting", "Deleting...") : t("profile.delete.confirm", "Delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
