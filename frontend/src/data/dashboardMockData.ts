export type KPI = {
  label: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
}

export type RecentCall = {
  id: string
  callerName: string
  service: string
  outcome: "Booked" | "Missed" | "Follow-up" | "Cancelled"
  duration: string
  time: string
}

export type HourlyVolume = {
  hour: string
  calls: number
}

export type AgentStat = {
  label: string
  value: string
  description: string
}

export const kpis: KPI[] = [
  { label: "Total Calls Today", value: "147", change: "+12%", changeType: "positive" },
  { label: "Bookings Made", value: "38", change: "+8%", changeType: "positive" },
  { label: "Avg Handle Time", value: "3m 24s", change: "-15s", changeType: "positive" },
  { label: "Customer Satisfaction", value: "94%", change: "+2%", changeType: "positive" },
]

export const recentCalls: RecentCall[] = [
  { id: "1", callerName: "Sarah Johnson", service: "AC Repair", outcome: "Booked", duration: "4:12", time: "2 min ago" },
  { id: "2", callerName: "Mike Chen", service: "Plumbing Inspection", outcome: "Follow-up", duration: "2:45", time: "8 min ago" },
  { id: "3", callerName: "Emily Davis", service: "Electrical Install", outcome: "Booked", duration: "5:30", time: "15 min ago" },
  { id: "4", callerName: "James Wilson", service: "HVAC Maintenance", outcome: "Missed", duration: "0:00", time: "22 min ago" },
  { id: "5", callerName: "Lisa Martinez", service: "Drain Cleaning", outcome: "Booked", duration: "3:18", time: "30 min ago" },
  { id: "6", callerName: "Robert Taylor", service: "Water Heater", outcome: "Cancelled", duration: "1:45", time: "45 min ago" },
]

export const hourlyVolume: HourlyVolume[] = [
  { hour: "8am", calls: 5 },
  { hour: "9am", calls: 12 },
  { hour: "10am", calls: 18 },
  { hour: "11am", calls: 22 },
  { hour: "12pm", calls: 15 },
  { hour: "1pm", calls: 20 },
  { hour: "2pm", calls: 25 },
  { hour: "3pm", calls: 19 },
  { hour: "4pm", calls: 8 },
  { hour: "5pm", calls: 3 },
]

export const agentStats: AgentStat[] = [
  { label: "First Call Resolution", value: "87%", description: "Resolved on first contact" },
  { label: "Booking Conversion", value: "26%", description: "Calls converted to bookings" },
  { label: "Avg Wait Time", value: "12s", description: "Before agent picks up" },
  { label: "Transfers", value: "4", description: "Escalated to human today" },
  { label: "Voicemails", value: "11", description: "Left after hours" },
  { label: "Repeat Callers", value: "18%", description: "Called within 7 days" },
]
