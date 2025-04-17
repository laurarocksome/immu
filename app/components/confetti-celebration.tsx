"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Dynamically import react-confetti to avoid SSR issues
const ReactConfetti = dynamic(() => import("react-confetti"), { ssr: false })

interface ConfettiCelebrationProps {
  active: boolean
  onComplete?: () => void
  duration?: number
}

export default function ConfettiCelebration({ active, onComplete, duration = 3000 }: ConfettiCelebrationProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isActive, setIsActive] = useState(false)

  // Set dimensions on mount and window resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Only run on client
    if (typeof window !== "undefined") {
      updateDimensions()
      window.addEventListener("resize", updateDimensions)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", updateDimensions)
      }
    }
  }, [])

  // Handle active state changes
  useEffect(() => {
    if (active && !isActive) {
      setIsActive(true)

      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        setIsActive(false)
        if (onComplete) onComplete()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [active, duration, onComplete, isActive])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <ReactConfetti
        width={dimensions.width}
        height={dimensions.height}
        recycle={false}
        numberOfPieces={200}
        gravity={0.2}
        colors={["#da83d2", "#c45fbc", "#4d51a0", "#3a3e7a", "#e4a5df"]}
      />
    </div>
  )
}
