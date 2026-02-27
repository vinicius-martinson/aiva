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
