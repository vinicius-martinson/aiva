import type { ClientData, TimeSlot, ScheduleTypeOption } from "@/types/booking"
import type { CallContext } from "@/types/client"

// Mock client - Sarah Johnson with plumbing history
export const mockClient: ClientData = {
  name: "Sarah Johnson",
  phone: "(303) 555-0147",
  address: "742 Oak Street, Denver, CO 80203",
  previousJobs: [
    { name: "Water Heater Repair", date: "2025-11-15", status: "Completed" },
    { name: "Pipe Leak Fix", date: "2025-08-22", status: "Completed" }
  ]
}

// Mock time slots - dynamically computed for 2 days from now
function generateMockTimeSlots(): TimeSlot[] {
  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() + 2)
  baseDate.setHours(0, 0, 0, 0)

  const slots: TimeSlot[] = [
    {
      id: "slot-1",
      datetime: new Date(baseDate.setHours(9, 0, 0, 0)).toISOString(),
      duration: "2 hours"
    },
    {
      id: "slot-2",
      datetime: new Date(baseDate.setHours(13, 0, 0, 0)).toISOString(),
      duration: "2 hours"
    },
    {
      id: "slot-3",
      datetime: new Date(baseDate.setHours(15, 0, 0, 0)).toISOString(),
      duration: "2 hours"
    }
  ]

  return slots
}

export const mockTimeSlots: TimeSlot[] = generateMockTimeSlots()

// Mock call context - live call metadata
export const mockCallContext: CallContext = {
  queue: "General Support",
  callType: "Inbound",
  startedAt: new Date()
}

// Schedule type options - the three workflow types
export const scheduleTypeOptions: ScheduleTypeOption[] = [
  { id: "job", label: "Job", description: "Schedule service work", icon: "Calendar" },
  { id: "estimate", label: "Estimate", description: "Get a quote", icon: "FileText" },
  { id: "notes_only", label: "Notes Only", description: "Save call notes", icon: "ClipboardList" }
]
