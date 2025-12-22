import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/supabase/admin-check"
import NutritionManagement from "./nutrition-management"

export default async function AdminNutritionPage() {
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    redirect("/dashboard")
  }

  return <NutritionManagement />
}
