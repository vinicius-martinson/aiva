import { useState, useEffect, useRef } from "react"
import { Sparkles, Timer } from "lucide-react"
import { cn } from "@/lib/utils"

const DELAY_MS = 60_000

export function AiTips() {
  const [show, setShow] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (show && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }, [show])

  if (!show) return null

  return (
    <div ref={containerRef} className="space-y-3">
      <div className={cn(
        "flex items-center gap-2 transition-all duration-500 ease-out",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <Sparkles className="h-4 w-4 text-amber-600" />
        <h3 className="text-[13px] font-semibold">AI Tips</h3>
      </div>
      <div className={cn(
        "rounded-lg border-l-2 p-3 space-y-2 bg-amber-50 border-l-amber-600 transition-all duration-500 ease-out",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <div className="flex items-center gap-1.5">
          <Timer className="h-3.5 w-3.5 text-amber-700" />
          <span className="text-xs font-semibold text-amber-700">Long Call Duration</span>
        </div>
        <p className="text-[11px] leading-relaxed text-amber-700">
          This call is exceeding the average duration of 1 minute for IB_HCPA_Staging queue. Consider summarizing the key points and moving toward resolution.
        </p>
      </div>
    </div>
  )
}
