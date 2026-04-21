import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/supabase/admin-check"
import TodoManagement from "./todo-management"

export default async function AdminTodosPage() {
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    redirect("/dashboard")
  }

  return <TodoManagement />
}
