import { isAdmin } from "@/lib/supabase/admin-check"
import { redirect } from "next/navigation"
import FAQManagement from "./faq-management"

export default async function AdminFAQsPage() {
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    redirect("/admin")
  }

  return <FAQManagement />
}
