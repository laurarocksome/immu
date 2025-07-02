"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: Date | null
  onChange: (date: Date | null) => void
}

/**
 * Simple &lt;input type="date" /&gt; wrapper; replace with a fancier
 * calendar later if desired.
 */
export function DatePicker({ value, onChange, className, ...props }: DatePickerProps) {
  return (
    <input
      type="date"
      className={cn("block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2", className)}
      value={value ? value.toISOString().split("T")[0] : ""}
      onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
      {...props}
    />
  )
}
