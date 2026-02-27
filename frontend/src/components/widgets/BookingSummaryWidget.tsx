import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useChat } from "@/contexts/ChatContext"
import { TimeSlotCard } from "./TimeSlotCard"

interface BookingSummaryWidgetProps {
  messageId: string
  data: {
    client: { name: string; phone: string; address: string }
    availability: Array<{ slot: string; available: boolean }>
    scheduleType: string
    pricingInfo?: { label: string; price_formatted: string; duration_hours: number }
  }
  locked?: boolean
}

export function BookingSummaryWidget({ messageId, data, locked }: BookingSummaryWidgetProps) {
  const availableSlots = data.availability.filter(s => s.available)
  const [selectedSlot, setSelectedSlot] = useState<string>(availableSlots[0]?.slot ?? "")
  const { dispatch, sendText } = useChat()

  const handleEdit = () => {
    sendText("I'd like to change the details")
  }

  const handleConfirm = () => {
    dispatch({ type: "LOCK_MESSAGE", payload: { messageId } })
    sendText(`I'd like the ${selectedSlot} slot please`)
  }

  return (
    <div
      className={cn(
        "mt-3 space-y-4 rounded-lg border p-4",
        locked && "pointer-events-none opacity-60"
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Booking Summary</h3>
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-medium",
            locked ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
          )}
        >
          {locked ? "Confirmed" : "Draft"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-600">Client: </span>
          <span className="font-medium">{data.client.name}</span>
        </div>
        <div>
          <span className="text-gray-600">Phone: </span>
          <span>{data.client.phone}</span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-600">Address: </span>
          <span>{data.client.address}</span>
        </div>
        <div>
          <span className="text-gray-600">Type: </span>
          <span className="capitalize">{data.scheduleType.replace("_", " ")}</span>
        </div>
        {data.pricingInfo && (
          <>
            <div>
              <span className="text-gray-600">Service: </span>
              <span>{data.pricingInfo.label}</span>
            </div>
            <div>
              <span className="text-gray-600">Price: </span>
              <span className="font-medium">{data.pricingInfo.price_formatted}</span>
            </div>
            <div>
              <span className="text-gray-600">Duration: </span>
              <span>{data.pricingInfo.duration_hours} hours</span>
            </div>
          </>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">Select Time Slot:</label>
        <div className="space-y-2">
          {data.availability.map((slot) => (
            <TimeSlotCard
              key={slot.slot}
              slot={slot}
              selected={selectedSlot === slot.slot}
              disabled={!!locked || !slot.available}
              onSelect={setSelectedSlot}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleEdit} disabled={!!locked}>
          Edit
        </Button>
        <Button onClick={handleConfirm} disabled={!!locked} className="flex-1">
          Confirm & Create Job
        </Button>
      </div>
    </div>
  )
}
