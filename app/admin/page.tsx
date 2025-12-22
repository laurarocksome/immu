import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/supabase/admin-check"
import AdminDashboard from "./admin-dashboard"

export default async function AdminPage() {
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    redirect("/dashboard")
  }

  return <AdminDashboard />
}
