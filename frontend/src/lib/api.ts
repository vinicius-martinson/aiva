/**
 * API Abstraction Layer
 *
 * MOCK-01: Single swap point for replacing mock data with real backend calls
 *
 * Current: Returns mock data with simulated network delays
 * Future: Replace function bodies with actual fetch/axios calls to backend
 */

import { mockClient, mockTimeSlots, mockCallContext } from "./mockData"
import type { ClientData, TimeSlot } from "@/types/booking"
import type { CallContext } from "@/types/client"

/**
 * Get client data by UUID or phone number
 * @param customerUuid - Customer UUID (e.g., "sarah-johnson-uuid")
 * @param phoneNumber - Phone number (e.g., "(303) 555-0147")
 * @returns ClientData if found, null if unknown caller
 */
export async function getClientData(
  customerUuid: string | null,
  phoneNumber: string | null
): Promise<ClientData | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Mock implementation: recognize Sarah Johnson by UUID or phone
  if (customerUuid === "sarah-johnson-uuid") {
    return mockClient
  }

  if (phoneNumber === "(303) 555-0147") {
    return mockClient
  }

  // Unknown caller
  return null

  /* FUTURE REAL API PATTERN:
  const params = new URLSearchParams()
  if (customerUuid) params.append("customer_uuid", customerUuid)
  if (phoneNumber) params.append("phone_number", phoneNumber)

  const response = await fetch(`/api/clients?${params}`)
  if (!response.ok) return null
  return response.json()
  */
}

/**
 * Get available time slots for an address
 * @param address - Service address
 * @returns Array of available TimeSlots
 */
export async function getTimeSlots(address: string): Promise<TimeSlot[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600))

  // Mock implementation: return pre-generated slots
  return mockTimeSlots

  /* FUTURE REAL API PATTERN:
  const response = await fetch("/api/time-slots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address })
  })
  if (!response.ok) throw new Error("Failed to fetch time slots")
  return response.json()
  */
}

/**
 * Get current call context metadata
 * @returns CallContext with queue, call type, and start time
 */
export async function getCallContext(): Promise<CallContext> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300))

  // Mock implementation: return mock context
  return mockCallContext

  /* FUTURE REAL API PATTERN:
  const sessionUuid = new URLSearchParams(window.location.search)
    .get("csr_ai_phone_session_uuid")

  const response = await fetch(`/api/call-context/${sessionUuid}`)
  if (!response.ok) throw new Error("Failed to fetch call context")
  return response.json()
  */
}
