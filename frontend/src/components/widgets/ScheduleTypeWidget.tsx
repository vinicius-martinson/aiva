import { useState } from "react"
import { Calendar, FileText, ClipboardList, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useChat } from "@/contexts/ChatContext"

interface ScheduleTypeWidgetProps {
  messageId: string
  options: Array<{ id: string; label: string; description: string }>
  locked?: boolean
}

const iconMap: Record<string, typeof Calendar> = {
  job: Calendar,
  estimate: FileText,
  notes_only: ClipboardList
}

export function ScheduleTypeWidget({ messageId, options, locked }: ScheduleTypeWidgetProps) {
  const [selected, setSelected] = useState<string | undefined>()
  const { dispatch, sendText } = useChat()

  const handleConfirm = () => {
    if (!selected) return

    const selectedOption = options.find(o => o.id === selected)
    const label = selectedOption?.label ?? selected

    dispatch({ type: "LOCK_MESSAGE", payload: { messageId } })
    sendText(`I'd like to schedule a ${label}`)
  }

  return (
    <div className="mt-3 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {options.map((option) => {
          const Icon = iconMap[option.id] || Calendar
          const isSelected = selected === option.id

          return (
            <button
              key={option.id}
              onClick={() => !locked && setSelected(option.id)}
              className={cn(
                "relative flex flex-col items-center gap-3 rounded-xl border-2 px-4 py-5 transition-all",
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50",
                locked && "pointer-events-none cursor-not-allowed opacity-60"
              )}
              disabled={locked}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                isSelected ? "bg-purple-100" : "bg-gray-100"
              )}>
                <Icon className={cn("h-5 w-5", isSelected ? "text-purple-600" : "text-gray-600")} />
              </div>
              <div className="text-center">
                <span className="text-sm font-semibold text-gray-900 block">{option.label}</span>
                <span className="text-xs text-gray-500 mt-1 block">{option.description}</span>
              </div>

              {isSelected && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>

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
