import { Button } from "@/components/ui/button"
import { Calendar, FileText, CalendarDays } from "lucide-react"
import { useChat } from "@/contexts/ChatContext"
import { FlowState } from "@/types/booking"
import { getAIResponse } from "@/lib/mockEngine"

const actions = [
  { id: "schedule_job", label: "Schedule a Job", icon: Calendar },
  { id: "create_estimate", label: "Create Estimate", icon: FileText },
  { id: "view_calendar", label: "View Calendar", icon: CalendarDays }
] as const

export function QuickActions() {
  const { state, dispatch } = useChat()

  const handleAction = (label: string) => {
    // Send as VA message in the chat
    dispatch({
      type: "ADD_MESSAGE",
      payload: {
        id: crypto.randomUUID(),
        role: "user",
        type: "text",
        content: label,
        timestamp: new Date()
      }
    })

    // Mark quick actions as used (buttons disappear)
    dispatch({ type: "USE_QUICK_ACTION" })

    // Show typing indicator
    dispatch({ type: "SET_TYPING", payload: true })

    // Quick actions skip IDLE classification and go straight to CLASSIFYING
    // to produce the schedule type widget in one step
    const response = getAIResponse(FlowState.CLASSIFYING, label, state.bookingData)

    // Simulate typing delay then show response
    setTimeout(() => {
      dispatch({ type: "SET_TYPING", payload: false })
      dispatch({ type: "ADD_MESSAGE", payload: response.message })
      dispatch({
        type: "TRANSITION_STATE",
        payload: { nextState: response.nextState, data: response.data }
      })
    // eslint-disable-next-line react-hooks/purity
    }, Math.floor(Math.random() * 400) + 600)
  }

  return (
    <div className="flex flex-wrap gap-2 ml-11 mt-2">
      {actions.map(action => {
        const Icon = action.icon
        return (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={() => handleAction(action.label)}
            className="flex items-center gap-1.5 text-xs h-8 rounded-full border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            <Icon className="h-3.5 w-3.5" />
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}
