import { useEffect, useState, type ReactNode } from "react"
import { Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AiInsightBubbleProps {
  children: ReactNode
  message: string
  show: boolean
  delayMs?: number
}

export function AiInsightBubble({
  children,
  message,
  show,
  delayMs = 0,
}: AiInsightBubbleProps) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (show && !dismissed) {
      const timer = setTimeout(() => setVisible(true), delayMs)
      return () => clearTimeout(timer)
    }
    setVisible(false)
  }, [show, dismissed, delayMs])

  useEffect(() => {
    if (show) setDismissed(false)
  }, [show])

  const active = visible && !dismissed

  return (
    <div className="relative">
      <div
        className={cn(
          "rounded-lg transition-all duration-500 ease-out",
          active && "ring-2 ring-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
        )}
      >
        {children}
      </div>

      <div
        className={cn(
          "absolute right-2 bottom-full mb-2 z-10 w-fit max-w-md transition-all duration-500 ease-out",
          active
            ? "opacity-100 translate-y-0"
            : "opacity-0 pointer-events-none translate-y-2"
        )}
      >
        <div className="bg-white rounded-lg border border-purple-200 shadow-lg px-3 py-2 flex items-start gap-2 border-l-4 border-l-purple-500">
          <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700 leading-snug">{message}</p>
          <button
            onClick={() => setDismissed(true)}
            className="ml-1 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
