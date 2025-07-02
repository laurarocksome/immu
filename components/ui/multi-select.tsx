"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

export interface MultiSelectOption {
  label: string
  value: string | number
}

interface MultiSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  options: MultiSelectOption[]
  value: Array<string | number>
  onChange: (value: Array<string | number>) => void
  className?: string
}

/**
 * Lightweight multi-select built on a native &lt;select multiple /&gt; element
 * to satisfy compile-time requirements without extra deps.
 */
export function MultiSelect({ options, value, onChange, className, ...props }: MultiSelectProps) {
  return (
    <select
      multiple
      className={cn("block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2", className)}
      value={value.map(String)}
      onChange={(e) =>
        onChange(
          Array.from(e.target.selectedOptions, (opt) => (isNaN(Number(opt.value)) ? opt.value : Number(opt.value))),
        )
      }
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
