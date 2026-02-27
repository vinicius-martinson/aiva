import { Trophy, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CallAnalysisWidgetProps {
  data: {
    overall_score: number
    summary: string
    strengths: string[]
    improvements: string[]
    next_steps: string[]
  }
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 7
      ? "bg-emerald-100 text-emerald-700 border-emerald-300"
      : score >= 5
        ? "bg-amber-100 text-amber-700 border-amber-300"
        : "bg-red-100 text-red-700 border-red-300"

  return (
    <div className={cn("flex items-center justify-center w-14 h-14 rounded-xl border-2 font-bold text-2xl", color)}>
      {score}
    </div>
  )
}

export function CallAnalysisWidget({ data }: CallAnalysisWidgetProps) {
  return (
    <div className="mt-3 space-y-4 rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Call Performance Analysis</h3>
        </div>
        <ScoreBadge score={data.overall_score} />
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>

      {/* Strengths */}
      {data.strengths.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Strengths</p>
          <ul className="space-y-1">
            {data.strengths.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {data.improvements.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Areas for Improvement</p>
          <ul className="space-y-1">
            {data.improvements.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Steps */}
      {data.next_steps.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Next Steps</p>
          <ul className="space-y-1">
            {data.next_steps.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
