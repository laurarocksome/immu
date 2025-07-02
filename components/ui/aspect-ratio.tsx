import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Keeps its children inside a fixed aspect-ratio box.
 *
 * ratio = width / height.  Example: 16 / 9 = 1.777…
 */
export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number
}

const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 1, style, className, children, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        ...style,
        position: "relative",
        width: "100%",
        paddingBottom: `${100 / ratio}%`,
      }}
      className={cn("relative w-full overflow-hidden", className)}
      {...props}
    >
      <div className="absolute inset-0">{children}</div>
    </div>
  ),
)
AspectRatio.displayName = "AspectRatio"

export { AspectRatio }
/* ------------------------------------------------------------------ */
/* Some code still (incorrectly) asks for `AspectRadio`.               */
/* Re-exporting keeps compatibility while you clean up other files.    */
export { AspectRatio as AspectRadio }
