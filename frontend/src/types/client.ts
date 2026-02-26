// Re-export ClientData from booking types
export type { ClientData } from "@/types/booking"

// CallContext - represents live call metadata
export interface CallContext {
  queue: string
  callType: string
  startedAt: Date
}

// ClientLookupParams - URL parameters for client lookup
export interface ClientLookupParams {
  customerUuid: string | null
  phoneNumber: string | null
  sessionUuid: string | null
}
