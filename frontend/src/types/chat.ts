export type MessageRole = "assistant" | "user" | "system"

export type TextMessage = {
  id: string
  role: MessageRole
  type: "text"
  content: string
  timestamp: Date
}

export type ClassifyVisitMessage = {
  id: string
  role: "assistant"
  type: "widget:classify_visit"
  content: string
  timestamp: Date
  data: {
    visit_type: string
    issue_summary: string
    urgency: string
    reason: string
  }
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
    availability: Array<{ slot: string; available: boolean }>
    scheduleType: string
    pricingInfo?: { label: string; price_formatted: string; duration_hours: number }
    locked?: boolean
  }
}

export type UpsellMessage = {
  id: string
  role: "assistant"
  type: "widget:upsell"
  content: string
  timestamp: Date
  data: {
    upsell_id: string
    offer_title: string
    price_formatted: string
    description: string
    locked?: boolean
  }
}

export type ToolCallResult = {
  tool_name: string
  tool_use_id: string
  input: Record<string, unknown>
  result: Record<string, unknown>
}

// Discriminated union — switch on message.type for type-safe rendering
export type ChatMessage = TextMessage | ClassifyVisitMessage | ScheduleTypeMessage | BookingSummaryMessage | UpsellMessage
