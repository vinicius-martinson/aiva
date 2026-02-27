import { Wrench, AlertTriangle, Clock, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface ClassifyVisitWidgetProps {
  visitType: string
  issueSummary: string
  urgency: string
  reason: string
}

const urgencyConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  low: { label: "Low", color: "bg-green-100 text-green-700", icon: Clock },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  high: { label: "High", color: "bg-orange-100 text-orange-700", icon: AlertTriangle },
  emergency: { label: "Emergency", color: "bg-red-100 text-red-700", icon: Zap }
}

function formatVisitType(visitType: string): string {
  return visitType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function ClassifyVisitWidget({ visitType, issueSummary, urgency, reason }: ClassifyVisitWidgetProps) {
  const config = urgencyConfig[urgency] ?? urgencyConfig.medium
  const UrgencyIcon = config.icon

  return (
    <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50/50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
          <Wrench className="h-4 w-4 text-purple-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{formatVisitType(visitType)}</p>
        </div>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", config.color)}>
          <UrgencyIcon className="h-3 w-3" />
          {config.label}
        </span>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm text-gray-700">{issueSummary}</p>
        <p className="text-xs text-gray-500">{reason}</p>
      </div>
    </div>
  )
}
