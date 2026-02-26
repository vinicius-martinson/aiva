import { useState, useEffect, useRef } from "react"

/**
 * Custom hook for tracking call duration
 * Returns elapsed seconds and formatted MM:SS string
 * Automatically cleans up interval on unmount
 */
export function useDuration() {
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    // Start interval timer
    intervalRef.current = window.setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)

    // Cleanup function to prevent memory leaks
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Format as MM:SS
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const formatted = `${minutes}:${secs.toString().padStart(2, "0")}`

  return { seconds, formatted }
}
