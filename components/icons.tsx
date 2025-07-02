import { Sun, Moon, User, ChefHat, LogOut, type LucideIcon } from "lucide-react"

type IconKeys = "sun" | "moon" | "user" | "recipe" | "logout"

export const Icons: Record<IconKeys, LucideIcon> = {
  sun: Sun,
  moon: Moon,
  user: User,
  recipe: ChefHat,
  logout: LogOut,
}
