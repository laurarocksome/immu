import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/supabase/admin-check"
import RecipeManagement from "./recipe-management"

export default async function AdminRecipesPage() {
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    redirect("/dashboard")
  }

  return <RecipeManagement />
}
