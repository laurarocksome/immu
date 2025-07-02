"use client"

import * as React from "react"
import { AspectRatio as RadixAspectRatio } from "@radix-ui/react-aspect-ratio"
import { cn } from "@/lib/utils"

/**
 * A thin wrapper around `@radix-ui/react-aspect-ratio`.
 *
 * - `AspectRatio` – preferred, correctly-spelled export
 * - `AspectRadio` – legacy alias kept for backward-compatibility
 */
const AspectRatio = React.forwardRef<
  React.ElementRef<typeof RadixAspectRatio>,
  React.ComponentPropsWithoutRef<typeof RadixAspectRatio>
>(({ className, ...props }, ref) => <RadixAspectRatio ref={ref} className={cn(className)} {...props} />)

AspectRatio.displayName = "AspectRatio"

// Export both names so older code that imported `AspectRadio` still works.
export { AspectRatio, AspectRatio as AspectRadio }
