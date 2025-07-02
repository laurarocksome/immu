export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          gender: "male" | "female" | "other" | "prefer_not_to_say" | null
          age: number | null
          weight: number | null
          weight_unit: "lbs" | "kg" | null
          height_feet: number | null
          height_inches: number | null
          height_cm: number | null
          height_unit: "ft_in" | "cm" | null
          diet_timeline: "first_time" | "tried_before" | "currently_on" | null
          adaptation_period: number | null
          conditions: string[] | null
          stress_level: "low" | "moderate" | "high" | null
          activity_level:
            | "sedentary"
            | "lightly_active"
            | "moderately_active"
            | "very_active"
            | "extremely_active"
            | null
          caffeine_habit: "none" | "occasional" | "daily_1_2" | "daily_3_plus" | null
          alcohol_habit: "none" | "occasional" | "weekly" | "daily" | null
          sugar_habit: "low" | "moderate" | "high" | null
          vegetable_habit: "low" | "moderate" | "high" | null
          is_athlete: boolean | null
          athlete_info: Json | null
          onboarding_completed: boolean | null
          diet_start_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          gender?: "male" | "female" | "other" | "prefer_not_to_say" | null
          age?: number | null
          weight?: number | null
          weight_unit?: "lbs" | "kg" | null
          height_feet?: number | null
          height_inches?: number | null
          height_cm?: number | null
          height_unit?: "ft_in" | "cm" | null
          diet_timeline?: "first_time" | "tried_before" | "currently_on" | null
          adaptation_period?: number | null
          conditions?: string[] | null
          stress_level?: "low" | "moderate" | "high" | null
          activity_level?:
            | "sedentary"
            | "lightly_active"
            | "moderately_active"
            | "very_active"
            | "extremely_active"
            | null
          caffeine_habit?: "none" | "occasional" | "daily_1_2" | "daily_3_plus" | null
          alcohol_habit?: "none" | "occasional" | "weekly" | "daily" | null
          sugar_habit?: "low" | "moderate" | "high" | null
          vegetable_habit?: "low" | "moderate" | "high" | null
          is_athlete?: boolean | null
          athlete_info?: Json | null
          onboarding_completed?: boolean | null
          diet_start_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          gender?: "male" | "female" | "other" | "prefer_not_to_say" | null
          age?: number | null
          weight?: number | null
          weight_unit?: "lbs" | "kg" | null
          height_feet?: number | null
          height_inches?: number | null
          height_cm?: number | null
          height_unit?: "ft_in" | "cm" | null
          diet_timeline?: "first_time" | "tried_before" | "currently_on" | null
          adaptation_period?: number | null
          conditions?: string[] | null
          stress_level?: "low" | "moderate" | "high" | null
          activity_level?:
            | "sedentary"
            | "lightly_active"
            | "moderately_active"
            | "very_active"
            | "extremely_active"
            | null
          caffeine_habit?: "none" | "occasional" | "daily_1_2" | "daily_3_plus" | null
          alcohol_habit?: "none" | "occasional" | "weekly" | "daily" | null
          sugar_habit?: "low" | "moderate" | "high" | null
          vegetable_habit?: "low" | "moderate" | "high" | null
          is_athlete?: boolean | null
          athlete_info?: Json | null
          onboarding_completed?: boolean | null
          diet_start_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
