export type MessageRole = "assistant" | "user" | "system"

export type TextMessage = {
  id: string
  role: MessageRole
  type: "text"
  content: string
  timestamp: Date
}

// Phase 2+ widget types — defined now for forward compatibility
export type ScheduleTypeMessage = {
  id: string
  role: "assistant"
  type: "widget:schedule_type"
  content: string
  timestamp: Date
  data: {
    options: Array<{ id: string; label: string; description: string }>
    locked?: boolean
  }
}

export type BookingSummaryMessage = {
  id: string
  role: "assistant"
  type: "widget:booking_summary"
  content: string
  timestamp: Date
  data: {
    client: { name: string; phone: string; address: string }
    timeSlots: Array<{ id: string; datetime: string; duration: string }>
    scheduleType: string
    locked?: boolean
  }
}

// Discriminated union — switch on message.type for type-safe rendering
export type ChatMessage = TextMessage | ScheduleTypeMessage | BookingSummaryMessage
