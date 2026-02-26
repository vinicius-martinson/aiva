import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useChat } from "@/contexts/ChatContext"
import { FlowState } from "@/types/booking"
import { TimeSlotCard } from "./TimeSlotCard"

interface BookingSummaryWidgetProps {
  messageId: string
  data: {
    client: { name: string; phone: string; address: string }
    timeSlots: Array<{ id: string; datetime: string; duration: string }>
    scheduleType: string
  }
  locked?: boolean
}

export function BookingSummaryWidget({ messageId, data, locked }: BookingSummaryWidgetProps) {
  // Pre-select first time slot by default
  const [selectedSlot, setSelectedSlot] = useState<string>(data.timeSlots[0]?.id)
  const { dispatch } = useChat()

  const handleEdit = () => {
    // Roll back to address input step
    dispatch({
      type: "TRANSITION_STATE",
      payload: {
        nextState: FlowState.AWAITING_ADDRESS,
        data: { selectedSlotId: undefined }
      }
    })
  }

  const handleConfirm = () => {
    // Lock widget immediately
    dispatch({ type: "LOCK_MESSAGE", payload: { messageId } })

    // Generate job ID
    const jobId = `JOB-${Math.floor(Math.random() * 90000) + 10000}`

    // Get selected slot for success message
    const selectedSlotData = data.timeSlots.find((slot) => slot.id === selectedSlot)
    const slotDate = selectedSlotData
      ? new Date(selectedSlotData.datetime).toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        })
      : ""

    // Show typing indicator
    dispatch({ type: "SET_TYPING", payload: true })

    // Simulate AI processing, then show success message
    setTimeout(() => {
      dispatch({ type: "SET_TYPING", payload: false })
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "text",
          content: `Job #${jobId} created for ${slotDate}. The appointment has been confirmed.`,
          timestamp: new Date()
        }
      })

      // Transition to BOOKED state
      dispatch({
        type: "TRANSITION_STATE",
        payload: {
          nextState: FlowState.BOOKED,
          data: { selectedSlotId: selectedSlot, jobId }
        }
      })
    }, 800)
  }

  return (
    <div
      className={cn(
        "mt-3 space-y-4 rounded-lg border p-4",
        locked && "pointer-events-none opacity-60"
      )}
    >
      {/* Header with title and Draft badge */}
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

      {/* Client info grid */}
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
      </div>

      {/* Time slots section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">Select Time Slot:</label>
        <div className="space-y-2">
          {data.timeSlots.map((slot) => (
            <TimeSlotCard
              key={slot.id}
              slot={slot}
              selected={selectedSlot === slot.id}
              disabled={!!locked}
              onSelect={setSelectedSlot}
            />
          ))}
        </div>
      </div>

      {/* Action buttons */}
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
