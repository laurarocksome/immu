"use client"

import * as React from "react"
import { AspectRatio as RadixAspectRatio } from "@radix-ui/react-aspect-ratio"
import { cn } from "@/lib/utils"

/**
 * A thin wrapper around `@radix-ui/react-aspect-ratio`
 * plus the legacy alias **AspectRadio** required by older code.
 */
export interface AspectRatioProps extends React.ComponentPropsWithoutRef<typeof RadixAspectRatio> {}

const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(({ className, ...props }, ref) => (
  <RadixAspectRatio ref={ref} className={cn(className)} {...props} />
))

AspectRatio.displayName = "AspectRatio"

/**
 * Legacy miss-spelling kept for backwards compatibility.
 *
 * Example usage elsewhere in the codebase:
 *   import { AspectRadio } from "@/components/ui/aspect-ratio"
 */
const AspectRadio = AspectRatio

export { AspectRatio, AspectRadio }
