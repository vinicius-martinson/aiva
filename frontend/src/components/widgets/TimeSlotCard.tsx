import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeSlotCardProps {
  slot: { slot: string; available: boolean }
  selected: boolean
  disabled: boolean
  onSelect: (slot: string) => void
}

export function TimeSlotCard({ slot, selected, disabled, onSelect }: TimeSlotCardProps) {
  return (
    <button
      onClick={() => onSelect(slot.slot)}
      disabled={disabled}
      className={cn(
        "relative w-full rounded-lg border-2 p-3 text-left transition-all",
        selected
          ? "border-purple-500 bg-purple-50"
          : "border-gray-200 hover:bg-gray-50",
        disabled && "cursor-not-allowed opacity-60",
        !slot.available && "bg-gray-50"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">{slot.slot}</div>
          {!slot.available && (
            <div className="text-sm text-red-500">Unavailable</div>
          )}
        </div>

        {selected && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500">
            <Check className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    </button>
  )
}
