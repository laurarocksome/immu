import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/supabase/admin-check"
import FoodManagement from "./food-management"

export default async function AdminFoodsPage() {
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    redirect("/dashboard")
  }

  return <FoodManagement />
}
