import { useState } from "react"
import { Calendar, FileText, ClipboardList, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useChat } from "@/contexts/ChatContext"
import { FlowState } from "@/types/booking"

interface ScheduleTypeWidgetProps {
  messageId: string
  options: Array<{ id: string; label: string; description: string }>
  locked?: boolean
}

// Map option IDs to lucide icons
const iconMap: Record<string, typeof Calendar> = {
  job: Calendar,
  estimate: FileText,
  notes_only: ClipboardList
}

export function ScheduleTypeWidget({ messageId, options, locked }: ScheduleTypeWidgetProps) {
  const [selected, setSelected] = useState<string | undefined>()
  const { dispatch } = useChat()

  const handleConfirm = () => {
    if (!selected) return

    // Lock this widget immediately
    dispatch({ type: "LOCK_MESSAGE", payload: { messageId } })

    // Transition state with selected schedule type
    dispatch({
      type: "TRANSITION_STATE",
      payload: {
        nextState: FlowState.AWAITING_ADDRESS,
        data: { scheduleType: selected as "job" | "estimate" | "notes_only" }
      }
    })

    // Trigger typing indicator and AI response
    dispatch({ type: "SET_TYPING", payload: true })

    setTimeout(() => {
      dispatch({ type: "SET_TYPING", payload: false })
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "text",
          content: "What's the service address?",
          timestamp: new Date()
        }
      })
    }, 800)
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Schedule type cards in horizontal row */}
      <div className="flex gap-2">
        {options.map((option) => {
          const Icon = iconMap[option.id] || Calendar
          const isSelected = selected === option.id

          return (
            <button
              key={option.id}
              onClick={() => !locked && setSelected(option.id)}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all",
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50",
                locked && "pointer-events-none cursor-not-allowed opacity-60"
              )}
              disabled={locked}
            >
              <Icon className="h-5 w-5 text-gray-700" />
              <span className="text-sm font-medium text-gray-900">{option.label}</span>

              {/* Checkmark indicator when selected */}
              {isSelected && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Confirm button */}
      <Button
        onClick={handleConfirm}
        disabled={!selected || locked}
        className="w-full"
      >
        Confirm
      </Button>
    </div>
  )
}
