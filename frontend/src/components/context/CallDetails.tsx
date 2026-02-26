import { useDuration } from "@/hooks/useDuration"
import type { CallContext } from "@/types/client"

interface CallDetailsProps {
  callContext: CallContext
}

export function CallDetails({ callContext }: CallDetailsProps) {
  const { formatted } = useDuration()

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">Queue</span>
        <span className="text-xs font-medium">{callContext.queue}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">Duration</span>
        <span className="text-xs font-medium">{formatted}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">Call Type</span>
        <span className="text-xs font-medium">{callContext.callType}</span>
      </div>
    </div>
  )
}
