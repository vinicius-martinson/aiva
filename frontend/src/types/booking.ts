// FlowState type - defines all booking states
export type FlowState =
  | "IDLE"
  | "CLASSIFYING"
  | "AWAITING_SCHEDULE_TYPE"
  | "AWAITING_ADDRESS"
  | "VALIDATING_SERVICE"
  | "AWAITING_SLOT_SELECTION"
  | "CONFIRMING"
  | "BOOKED"
  | "ERROR"

// FlowState constants for easy reference
export const FlowState = {
  IDLE: "IDLE",
  CLASSIFYING: "CLASSIFYING",
  AWAITING_SCHEDULE_TYPE: "AWAITING_SCHEDULE_TYPE",
  AWAITING_ADDRESS: "AWAITING_ADDRESS",
  VALIDATING_SERVICE: "VALIDATING_SERVICE",
  AWAITING_SLOT_SELECTION: "AWAITING_SLOT_SELECTION",
  CONFIRMING: "CONFIRMING",
  BOOKED: "BOOKED",
  ERROR: "ERROR"
} as const

// BookingData interface - tracks booking state
export interface BookingData {
  scheduleType?: "job" | "estimate" | "notes_only"
  serviceType?: string
  address?: string
  selectedSlotId?: string
  jobId?: string
  errorMessage?: string
}

// TimeSlot interface - represents available time slot
export interface TimeSlot {
  id: string
  datetime: string // ISO 8601 format
  duration: string // e.g., "2 hours"
}

// ClientData interface - represents client information
export interface ClientData {
  name: string
  phone: string
  address: string
  previousJobs: Array<{ name: string; date: string; status: string }>
}

// ScheduleTypeOption interface - represents schedule type option
export interface ScheduleTypeOption {
  id: "job" | "estimate" | "notes_only"
  label: string
  description: string
  icon: string // lucide icon name
}
