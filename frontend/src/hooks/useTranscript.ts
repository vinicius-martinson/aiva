import { useEffect, useRef } from "react"

const TRANSCRIPT_CHUNKS = [
  "Hi, I'm having an issue with my water heater. It's making a strange noise.",
  "It's at 742 Oak Street in Denver. Could someone come take a look?",
]

export function useTranscript(
  isListening: boolean,
  onChunk: (text: string) => void,
  onComplete: () => void
) {
  const chunkIndexRef = useRef(0)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    // Reset and clear timeout when not listening
    if (!isListening) {
      chunkIndexRef.current = 0
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

    // Start scheduling transcript chunks when listening begins
    function scheduleNext() {
      // Random delay between 8-12 seconds (8000-12000ms)
      const delay = Math.floor(Math.random() * 4000) + 8000

      timeoutRef.current = window.setTimeout(() => {
        const chunk = TRANSCRIPT_CHUNKS[chunkIndexRef.current]

        if (chunk) {
          onChunk(chunk)
          chunkIndexRef.current++

          // After 2 chunks, trigger completion (AI classifying)
          if (chunkIndexRef.current >= 2) {
            onComplete()
          } else {
            // Schedule next chunk
            scheduleNext()
          }
        }
      }, delay)
    }

    scheduleNext()

    // Cleanup timeout on unmount or when listening stops
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [isListening, onChunk, onComplete])
}
