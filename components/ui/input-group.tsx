import type * as React from "react"
import { cn } from "@/lib/utils"

export function InputGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-stretch rounded-md", className)} {...props} />
}

export function InputLeftAddon({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

export function InputRightAddon({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 rounded-r-md border border-l-0 bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}
