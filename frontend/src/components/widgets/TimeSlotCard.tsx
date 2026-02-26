import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeSlotCardProps {
  slot: { id: string; datetime: string; duration: string }
  selected: boolean
  disabled: boolean
  onSelect: (id: string) => void
}

export function TimeSlotCard({ slot, selected, disabled, onSelect }: TimeSlotCardProps) {
  // Parse ISO datetime string
  const date = new Date(slot.datetime)

  // Format date: "Monday, Mar 3"
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  })

  // Format start time: "9:00 AM"
  const startTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  })

  // Calculate end time by adding duration hours
  const durationHours = parseInt(slot.duration.split(" ")[0])
  const endDate = new Date(date.getTime() + durationHours * 60 * 60 * 1000)
  const endTime = endDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  })

  return (
    <button
      onClick={() => onSelect(slot.id)}
      disabled={disabled}
      className={cn(
        "relative w-full rounded-lg border-2 p-3 text-left transition-all",
        selected
          ? "border-blue-600 bg-blue-50"
          : "border-gray-200 hover:bg-gray-50",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">{formattedDate}</div>
          <div className="text-sm text-gray-600">
            {startTime} - {endTime} ({slot.duration})
          </div>
        </div>

        {/* Checkmark indicator when selected */}
        {selected && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
            <Check className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    </button>
  )
}
