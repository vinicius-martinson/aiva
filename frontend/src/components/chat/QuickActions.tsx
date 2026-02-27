import { Button } from "@/components/ui/button"
import { Calendar, FileText, CalendarDays } from "lucide-react"
import { useChat } from "@/contexts/ChatContext"

const actions = [
  { id: "schedule_job", label: "Schedule a Job", icon: Calendar },
  { id: "create_estimate", label: "Create Estimate", icon: FileText },
  { id: "view_calendar", label: "View Calendar", icon: CalendarDays }
] as const

export function QuickActions() {
  const { dispatch, sendText } = useChat()

  const handleAction = (label: string) => {
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

    dispatch({ type: "USE_QUICK_ACTION" })
    sendText(label)
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
            className="flex items-center gap-1.5 text-xs h-8 rounded-full border-gray-300 hover:border-purple-500 hover:text-purple-500 transition-colors"
          >
            <Icon className="h-3.5 w-3.5" />
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}
